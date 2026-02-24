# MITRE ATLAS Data Ingestion Research Report

## 1. ATLAS Matrix Structure Overview

### What is MITRE ATLAS?
MITRE ATLAS (Adversarial Threat Landscape for Artificial-Intelligence Systems) is a globally accessible adversarial ML knowledge base documenting adversary tactics, techniques, and procedures (TTPs) specifically targeting AI/ML systems. Launched June 2021, modeled after MITRE ATT&CK.

### Current Stats (v5.4.0 - February 2026)
- **16 Tactics** (columns in the matrix)
- **84+ Techniques** (rows under tactics)
- **56+ Sub-techniques** (specialized variants of techniques)
- **34 Mitigations** (defensive countermeasures)
- **52 Case Studies** (real-world incidents and exercises)

### Tactic Ordering (Kill Chain Flow)

| Order | ID | Tactic Name | Description |
|-------|-----|-------------|-------------|
| 1 | AML.TA0002 | Reconnaissance | Gathering intelligence about target AI |
| 2 | AML.TA0003 | Resource Development | Establishing attack infrastructure |
| 3 | AML.TA0004 | Initial Access | Entry vectors to AI system |
| 4 | AML.TA0000 | ML Model Access | Gaining access to the AI model |
| 5 | AML.TA0005 | Execution | Running malicious code in AI artifacts |
| 6 | AML.TA0006 | Persistence | Maintaining access via ML artifacts |
| 7 | AML.TA0012 | Privilege Escalation | Obtaining elevated permissions |
| 8 | AML.TA0007 | Defense Evasion | Avoiding AI-enabled security |
| 9 | AML.TA0013 | Credential Access | Stealing accounts/passwords |
| 10 | AML.TA0008 | Discovery | Mapping the AI environment |
| 11 | AML.TA0015 | Lateral Movement | Pivoting through ML infrastructure |
| 12 | AML.TA0009 | Collection | Gathering AI artifacts |
| 13 | AML.TA0001 | ML Attack Staging | Preparing attacks via proxy models |
| 14 | AML.TA0014 | Command and Control | Communicating with compromised systems |
| 15 | AML.TA0010 | Exfiltration | Stealing models/data |
| 16 | AML.TA0011 | Impact | Manipulate/destroy AI systems |

Note: 13 tactics inherited from ATT&CK (applied to AI context) + 3 AI-specific tactics (ML Model Access, ML Attack Staging, Lateral Movement for ML).

### Hierarchy
```
Matrix
  -> Tactic (16 total, ordered columns)
      -> Technique (84+, a technique can belong to MULTIPLE tactics)
          -> Sub-technique (56+, each belongs to exactly ONE parent technique)
              -> Procedure (within case studies, maps technique to real-world usage)
  -> Mitigation (34, each maps to MULTIPLE techniques)
  -> Case Study (52, each contains a sequence of procedure steps)
```

### Key Relationships (Many-to-Many)
- **Technique <-> Tactic**: A technique can appear under multiple tactics
- **Technique <-> Mitigation**: A mitigation addresses multiple techniques; a technique can be addressed by multiple mitigations
- **Case Study -> Procedure Steps**: Each case study has an ordered list of procedure steps, each linking one tactic + one technique

---

## 2. Data Sources and Formats

### Primary Source: `mitre-atlas/atlas-data` GitHub Repository

**Repository URL**: https://github.com/mitre-atlas/atlas-data

**Directory Structure**:
```
atlas-data/
  data/
    data.yaml           # Entry point - defines id, name, version, includes
    matrix.yaml          # Matrix definition with tactic ordering
    tactics.yaml         # All 16 tactic definitions
    techniques.yaml      # All techniques + subtechniques
    mitigations.yaml     # All mitigations with technique mappings
    case-studies/        # 52 individual YAML files (AML.CS0000.yaml - AML.CS0051.yaml)
  dist/
    ATLAS.yaml           # Single compiled output file (ALL data in one file)
    schemas/
      atlas_output_schema.json            # JSON Schema for ATLAS.yaml
      atlas_website_case_study_schema.json # JSON Schema for case studies
  schemas/               # Source schema definitions
  tools/                 # Python scripts for generation and import
  tests/                 # pytest validation
```

### Secondary Source: `mitre-atlas/atlas-navigator-data` Repository

**Repository URL**: https://github.com/mitre-atlas/atlas-navigator-data

**Provides**:
- `dist/stix-atlas.json` - ATLAS matrix in STIX 2.1 format
- `dist/stix-atlas-attack-enterprise.json` - ATLAS + ATT&CK Enterprise combined
- `dist/opencti-bundles/` - Case studies as STIX 2.1 bundles for OpenCTI
- `dist/case-study-navigator-layers/` - Navigator layer files
- `dist/default-navigator-layers/` - Default matrix views

### Data Format Details

#### YAML Format (Primary - from atlas-data)

**Tactic Object**:
```yaml
- &reconnaissance
  id: AML.TA0002
  object-type: tactic
  name: Reconnaissance
  description: "Gathering information about target AI capabilities..."
  ATT&CK-reference:
    id: TA0043
    url: https://attack.mitre.org/tactics/TA0043/
  created_date: 2021-01-01
  modified_date: 2025-11-01
```

**Technique Object**:
```yaml
- &search_open_technical_databases
  id: AML.T0000
  object-type: technique
  name: Search Open Technical Databases
  description: "Adversaries may search open technical databases..."
  tactics:
    - *reconnaissance       # YAML anchor reference
  ATT&CK-reference:
    id: T1596
    url: https://attack.mitre.org/techniques/T1596/
  created_date: 2021-01-01
  modified_date: 2024-11-01
```

**Sub-technique Object**:
```yaml
- id: AML.T0000.000
  object-type: technique
  name: Journals and Conference Proceedings
  description: "..."
  subtechnique-of: *search_open_technical_databases  # Reference to parent
```

**Technique with Maturity** (added v5.0.0):
```yaml
  maturity: demonstrated   # One of: feasible, demonstrated, realized
```

**Mitigation Object**:
```yaml
- &limit_release
  id: AML.M0000
  object-type: mitigation
  name: Limit Model Artifact Release
  description: "..."
  category: Policy          # One of: Policy, Technical-ML, Technical-Cyber
  ml-lifecycle:              # Applicable ML lifecycle stages
    - Business Understanding
    - Monitoring and Maintenance
  techniques:
    - id: *victim_research_preprint
      usage: "Limit release of technical project information..."
    - id: *search_victim_website
      usage: "..."
  created_date: 2022-04-01
  modified_date: 2025-12-01
```

**Case Study Object**:
```yaml
id: AML.CS0000
name: "Evasion of Deep Learning Detector for Malware C&C Traffic"
object-type: case-study
summary: "..."
incident-date: 2020-01-01
incident-date-granularity: YEAR    # YEAR, MONTH, or DATE
target: "Palo Alto Networks malware detection system"
actor: "Palo Alto Networks AI Research Team"
case-study-type: exercise          # "incident" or "exercise"
procedure:
  - tactic: *reconnaissance
    technique: *victim_research_preprint
    description: "Identified URLNet as a target approach..."
  - tactic: *resource_development
    technique: *acquire_ml_artifacts_data
    description: "Obtained ~33M benign and ~27M malicious..."
references:
  - title: "URLNet: Learning a URL representation..."
    url: https://arxiv.org/abs/1802.03162
```

#### STIX 2.1 Format (from atlas-navigator-data)

ATLAS maps to these STIX object types:

| ATLAS Concept | STIX Object Type | Custom Properties |
|---------------|-----------------|-------------------|
| Collection | `x-mitre-collection` | `x_mitre_contents` |
| Matrix | `x-mitre-matrix` | `tactic_refs` |
| Tactic | `x-mitre-tactic` | Standard |
| Technique | `attack-pattern` | `kill_chain_phases` |
| Sub-technique | `attack-pattern` | `x_mitre_is_subtechnique: true` |
| Mitigation | `course-of-action` | Standard |
| Case Study | Report + Incident | OpenCTI bundles |

**STIX Relationships**:
- `subtechnique-of`: sub-technique -> parent technique
- `mitigates`: course-of-action -> attack-pattern

#### Compiled ATLAS.yaml (Single File Distribution)

Top-level structure:
```yaml
id: ATLAS
name: "Adversarial Threat Landscape for AI Systems"
version: "5.4.0"
matrices:
  - id: ATLAS
    name: "ATLAS Matrix"
    tactics: [...]        # Ordered list of all tactic objects
    techniques: [...]     # All technique + subtechnique objects
    mitigations: [...]    # All mitigation objects
case-studies: [...]       # All case study objects
```

---

## 3. Update Frequency and Versioning

### Release History (Recent)

| Version | Date | Changes |
|---------|------|---------|
| v5.4.0 | 2026-02-06 | +7 techniques (AI agent focus), +4 case studies |
| v5.3.0 | 2026-01-30 | +1 technique (Deploy AI Agent), +3 case studies |
| v5.2.0 | 2025-12-24 | +7 techniques, +3 mitigations, updated 30 mitigations |
| v5.1.1 | 2025-11-25 | Minor case study reference fixes |
| v5.1.0 | 2025-11-06 | +10 techniques, +6 mitigations, +9 case studies |
| v5.0.1 | 2025-10-15 | Typo fixes |
| v5.0.0 | 2025-10-15 | Added "Technique Maturity" field |
| v4.9.1 | 2024-08-13 | Language refinements |
| v4.9.0 | 2024-04-22 | +11 techniques, added C2 tactic |
| v4.4.0 | 2023-04-13 | Initial tracked release |

### Update Pattern
- **Frequency**: Multiple releases per quarter (accelerating in 2025-2026)
- **Total Releases**: 15 on GitHub
- **Total Commits**: 286 on main branch
- **Semantic Versioning**: Major.Minor.Patch
- **Trend**: Increasingly frequent updates, especially for AI agent/LLM threats

### How to Detect Updates
1. **GitHub Releases API**: `GET https://api.github.com/repos/mitre-atlas/atlas-data/releases`
2. **Git Tags**: Compare latest tag vs stored tag
3. **Version Field**: Compare `version` field in `data.yaml` or `ATLAS.yaml`
4. **Commit Hash**: Track latest commit on main branch
5. **GitHub RSS Feed**: `https://github.com/mitre-atlas/atlas-data/releases.atom`

---

## 4. Database Schema Design

### Recommendation: SQLite

**Why SQLite over PostgreSQL or MongoDB?**

| Criterion | SQLite | PostgreSQL | MongoDB |
|-----------|--------|------------|---------|
| Setup complexity | Zero config, single file | Server required | Server required |
| Portability | Single .db file, copy anywhere | Requires pg_dump/restore | Requires mongodump |
| Data size | ~200 objects total, tiny dataset | Overkill for this scale | Overkill for this scale |
| Relationships | Strong with junction tables | Native, but unnecessary | Weak (document model) |
| Querying | Full SQL, FTS5 for text search | Advanced, unnecessary | Aggregation pipeline |
| Python support | Built-in `sqlite3` module | Requires psycopg2 | Requires pymongo |
| Embedding in app | Perfect for desktop/web app | External dependency | External dependency |
| Concurrency | Single-writer sufficient | Multi-writer, unnecessary | Multi-writer, unnecessary |

**Verdict**: SQLite is ideal. The dataset is small (~200 core objects + 52 case studies), read-heavy, and benefits from zero-config portability. Full-text search via FTS5 enables technique/description searching.

### Proposed Schema (SQLite)

```sql
-- =====================================================
-- METADATA
-- =====================================================
CREATE TABLE atlas_metadata (
    id TEXT PRIMARY KEY,        -- 'ATLAS'
    name TEXT NOT NULL,
    version TEXT NOT NULL,      -- e.g., '5.4.0'
    last_updated TEXT NOT NULL, -- ISO 8601 timestamp
    source_commit TEXT,         -- Git commit hash
    source_url TEXT             -- GitHub repo URL
);

-- =====================================================
-- CORE ENTITIES
-- =====================================================
CREATE TABLE tactics (
    id TEXT PRIMARY KEY,           -- e.g., 'AML.TA0002'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    matrix_order INTEGER NOT NULL, -- Position in matrix (1-16)
    attck_id TEXT,                 -- ATT&CK reference ID
    attck_url TEXT,                -- ATT&CK reference URL
    created_date TEXT,
    modified_date TEXT
);

CREATE TABLE techniques (
    id TEXT PRIMARY KEY,           -- e.g., 'AML.T0000' or 'AML.T0000.000'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_subtechnique BOOLEAN DEFAULT FALSE,
    parent_technique_id TEXT,      -- NULL for top-level, FK for subtechniques
    maturity TEXT,                 -- 'feasible', 'demonstrated', 'realized', or NULL
    attck_id TEXT,
    attck_url TEXT,
    created_date TEXT,
    modified_date TEXT,
    FOREIGN KEY (parent_technique_id) REFERENCES techniques(id)
);

CREATE TABLE mitigations (
    id TEXT PRIMARY KEY,           -- e.g., 'AML.M0000'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,                 -- 'Policy', 'Technical-ML', 'Technical-Cyber'
    created_date TEXT,
    modified_date TEXT,
    attck_id TEXT,
    attck_url TEXT
);

CREATE TABLE case_studies (
    id TEXT PRIMARY KEY,           -- e.g., 'AML.CS0000'
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    incident_date TEXT,            -- ISO date
    incident_date_granularity TEXT,-- 'YEAR', 'MONTH', 'DATE'
    reporter TEXT,
    target TEXT,
    actor TEXT,
    case_study_type TEXT           -- 'incident' or 'exercise'
);

-- =====================================================
-- JUNCTION / RELATIONSHIP TABLES
-- =====================================================

-- Many-to-many: Technique <-> Tactic
CREATE TABLE technique_tactics (
    technique_id TEXT NOT NULL,
    tactic_id TEXT NOT NULL,
    PRIMARY KEY (technique_id, tactic_id),
    FOREIGN KEY (technique_id) REFERENCES techniques(id),
    FOREIGN KEY (tactic_id) REFERENCES tactics(id)
);

-- Many-to-many: Mitigation <-> Technique (with usage context)
CREATE TABLE mitigation_techniques (
    mitigation_id TEXT NOT NULL,
    technique_id TEXT NOT NULL,
    usage TEXT,                     -- Description of how mitigation applies
    PRIMARY KEY (mitigation_id, technique_id),
    FOREIGN KEY (mitigation_id) REFERENCES mitigations(id),
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

-- Mitigation ML lifecycle stages
CREATE TABLE mitigation_lifecycle (
    mitigation_id TEXT NOT NULL,
    lifecycle_stage TEXT NOT NULL,  -- e.g., 'Business Understanding', 'Data Collection'
    PRIMARY KEY (mitigation_id, lifecycle_stage),
    FOREIGN KEY (mitigation_id) REFERENCES mitigations(id)
);

-- Case study procedure steps (ordered)
CREATE TABLE case_study_procedures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_study_id TEXT NOT NULL,
    step_order INTEGER NOT NULL,   -- 0-based order within case study
    tactic_id TEXT NOT NULL,
    technique_id TEXT NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (case_study_id) REFERENCES case_studies(id),
    FOREIGN KEY (tactic_id) REFERENCES tactics(id),
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

-- References (shared across all entity types)
CREATE TABLE references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,      -- 'tactic', 'technique', 'mitigation', 'case_study'
    entity_id TEXT NOT NULL,
    title TEXT,
    url TEXT
);

-- =====================================================
-- FULL-TEXT SEARCH
-- =====================================================
CREATE VIRTUAL TABLE techniques_fts USING fts5(
    id, name, description,
    content='techniques',
    content_rowid='rowid'
);

CREATE VIRTUAL TABLE case_studies_fts USING fts5(
    id, name, summary,
    content='case_studies',
    content_rowid='rowid'
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_techniques_parent ON techniques(parent_technique_id);
CREATE INDEX idx_techniques_subtechnique ON techniques(is_subtechnique);
CREATE INDEX idx_technique_tactics_tactic ON technique_tactics(tactic_id);
CREATE INDEX idx_technique_tactics_technique ON technique_tactics(technique_id);
CREATE INDEX idx_mitigation_techniques_technique ON mitigation_techniques(technique_id);
CREATE INDEX idx_case_study_procedures_case ON case_study_procedures(case_study_id);
CREATE INDEX idx_case_study_procedures_technique ON case_study_procedures(technique_id);
CREATE INDEX idx_references_entity ON references(entity_type, entity_id);
```

### Entity-Relationship Summary

```
tactics ----< technique_tactics >---- techniques
                                          |
                                          |-- parent_technique_id (self-ref for subtechniques)
                                          |
mitigations --< mitigation_techniques >---+
                                          |
case_studies --< case_study_procedures >--+
                  (ordered steps with tactic + technique)

references: polymorphic table linked by entity_type + entity_id
```

---

## 5. Ingestion Pipeline Design

### Architecture Overview

```
+------------------+     +------------------+     +------------------+
|  GitHub Source    |     |  Ingestion       |     |  SQLite DB       |
|  (atlas-data)    | --> |  Pipeline        | --> |  (atlas.db)      |
|                  |     |                  |     |                  |
|  ATLAS.yaml      |     |  1. Fetch        |     |  16 tactics      |
|  (or raw YAMLs)  |     |  2. Parse        |     |  84+ techniques  |
|  version: 5.4.0  |     |  3. Validate     |     |  34 mitigations  |
|                  |     |  4. Transform    |     |  52 case studies |
|                  |     |  5. Load         |     |  + relationships |
+------------------+     +------------------+     +------------------+
         ^                        |
         |                        v
    GitHub API             +------------------+
    (version check)        |  Ingestion Log   |
                           |  (in SQLite)     |
                           +------------------+
```

### Recommended Approach: Use `dist/ATLAS.yaml`

Rather than parsing individual source YAML files (which use custom `!include` directives and YAML anchors), use the pre-compiled `dist/ATLAS.yaml` which contains ALL data in a single file with resolved references.

**Fetch URL**: `https://raw.githubusercontent.com/mitre-atlas/atlas-data/main/dist/ATLAS.yaml`

### Pipeline Steps

#### Step 1: Version Check
```python
import requests
import hashlib

def check_for_updates(current_version, current_commit):
    """Check if ATLAS data has been updated."""
    # Option A: Check GitHub releases API
    releases = requests.get(
        "https://api.github.com/repos/mitre-atlas/atlas-data/releases/latest"
    ).json()
    latest_version = releases["tag_name"].lstrip("v")

    # Option B: Check latest commit on main
    commits = requests.get(
        "https://api.github.com/repos/mitre-atlas/atlas-data/commits/main"
    ).json()
    latest_commit = commits["sha"]

    needs_update = (
        latest_version != current_version or
        latest_commit != current_commit
    )
    return needs_update, latest_version, latest_commit
```

#### Step 2: Fetch & Parse
```python
import yaml

def fetch_atlas_data():
    """Download and parse the compiled ATLAS.yaml."""
    url = "https://raw.githubusercontent.com/mitre-atlas/atlas-data/main/dist/ATLAS.yaml"
    response = requests.get(url)
    response.raise_for_status()

    # Compute checksum for integrity
    checksum = hashlib.sha256(response.content).hexdigest()

    data = yaml.safe_load(response.text)
    return data, checksum
```

#### Step 3: Validate
```python
import jsonschema

def validate_atlas_data(data):
    """Validate against the official JSON Schema."""
    schema_url = "https://raw.githubusercontent.com/mitre-atlas/atlas-data/main/dist/schemas/atlas_output_schema.json"
    schema = requests.get(schema_url).json()
    jsonschema.validate(data, schema)
```

#### Step 4: Transform & Load
```python
def ingest_atlas_data(db_conn, data, version, commit_hash):
    """Transform YAML data and load into SQLite."""
    cursor = db_conn.cursor()

    # Begin transaction for atomic update
    cursor.execute("BEGIN TRANSACTION")

    try:
        # Clear existing data (full refresh approach)
        for table in ['references', 'case_study_procedures', 'mitigation_lifecycle',
                      'mitigation_techniques', 'technique_tactics',
                      'case_studies', 'mitigations', 'techniques', 'tactics']:
            cursor.execute(f"DELETE FROM {table}")

        matrix = data["matrices"][0]

        # 1. Insert tactics (with ordering)
        for order, tactic in enumerate(matrix["tactics"]):
            cursor.execute("""
                INSERT INTO tactics (id, name, description, matrix_order,
                    attck_id, attck_url, created_date, modified_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (tactic["id"], tactic["name"], tactic["description"],
                  order, tactic.get("ATT&CK-reference", {}).get("id"),
                  tactic.get("ATT&CK-reference", {}).get("url"),
                  tactic.get("created_date"), tactic.get("modified_date")))

        # 2. Insert techniques and subtechniques
        for tech in matrix["techniques"]:
            is_sub = "subtechnique-of" in tech
            parent_id = tech.get("subtechnique-of") if is_sub else None
            cursor.execute("""
                INSERT INTO techniques (id, name, description, is_subtechnique,
                    parent_technique_id, maturity, attck_id, attck_url,
                    created_date, modified_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (tech["id"], tech["name"], tech["description"],
                  is_sub, parent_id, tech.get("maturity"),
                  tech.get("ATT&CK-reference", {}).get("id"),
                  tech.get("ATT&CK-reference", {}).get("url"),
                  tech.get("created_date"), tech.get("modified_date")))

            # Technique-tactic relationships (only for top-level techniques)
            if not is_sub and "tactics" in tech:
                for tactic_id in tech["tactics"]:
                    cursor.execute("""
                        INSERT INTO technique_tactics (technique_id, tactic_id)
                        VALUES (?, ?)
                    """, (tech["id"], tactic_id))

        # 3. Insert mitigations
        for mit in matrix.get("mitigations", []):
            cursor.execute("""
                INSERT INTO mitigations (id, name, description, category,
                    created_date, modified_date, attck_id, attck_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (mit["id"], mit["name"], mit["description"],
                  mit.get("category"), mit.get("created_date"),
                  mit.get("modified_date"),
                  mit.get("ATT&CK-reference", {}).get("id"),
                  mit.get("ATT&CK-reference", {}).get("url")))

            # Mitigation-technique relationships
            for tech_ref in mit.get("techniques", []):
                cursor.execute("""
                    INSERT INTO mitigation_techniques
                        (mitigation_id, technique_id, usage)
                    VALUES (?, ?, ?)
                """, (mit["id"], tech_ref["id"], tech_ref.get("usage")))

            # ML lifecycle stages
            for stage in mit.get("ml-lifecycle", []):
                cursor.execute("""
                    INSERT INTO mitigation_lifecycle (mitigation_id, lifecycle_stage)
                    VALUES (?, ?)
                """, (mit["id"], stage))

        # 4. Insert case studies
        for cs in data.get("case-studies", []):
            cursor.execute("""
                INSERT INTO case_studies (id, name, summary, incident_date,
                    incident_date_granularity, reporter, target, actor,
                    case_study_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (cs["id"], cs["name"], cs["summary"],
                  cs.get("incident-date"),
                  cs.get("incident-date-granularity"),
                  cs.get("reporter"), cs.get("target"), cs.get("actor"),
                  cs.get("case-study-type")))

            # Procedure steps
            for step_order, proc in enumerate(cs.get("procedure", [])):
                cursor.execute("""
                    INSERT INTO case_study_procedures
                        (case_study_id, step_order, tactic_id,
                         technique_id, description)
                    VALUES (?, ?, ?, ?, ?)
                """, (cs["id"], step_order, proc["tactic"],
                      proc["technique"], proc["description"]))

            # References
            for ref in cs.get("references", []):
                cursor.execute("""
                    INSERT INTO references (entity_type, entity_id, title, url)
                    VALUES ('case_study', ?, ?, ?)
                """, (cs["id"], ref.get("title"), ref.get("url")))

        # 5. Update metadata
        cursor.execute("""
            INSERT OR REPLACE INTO atlas_metadata
                (id, name, version, last_updated, source_commit, source_url)
            VALUES (?, ?, ?, datetime('now'), ?, ?)
        """, (data["id"], data["name"], data["version"],
              commit_hash,
              "https://github.com/mitre-atlas/atlas-data"))

        # 6. Rebuild FTS indexes
        cursor.execute("INSERT INTO techniques_fts(techniques_fts) VALUES('rebuild')")
        cursor.execute("INSERT INTO case_studies_fts(case_studies_fts) VALUES('rebuild')")

        cursor.execute("COMMIT")

    except Exception:
        cursor.execute("ROLLBACK")
        raise
```

#### Step 5: Ingestion Log (for tracking updates)
```sql
CREATE TABLE ingestion_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    commit_hash TEXT,
    checksum TEXT NOT NULL,       -- SHA-256 of ATLAS.yaml content
    ingested_at TEXT NOT NULL,    -- ISO 8601
    tactics_count INTEGER,
    techniques_count INTEGER,
    subtechniques_count INTEGER,
    mitigations_count INTEGER,
    case_studies_count INTEGER,
    status TEXT DEFAULT 'success' -- 'success' or 'error'
);
```

### Update Detection Strategy

```python
def should_update(db_conn):
    """Determine if we need to re-ingest data."""
    cursor = db_conn.cursor()
    cursor.execute("SELECT version, source_commit FROM atlas_metadata WHERE id = 'ATLAS'")
    row = cursor.fetchone()

    if not row:
        return True  # First run

    current_version, current_commit = row
    needs_update, latest_version, latest_commit = check_for_updates(
        current_version, current_commit
    )
    return needs_update
```

### Full Refresh vs Incremental

**Recommended: Full Refresh** (not incremental)

Reasons:
1. Dataset is tiny (~200 objects) - full refresh takes < 1 second
2. ATLAS YAML has no individual object change tracking
3. Objects can be updated, removed, or restructured between versions
4. Simpler code, no diff logic needed
5. Atomic transaction ensures consistency

The ingestion_log table provides an audit trail of all updates.

---

## 6. STIX Integration (Optional)

For integration with threat intelligence platforms (OpenCTI, ATT&CK Workbench), ATLAS also provides STIX 2.1 bundles:

- **`stix-atlas.json`**: Pure ATLAS data in STIX format
- **`stix-atlas-attack-enterprise.json`**: ATLAS + ATT&CK Enterprise combined
- **OpenCTI bundles**: Case studies formatted for OpenCTI import

These are available from `mitre-atlas/atlas-navigator-data` repository.

For our application, the YAML format from `atlas-data` is simpler and more direct. STIX format is only needed if integrating with external threat intelligence platforms.

---

## 7. Key Implementation Notes

### YAML Parsing Considerations
- The source `data/*.yaml` files use custom `!include` directives and YAML anchors (`&name` / `*name`) that require special handling
- **Always use `dist/ATLAS.yaml`** which has all references resolved
- Use `yaml.safe_load()` (not `yaml.load()`) for security
- The compiled ATLAS.yaml uses plain YAML 1.1 without custom tags

### ID Patterns (Regex Validation)
```
Tactic:        ^AML\.TA\d{4}$           (e.g., AML.TA0002)
Technique:     ^AML\.T\d{4}$            (e.g., AML.T0040)
Sub-technique: ^AML\.T\d{4}\.\d{3}$     (e.g., AML.T0040.000)
Mitigation:    ^AML\.M\d{4}$            (e.g., AML.M0000)
Case Study:    ^AML\.CS\d{4}$           (e.g., AML.CS0000)
```

### ATT&CK Cross-References
Many ATLAS tactics and techniques have ATT&CK counterparts. The `ATT&CK-reference` field provides the mapping, enabling cross-framework analysis.

### Technique Maturity Levels (added v5.0.0)
- **Feasible**: Theoretically possible, not yet demonstrated
- **Demonstrated**: Shown in research/lab settings
- **Realized**: Observed in real-world attacks

### Mitigation Categories
- **Policy**: Organizational and process controls
- **Technical-ML**: AI/ML-specific technical controls
- **Technical-Cyber**: Traditional cybersecurity controls

---

## 8. Summary of Recommendations

1. **Data Source**: Use `dist/ATLAS.yaml` from `mitre-atlas/atlas-data` repo
2. **Database**: SQLite with the schema above (zero-config, portable, sufficient for this dataset)
3. **Update Strategy**: Full refresh triggered by version/commit comparison via GitHub API
4. **Ingestion**: Python script using PyYAML + sqlite3 (both in stdlib or minimal deps)
5. **Validation**: Use official JSON Schema from `dist/schemas/`
6. **Text Search**: SQLite FTS5 for searching technique descriptions and case study summaries
7. **Frequency**: Check for updates weekly (ATLAS updates ~monthly, accelerating)
8. **STIX**: Optional, only if integrating with external threat intel platforms
