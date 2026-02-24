"""ATLAS YAML ingestion service.

Fetches the compiled ATLAS.yaml from the mitre-atlas/atlas-data repository,
parses it, and inserts all entities into the local SQLite database.
"""

import hashlib
import logging
import sqlite3
from datetime import datetime, timezone

import httpx
import yaml

from ..config import ATLAS_YAML_URL

logger = logging.getLogger(__name__)


def extract_id(value) -> str:
    """Extract ID from a value that could be a string ID or a dict with 'id' key.

    In the compiled ATLAS.yaml, most cross-references are plain ID strings.
    However, if YAML anchors are used, they may resolve to full objects.
    This helper handles both cases.
    """
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return value.get("id", "")
    return str(value)


def _clear_all_tables(conn: sqlite3.Connection) -> None:
    """Delete all rows from ATLAS data tables (full refresh)."""
    tables = [
        "case_study_procedures",
        "references_",
        "mitigation_techniques",
        "mitigation_lifecycle",
        "technique_tactics",
        "case_studies",
        "mitigations",
        "techniques",
        "tactics",
        "atlas_metadata",
    ]
    for table in tables:
        conn.execute(f"DELETE FROM {table}")


def _insert_tactics(conn: sqlite3.Connection, tactics: list) -> int:
    """Insert tactic records and return the count."""
    count = 0
    for order, tactic in enumerate(tactics):
        attck_ref = tactic.get("ATT&CK-reference") or {}
        conn.execute(
            """INSERT INTO tactics (id, name, description, matrix_order,
               attck_id, attck_url, created_date, modified_date)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                tactic["id"],
                tactic["name"],
                tactic.get("description", ""),
                order,
                attck_ref.get("id"),
                attck_ref.get("url"),
                _coerce_str(tactic.get("created_date")),
                _coerce_str(tactic.get("modified_date")),
            ),
        )
        count += 1
    return count


def _insert_techniques(conn: sqlite3.Connection, techniques: list) -> tuple[int, int]:
    """Insert technique records. Returns (technique_count, subtechnique_count)."""
    tech_count = 0
    subtech_count = 0

    for tech in techniques:
        parent_id_raw = tech.get("subtechnique-of")
        is_sub = parent_id_raw is not None
        parent_id = extract_id(parent_id_raw) if is_sub else None

        attck_ref = tech.get("ATT&CK-reference") or {}
        conn.execute(
            """INSERT INTO techniques (id, name, description, is_subtechnique,
               parent_technique_id, maturity, attck_id, attck_url,
               created_date, modified_date)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                tech["id"],
                tech["name"],
                tech.get("description", ""),
                is_sub,
                parent_id,
                tech.get("maturity"),
                attck_ref.get("id"),
                attck_ref.get("url"),
                _coerce_str(tech.get("created_date")),
                _coerce_str(tech.get("modified_date")),
            ),
        )

        if is_sub:
            subtech_count += 1
        else:
            tech_count += 1

        # Insert technique-tactic junction records
        for tactic_ref in tech.get("tactics", []):
            tactic_id = extract_id(tactic_ref)
            if tactic_id:
                conn.execute(
                    """INSERT OR IGNORE INTO technique_tactics
                       (technique_id, tactic_id) VALUES (?, ?)""",
                    (tech["id"], tactic_id),
                )

    return tech_count, subtech_count


def _coerce_str(value) -> str | None:
    """Coerce a value to string. Handles date objects, lists, etc."""
    if value is None:
        return None
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    return str(value)


def _insert_mitigations(conn: sqlite3.Connection, mitigations: list) -> int:
    """Insert mitigation records with technique mappings and lifecycle stages."""
    count = 0
    for mit in mitigations:
        attck_ref = mit.get("ATT&CK-reference") or {}
        category = mit.get("category")
        if isinstance(category, list):
            category = ", ".join(str(c) for c in category)
        conn.execute(
            """INSERT INTO mitigations (id, name, description, category,
               created_date, modified_date, attck_id, attck_url)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                mit["id"],
                mit["name"],
                mit.get("description", ""),
                category,
                _coerce_str(mit.get("created_date")),
                _coerce_str(mit.get("modified_date")),
                attck_ref.get("id"),
                attck_ref.get("url"),
            ),
        )
        count += 1

        # Technique mappings (field is "use" not "usage" in ATLAS YAML)
        for tech_map in mit.get("techniques", []):
            if isinstance(tech_map, dict):
                tech_id = tech_map.get("id", "")
                usage = tech_map.get("use", "") or tech_map.get("usage", "")
            else:
                tech_id = extract_id(tech_map)
                usage = ""
            if tech_id:
                conn.execute(
                    """INSERT OR IGNORE INTO mitigation_techniques
                       (mitigation_id, technique_id, usage) VALUES (?, ?, ?)""",
                    (mit["id"], tech_id, usage),
                )

        # ML lifecycle stages
        for stage in mit.get("ml-lifecycle", []):
            conn.execute(
                """INSERT OR IGNORE INTO mitigation_lifecycle
                   (mitigation_id, lifecycle_stage) VALUES (?, ?)""",
                (mit["id"], stage),
            )

    return count


def _insert_case_studies(conn: sqlite3.Connection, case_studies: list) -> int:
    """Insert case study records with procedure steps and references."""
    count = 0
    for cs in case_studies:
        conn.execute(
            """INSERT INTO case_studies (id, name, summary, incident_date,
               incident_date_granularity, reporter, target, actor, case_study_type)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                cs["id"],
                cs["name"],
                cs.get("summary", ""),
                _coerce_str(cs.get("incident-date")),
                cs.get("incident-date-granularity"),
                cs.get("reporter"),
                cs.get("target"),
                cs.get("actor"),
                cs.get("case-study-type"),
            ),
        )
        count += 1

        # Procedure steps
        for step_order, step in enumerate(cs.get("procedure", [])):
            tactic_id = extract_id(step.get("tactic", ""))
            technique_id = extract_id(step.get("technique", ""))
            conn.execute(
                """INSERT INTO case_study_procedures
                   (case_study_id, step_order, tactic_id, technique_id, description)
                   VALUES (?, ?, ?, ?, ?)""",
                (
                    cs["id"],
                    step_order,
                    tactic_id,
                    technique_id,
                    step.get("description", ""),
                ),
            )

        # References
        for ref in cs.get("references", []):
            conn.execute(
                """INSERT INTO references_ (entity_type, entity_id, title, url)
                   VALUES (?, ?, ?, ?)""",
                ("case_study", cs["id"], ref.get("title"), ref.get("url")),
            )

    return count


def _rebuild_fts(conn: sqlite3.Connection) -> None:
    """Rebuild FTS indexes from the content tables."""
    conn.execute("DELETE FROM techniques_fts")
    conn.execute(
        """INSERT INTO techniques_fts (id, name, description)
           SELECT id, name, description FROM techniques"""
    )

    conn.execute("DELETE FROM case_studies_fts")
    conn.execute(
        """INSERT INTO case_studies_fts (id, name, summary)
           SELECT id, name, summary FROM case_studies"""
    )


def ingest_atlas(conn: sqlite3.Connection) -> dict:
    """Fetch and ingest ATLAS.yaml into the database.

    Returns a dict with ingestion statistics.
    """
    logger.info("Fetching ATLAS.yaml from %s", ATLAS_YAML_URL)
    print(f"Fetching ATLAS.yaml from {ATLAS_YAML_URL} ...")

    response = httpx.get(ATLAS_YAML_URL, timeout=60.0, follow_redirects=True)
    response.raise_for_status()
    raw_yaml = response.content

    checksum = hashlib.sha256(raw_yaml).hexdigest()
    logger.info("SHA-256 checksum: %s", checksum)
    print(f"SHA-256 checksum: {checksum}")

    data = yaml.safe_load(raw_yaml)

    version = data.get("version", "unknown")
    atlas_id = data.get("id", "ATLAS")
    atlas_name = data.get("name", "ATLAS")

    # Extract entities from first matrix
    matrix = data.get("matrices", [{}])[0]
    tactics = matrix.get("tactics", [])
    techniques = matrix.get("techniques", [])
    mitigations = matrix.get("mitigations", [])
    case_studies = data.get("case-studies", [])

    print(f"Parsed ATLAS v{version}: "
          f"{len(tactics)} tactics, {len(techniques)} techniques, "
          f"{len(mitigations)} mitigations, {len(case_studies)} case studies")

    try:
        conn.execute("BEGIN")

        # Full refresh: clear existing data
        print("Clearing existing data ...")
        _clear_all_tables(conn)

        # Insert entities
        print("Inserting tactics ...")
        tactic_count = _insert_tactics(conn, tactics)
        print(f"  -> {tactic_count} tactics inserted")

        print("Inserting techniques ...")
        tech_count, subtech_count = _insert_techniques(conn, techniques)
        print(f"  -> {tech_count} techniques, {subtech_count} subtechniques inserted")

        print("Inserting mitigations ...")
        mit_count = _insert_mitigations(conn, mitigations)
        print(f"  -> {mit_count} mitigations inserted")

        print("Inserting case studies ...")
        cs_count = _insert_case_studies(conn, case_studies)
        print(f"  -> {cs_count} case studies inserted")

        # Update metadata
        now_iso = datetime.now(timezone.utc).isoformat()
        conn.execute("DELETE FROM atlas_metadata")
        conn.execute(
            """INSERT INTO atlas_metadata (id, name, version, last_updated, source_url)
               VALUES (?, ?, ?, ?, ?)""",
            (atlas_id, atlas_name, version, now_iso, ATLAS_YAML_URL),
        )

        # Log ingestion
        conn.execute(
            """INSERT INTO ingestion_log
               (version, checksum, ingested_at,
                tactics_count, techniques_count, subtechniques_count,
                mitigations_count, case_studies_count, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                version,
                checksum,
                now_iso,
                tactic_count,
                tech_count,
                subtech_count,
                mit_count,
                cs_count,
                "success",
            ),
        )

        conn.commit()

        # Rebuild FTS indexes (must be outside explicit transaction)
        print("Rebuilding FTS indexes ...")
        _rebuild_fts(conn)
        conn.commit()

        result = {
            "status": "success",
            "version": version,
            "checksum": checksum,
            "tactics": tactic_count,
            "techniques": tech_count,
            "subtechniques": subtech_count,
            "mitigations": mit_count,
            "case_studies": cs_count,
        }
        print(f"Ingestion complete: {result}")
        logger.info("Ingestion complete: %s", result)
        return result

    except Exception:
        conn.rollback()
        logger.exception("Ingestion failed, transaction rolled back")
        print("ERROR: Ingestion failed, transaction rolled back")
        raise
