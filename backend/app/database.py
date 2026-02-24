import sqlite3
import threading
from pathlib import Path

from .config import DB_PATH

_connection: sqlite3.Connection | None = None
_lock = threading.Lock()

SCHEMA_SQL = """
-- METADATA
CREATE TABLE IF NOT EXISTS atlas_metadata (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    source_commit TEXT,
    source_url TEXT
);

CREATE TABLE IF NOT EXISTS ingestion_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    commit_hash TEXT,
    checksum TEXT NOT NULL,
    ingested_at TEXT NOT NULL,
    tactics_count INTEGER,
    techniques_count INTEGER,
    subtechniques_count INTEGER,
    mitigations_count INTEGER,
    case_studies_count INTEGER,
    status TEXT DEFAULT 'success'
);

-- CORE ENTITIES
CREATE TABLE IF NOT EXISTS tactics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    matrix_order INTEGER NOT NULL,
    attck_id TEXT,
    attck_url TEXT,
    created_date TEXT,
    modified_date TEXT
);

CREATE TABLE IF NOT EXISTS techniques (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_subtechnique BOOLEAN DEFAULT FALSE,
    parent_technique_id TEXT,
    maturity TEXT,
    attck_id TEXT,
    attck_url TEXT,
    created_date TEXT,
    modified_date TEXT,
    FOREIGN KEY (parent_technique_id) REFERENCES techniques(id)
);

CREATE TABLE IF NOT EXISTS mitigations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    created_date TEXT,
    modified_date TEXT,
    attck_id TEXT,
    attck_url TEXT
);

CREATE TABLE IF NOT EXISTS case_studies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    incident_date TEXT,
    incident_date_granularity TEXT,
    reporter TEXT,
    target TEXT,
    actor TEXT,
    case_study_type TEXT
);

-- JUNCTION TABLES
CREATE TABLE IF NOT EXISTS technique_tactics (
    technique_id TEXT NOT NULL,
    tactic_id TEXT NOT NULL,
    PRIMARY KEY (technique_id, tactic_id),
    FOREIGN KEY (technique_id) REFERENCES techniques(id),
    FOREIGN KEY (tactic_id) REFERENCES tactics(id)
);

CREATE TABLE IF NOT EXISTS mitigation_techniques (
    mitigation_id TEXT NOT NULL,
    technique_id TEXT NOT NULL,
    usage TEXT,
    PRIMARY KEY (mitigation_id, technique_id),
    FOREIGN KEY (mitigation_id) REFERENCES mitigations(id),
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

CREATE TABLE IF NOT EXISTS mitigation_lifecycle (
    mitigation_id TEXT NOT NULL,
    lifecycle_stage TEXT NOT NULL,
    PRIMARY KEY (mitigation_id, lifecycle_stage),
    FOREIGN KEY (mitigation_id) REFERENCES mitigations(id)
);

CREATE TABLE IF NOT EXISTS case_study_procedures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_study_id TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    tactic_id TEXT NOT NULL,
    technique_id TEXT NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (case_study_id) REFERENCES case_studies(id),
    FOREIGN KEY (tactic_id) REFERENCES tactics(id),
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

CREATE TABLE IF NOT EXISTS references_ (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    title TEXT,
    url TEXT
);

-- OSINT & ENRICHMENT
CREATE TABLE IF NOT EXISTS osint_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technique_id TEXT NOT NULL,
    source TEXT NOT NULL,
    title TEXT,
    url TEXT,
    summary TEXT,
    relevance_score REAL,
    fetched_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

CREATE TABLE IF NOT EXISTS github_repos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technique_id TEXT NOT NULL,
    repo_full_name TEXT NOT NULL,
    description TEXT,
    stars INTEGER,
    language TEXT,
    url TEXT,
    category TEXT,
    last_updated TEXT,
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

CREATE TABLE IF NOT EXISTS killchains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    source_case_study_id TEXT,
    severity TEXT,
    attack_category TEXT,
    year INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (source_case_study_id) REFERENCES case_studies(id)
);

CREATE TABLE IF NOT EXISTS killchain_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    killchain_id INTEGER NOT NULL,
    step_order INTEGER NOT NULL,
    tactic_id TEXT,
    technique_id TEXT,
    description TEXT,
    indicators TEXT,
    mitigations TEXT,
    FOREIGN KEY (killchain_id) REFERENCES killchains(id),
    FOREIGN KEY (tactic_id) REFERENCES tactics(id),
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

CREATE TABLE IF NOT EXISTS technique_search_terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technique_id TEXT NOT NULL,
    source TEXT NOT NULL,
    search_term TEXT NOT NULL,
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_techniques_parent ON techniques(parent_technique_id);
CREATE INDEX IF NOT EXISTS idx_techniques_subtechnique ON techniques(is_subtechnique);
CREATE INDEX IF NOT EXISTS idx_technique_tactics_tactic ON technique_tactics(tactic_id);
CREATE INDEX IF NOT EXISTS idx_mitigation_techniques_technique ON mitigation_techniques(technique_id);
CREATE INDEX IF NOT EXISTS idx_case_study_procedures_case ON case_study_procedures(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_procedures_technique ON case_study_procedures(technique_id);
CREATE INDEX IF NOT EXISTS idx_references_entity ON references_(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_osint_results_technique ON osint_results(technique_id);
CREATE INDEX IF NOT EXISTS idx_github_repos_technique ON github_repos(technique_id);
CREATE INDEX IF NOT EXISTS idx_killchain_steps_killchain ON killchain_steps(killchain_id);
CREATE INDEX IF NOT EXISTS idx_technique_search_terms ON technique_search_terms(technique_id, source);
"""

FTS_SQL = """
CREATE VIRTUAL TABLE IF NOT EXISTS techniques_fts USING fts5(
    id, name, description
);

CREATE VIRTUAL TABLE IF NOT EXISTS case_studies_fts USING fts5(
    id, name, summary
);
"""


def _ensure_data_dir() -> None:
    """Ensure the directory for the database file exists."""
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)


def init_db(conn: sqlite3.Connection) -> None:
    """Create all tables, indexes, and FTS virtual tables."""
    conn.executescript(SCHEMA_SQL)
    conn.executescript(FTS_SQL)


def get_db() -> sqlite3.Connection:
    """Return the singleton database connection, creating it if needed.

    The connection is thread-safe (check_same_thread=False), uses WAL mode,
    and has foreign keys enabled.
    """
    global _connection
    if _connection is not None:
        return _connection

    with _lock:
        # Double-check after acquiring the lock
        if _connection is not None:
            return _connection

        _ensure_data_dir()

        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")

        init_db(conn)

        _connection = conn
        return _connection
