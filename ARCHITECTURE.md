# ATLAS Threat Intelligence Learning Platform - Architecture Design

> **Version**: 1.0 | **ATLAS Version**: v5.4.0 (Feb 2026) | **Date**: 2026-02-24

## 1. Vision

An interactive learning platform that ingests the MITRE ATLAS matrix and provides deep, contextual understanding of AI/ML adversarial tactics, techniques, and procedures (TTPs) through:
- A clickable visual matrix interface (16 tactics, 84+ techniques, 56+ subtechniques)
- On-demand OSINT research for real-world examples
- Killchain visualization showing how techniques chain together in actual attacks
- GitHub repository discovery linking 100+ offensive/defensive tools to specific TTPs
- Auto-updating database synced with the ATLAS matrix (checks GitHub releases)

---

## 2. Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14+** (App Router, TypeScript) | Framework, SSR, routing |
| **D3.js** | Matrix heatmap/grid (clickable tactic x technique grid) |
| **React Flow** | Killchain/attack flow diagrams (node-based) |
| **Tailwind CSS** + **shadcn/ui** | Styling and component library |
| **Framer Motion** | Animations and transitions |

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** (Python 3.11+) | REST API + WebSocket for streaming OSINT |
| **SQLite** (via sqlite3 stdlib) | Portable, zero-config database |
| **HTTPX** | Async HTTP client for external APIs |
| **PyYAML** | Parse ATLAS.yaml |
| **APScheduler** | Background scheduler for OSINT + sync tasks |

### Data Pipeline
| Source | Format | URL |
|--------|--------|-----|
| `mitre-atlas/atlas-data` | YAML (compiled) | `dist/ATLAS.yaml` |
| `mitre-atlas/atlas-navigator-data` | STIX 2.1 JSON | `dist/stix-atlas.json` |
| GitHub Releases API | JSON | Version detection |

---

## 3. ATLAS Matrix Structure (v5.4.0)

### 16 Tactics (Kill Chain Order)

| Order | ID | Tactic | AI-Specific? |
|-------|-----|--------|:---:|
| 1 | AML.TA0002 | Reconnaissance | |
| 2 | AML.TA0003 | Resource Development | |
| 3 | AML.TA0004 | Initial Access | |
| 4 | AML.TA0000 | **ML Model Access** | Yes |
| 5 | AML.TA0005 | Execution | |
| 6 | AML.TA0006 | Persistence | |
| 7 | AML.TA0012 | Privilege Escalation | |
| 8 | AML.TA0007 | Defense Evasion | |
| 9 | AML.TA0013 | Credential Access | |
| 10 | AML.TA0008 | Discovery | |
| 11 | AML.TA0015 | **Lateral Movement** | Yes |
| 12 | AML.TA0009 | Collection | |
| 13 | AML.TA0001 | **ML Attack Staging** | Yes |
| 14 | AML.TA0014 | Command and Control | |
| 15 | AML.TA0010 | Exfiltration | |
| 16 | AML.TA0011 | Impact | |

### Data Hierarchy
```
Matrix
  -> Tactic (16, ordered columns)
      -> Technique (84+, many-to-many with tactics)
          -> Sub-technique (56+, one parent)
              -> Procedure (within case studies)
  -> Mitigation (34, many-to-many with techniques)
      -> Category: Policy | Technical-ML | Technical-Cyber
      -> ML Lifecycle stages
  -> Case Study (52, ordered procedure steps)
      -> Type: "incident" (real-world) | "exercise" (research)
```

### ID Patterns
```
Tactic:        ^AML\.TA\d{4}$           (e.g., AML.TA0002)
Technique:     ^AML\.T\d{4}$            (e.g., AML.T0040)
Sub-technique: ^AML\.T\d{4}\.\d{3}$     (e.g., AML.T0040.000)
Mitigation:    ^AML\.M\d{4}$            (e.g., AML.M0000)
Case Study:    ^AML\.CS\d{4}$           (e.g., AML.CS0000)
```

### Technique Maturity Levels (added v5.0.0)
- **Feasible**: Theoretically possible, not yet demonstrated
- **Demonstrated**: Shown in research/lab settings
- **Realized**: Observed in real-world attacks

---

## 4. Database Schema (SQLite)

```sql
-- =====================================================
-- METADATA
-- =====================================================
CREATE TABLE atlas_metadata (
    id TEXT PRIMARY KEY,          -- 'ATLAS'
    name TEXT NOT NULL,
    version TEXT NOT NULL,        -- e.g., '5.4.0'
    last_updated TEXT NOT NULL,   -- ISO 8601 timestamp
    source_commit TEXT,           -- Git commit hash
    source_url TEXT
);

CREATE TABLE ingestion_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    commit_hash TEXT,
    checksum TEXT NOT NULL,       -- SHA-256 of ATLAS.yaml
    ingested_at TEXT NOT NULL,
    tactics_count INTEGER,
    techniques_count INTEGER,
    subtechniques_count INTEGER,
    mitigations_count INTEGER,
    case_studies_count INTEGER,
    status TEXT DEFAULT 'success'
);

-- =====================================================
-- CORE ENTITIES
-- =====================================================
CREATE TABLE tactics (
    id TEXT PRIMARY KEY,           -- e.g., 'AML.TA0002'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    matrix_order INTEGER NOT NULL, -- Position in kill chain (1-16)
    attck_id TEXT,                 -- ATT&CK cross-reference
    attck_url TEXT,
    created_date TEXT,
    modified_date TEXT
);

CREATE TABLE techniques (
    id TEXT PRIMARY KEY,           -- e.g., 'AML.T0000' or 'AML.T0000.000'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_subtechnique BOOLEAN DEFAULT FALSE,
    parent_technique_id TEXT,      -- NULL for top-level, FK for subtechniques
    maturity TEXT,                 -- 'feasible', 'demonstrated', 'realized'
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
    incident_date TEXT,
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
    usage TEXT,                    -- How the mitigation applies
    PRIMARY KEY (mitigation_id, technique_id),
    FOREIGN KEY (mitigation_id) REFERENCES mitigations(id),
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

-- Mitigation ML lifecycle stages
CREATE TABLE mitigation_lifecycle (
    mitigation_id TEXT NOT NULL,
    lifecycle_stage TEXT NOT NULL,
    PRIMARY KEY (mitigation_id, lifecycle_stage),
    FOREIGN KEY (mitigation_id) REFERENCES mitigations(id)
);

-- Case study procedure steps (ordered kill chain walk-through)
CREATE TABLE case_study_procedures (
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

-- References (polymorphic, shared across entities)
CREATE TABLE references_ (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,     -- 'tactic', 'technique', 'mitigation', 'case_study'
    entity_id TEXT NOT NULL,
    title TEXT,
    url TEXT
);

-- =====================================================
-- OSINT & ENRICHMENT DATA
-- =====================================================

CREATE TABLE osint_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technique_id TEXT NOT NULL,
    source TEXT NOT NULL,          -- 'github', 'arxiv', 'nvd', 'news', 'blog'
    title TEXT,
    url TEXT,
    summary TEXT,
    relevance_score REAL,
    fetched_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

CREATE TABLE github_repos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technique_id TEXT NOT NULL,
    repo_full_name TEXT NOT NULL,
    description TEXT,
    stars INTEGER,
    language TEXT,
    url TEXT,
    category TEXT,                -- 'offensive', 'defensive', 'research', 'demo'
    last_updated TEXT,
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

CREATE TABLE killchains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    source_case_study_id TEXT,
    severity TEXT,                -- 'low', 'medium', 'high', 'critical'
    attack_category TEXT,
    year INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (source_case_study_id) REFERENCES case_studies(id)
);

CREATE TABLE killchain_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    killchain_id INTEGER NOT NULL,
    step_order INTEGER NOT NULL,
    tactic_id TEXT,
    technique_id TEXT,
    description TEXT,
    indicators TEXT,              -- JSON array of observable indicators
    mitigations TEXT,             -- JSON array of prevention steps
    FOREIGN KEY (killchain_id) REFERENCES killchains(id),
    FOREIGN KEY (tactic_id) REFERENCES tactics(id),
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

-- Technique-to-OSINT keyword mapping
CREATE TABLE technique_search_terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technique_id TEXT NOT NULL,
    source TEXT NOT NULL,          -- 'arxiv', 'github', 'nvd', 'blog'
    search_term TEXT NOT NULL,
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
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
CREATE INDEX idx_mitigation_techniques_technique ON mitigation_techniques(technique_id);
CREATE INDEX idx_case_study_procedures_case ON case_study_procedures(case_study_id);
CREATE INDEX idx_case_study_procedures_technique ON case_study_procedures(technique_id);
CREATE INDEX idx_references_entity ON references_(entity_type, entity_id);
CREATE INDEX idx_osint_results_technique ON osint_results(technique_id);
CREATE INDEX idx_github_repos_technique ON github_repos(technique_id);
CREATE INDEX idx_killchain_steps_killchain ON killchain_steps(killchain_id);
CREATE INDEX idx_technique_search_terms ON technique_search_terms(technique_id, source);
```

---

## 5. Project Structure

```
atlas-mitre/
├── frontend/                        # Next.js application
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Home / Matrix view
│   │   ├── technique/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Technique detail view
│   │   ├── killchain/
│   │   │   ├── page.tsx            # Killchain gallery
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Specific killchain flow
│   │   ├── case-study/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Case study detail
│   │   └── search/
│   │       └── page.tsx            # Search & OSINT results
│   ├── components/
│   │   ├── matrix/
│   │   │   ├── AtlasMatrix.tsx     # Main D3.js matrix grid
│   │   │   ├── TacticColumn.tsx    # Single tactic column
│   │   │   ├── TechniqueCell.tsx   # Clickable technique cell
│   │   │   └── MatrixLegend.tsx    # Color/maturity legend
│   │   ├── technique/
│   │   │   ├── TechniqueDetail.tsx # Full technique view
│   │   │   ├── SubtechniqueTree.tsx# Subtechnique hierarchy
│   │   │   ├── MitigationsPanel.tsx# Mitigations with categories
│   │   │   ├── CaseStudiesPanel.tsx# Related case studies
│   │   │   ├── OsintResults.tsx    # Live OSINT results (streaming)
│   │   │   └── GithubRepos.tsx     # Related GitHub repos
│   │   ├── killchain/
│   │   │   ├── KillchainFlow.tsx   # React Flow diagram
│   │   │   ├── FlowNode.tsx        # Custom node (tactic-colored)
│   │   │   ├── FlowEdge.tsx        # Animated edge
│   │   │   └── KillchainCard.tsx   # Gallery card
│   │   ├── case-study/
│   │   │   ├── CaseStudyDetail.tsx # Full case study with procedure steps
│   │   │   └── ProcedureTimeline.tsx# Step-by-step timeline
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchResults.tsx
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts                  # API client (fetch wrapper)
│   │   ├── types.ts                # TypeScript interfaces
│   │   └── colors.ts              # Tactic color map
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
│
├── backend/                         # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app + startup events
│   │   ├── config.py               # Settings (.env loading)
│   │   ├── database.py             # SQLite connection + schema init
│   │   ├── models/
│   │   │   ├── atlas.py            # Pydantic models for ATLAS entities
│   │   │   ├── osint.py            # OSINT result models
│   │   │   └── killchain.py        # Killchain models
│   │   ├── routers/
│   │   │   ├── matrix.py           # /api/matrix, /api/tactics
│   │   │   ├── techniques.py       # /api/techniques/{id}
│   │   │   ├── osint.py            # /api/osint/search, /api/osint/results
│   │   │   ├── killchains.py       # /api/killchains CRUD
│   │   │   ├── case_studies.py     # /api/case-studies
│   │   │   └── sync.py             # /api/sync
│   │   ├── services/
│   │   │   ├── ingestion.py        # Parse ATLAS.yaml -> DB
│   │   │   ├── osint_engine.py     # OSINT search orchestrator
│   │   │   ├── github_search.py    # GitHub API integration
│   │   │   ├── arxiv_search.py     # arXiv API integration
│   │   │   ├── nvd_search.py       # NIST NVD API integration
│   │   │   ├── web_search.py       # Google CSE / news search
│   │   │   └── sync_service.py     # Update detection
│   │   └── seed/
│   │       ├── github_repos.json   # Pre-mapped repos -> techniques
│   │       ├── killchains.json     # Pre-built killchain diagrams
│   │       └── search_terms.json   # Technique -> OSINT keyword map
│   ├── data/
│   │   └── atlas.db                # SQLite database
│   ├── requirements.txt
│   └── Dockerfile
│
├── scripts/
│   ├── ingest.py                   # Full ingestion: fetch ATLAS.yaml -> DB
│   ├── seed_repos.py               # Seed curated GitHub repos
│   └── seed_killchains.py          # Seed killchains from case studies
│
├── research/                        # Agent research outputs
│   ├── data-ingestion-research.md
│   ├── killchain-research-report.md
│   └── github_repos_atlas_ttps.md
│
├── docker-compose.yml
├── .env.example
├── ARCHITECTURE.md
└── README.md
```

---

## 6. Key UI Views

### 6.1 Matrix View (Home Page)

Interactive D3.js grid: 16 tactic columns, techniques as clickable cells underneath each.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ATLAS Threat Intelligence Platform        v5.4.0  [Search...] [Sync] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Recon     Resource  Initial   ML Model  Execution  Persist  Priv Esc  │
│  TA0002   Dev 0003  Access    Access     TA0005     TA0006   TA0012    │
│  ────────┬─────────┬─────────┬──────────┬──────────┬────────┬────────  │
│  ┌──────┐│┌──────┐ │┌──────┐ │┌───────┐ │┌──────┐  │┌──────┐│┌──────┐ │
│  │Search│││Acquire│ ││Supply│ ││Infere.│ ││User  │  ││Modify││        │ │
│  │Vict. │││Public│ ││Chain │ ││API    │ ││Exec  │  ││Agent ││        │ │
│  │■■■■  │││ML    │ ││Compr.│ ││Access │ ││      │  ││Config││        │ │
│  └──────┘│└──────┘ │└──────┘ │└───────┘ │└──────┘  │└──────┘│        │ │
│  ┌──────┐│┌──────┐ │┌──────┐ │┌───────┐ │┌──────┐  │        │        │ │
│  │Disc. │││Devel.│ ││Prompt│ ││ML Art.│ ││LLM   │  │        │        │ │
│  │ML    │││Adver.│ ││Inject│ ││Access │ ││Plugin│  │        │        │ │
│  │Artif │││Capab.│ ││■■■■■ │ ││       │ ││Compr │  │        │        │ │
│  └──────┘│└──────┘ │└──────┘ │└───────┘ │└──────┘  │        │        │ │
│  ...      ...       ...       ...        ...        ...      ...      │
│                                                                         │
│  ■ feasible  ■■ demonstrated  ■■■ realized                             │
│  Cell color intensity = number of case studies                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Technique Detail View

Tabbed interface with all enrichment data for a technique.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Matrix    AML.T0051 - LLM Prompt Injection    Maturity: REALIZED   │
├─────────────────────────────────────────────────────────────────────────┤
│  Tactics: Initial Access, Execution                                     │
│  ATT&CK Ref: T1059                                                     │
│                                                                         │
│  An adversary may craft malicious prompts as inputs to an LLM that     │
│  cause the LLM to act in unintended ways. These inputs can be direct   │
│  user-supplied prompts or indirectly embedded in data sources...        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ [Subtechniques] [Mitigations] [Case Studies] [OSINT] [Repos]  │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                 │    │
│  │  Subtechniques (3):                                            │    │
│  │  ├─ AML.T0051.000 Direct Prompt Injection                     │    │
│  │  ├─ AML.T0051.001 Indirect Prompt Injection                   │    │
│  │  └─ AML.T0051.002 Stored Prompt Injection                     │    │
│  │                                                                 │    │
│  │  Killchains using this technique:                              │    │
│  │  ├─ ChatGPT Browser Jailbreak (2025) → [View Flow]            │    │
│  │  ├─ Car Dealership Chatbot Exploit (2024) → [View Flow]       │    │
│  │  └─ ChatGPT Plugin Data Leak (2023) → [View Flow]             │    │
│  │                                                                 │    │
│  │  [Search OSINT] Searching GitHub, arXiv, NVD, blogs...        │    │
│  │  ┌────────────────────────────────────────────────────────┐    │    │
│  │  │ GitHub  NVIDIA/garak - LLM vulnerability scanner 4.2k★│    │    │
│  │  │ GitHub  promptfoo/promptfoo - LLM testing 250k users   │    │    │
│  │  │ arXiv   "Tensor Trust" - prompt injection game (2024)  │    │    │
│  │  │ NVD     CVE-2024-XXXX - Prompt injection in LangChain │    │    │
│  │  │ Blog    "Indirect Prompt Injection" - Lakera 2024      │    │    │
│  │  └────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Killchain Flow View (React Flow)

Interactive node-based diagram, each node color-coded by tactic.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Killchain: DeepSeek Model Distillation (AML.CS0032)   Severity: CRIT │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ RECON        │───→│ RESOURCE DEV │───→│ ML MODEL     │              │
│  │ AML.TA0002   │    │ AML.TA0003   │    │ ACCESS       │              │
│  │              │    │              │    │ AML.TA0000   │              │
│  │ Identify GPT │    │ Set up API   │    │ Inference    │              │
│  │ capabilities │    │ accounts &   │    │ API Access   │              │
│  │ via public   │    │ infra for    │    │ AML.T0024    │              │
│  │ API          │    │ bulk queries │    │              │              │
│  └──────────────┘    └──────────────┘    └──────┬───────┘              │
│                                                  │                      │
│                                                  ▼                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ IMPACT       │←──│ EXFILTRATION │←──│ COLLECTION   │              │
│  │ AML.TA0011   │    │ AML.TA0010   │    │ AML.TA0009   │              │
│  │              │    │              │    │              │              │
│  │ Deploy rival │    │ Train rival  │    │ Collect I/O  │              │
│  │ model, IP    │    │ model on     │    │ pairs at     │              │
│  │ theft        │    │ stolen data  │    │ scale        │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                                         │
│  Indicators: Unusual API patterns | Bulk key creation | High volume    │
│  Mitigations: Output watermarking | Query budgets | Distillation detect│
│                                                                         │
│  Click any node for technique details                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tactic Color Map
```
Reconnaissance:       #6366f1 (indigo)
Resource Development: #8b5cf6 (violet)
Initial Access:       #ec4899 (pink)
ML Model Access:      #ef4444 (red)       ← AI-specific
Execution:            #f97316 (orange)
Persistence:          #eab308 (yellow)
Privilege Escalation: #84cc16 (lime)
Defense Evasion:      #22c55e (green)
Credential Access:    #14b8a6 (teal)
Discovery:            #06b6d4 (cyan)
Lateral Movement:     #0ea5e9 (sky)       ← AI-specific
Collection:           #3b82f6 (blue)
ML Attack Staging:    #a855f7 (purple)    ← AI-specific
Command and Control:  #d946ef (fuchsia)
Exfiltration:         #f43f5e (rose)
Impact:               #dc2626 (dark red)
```

---

## 7. OSINT Engine Architecture

### Sources & Rate Limits

| Source | API Endpoint | Auth | Rate Limit | Cache TTL |
|--------|-------------|------|------------|-----------|
| GitHub | `api.github.com/search/repositories` | PAT | 60/min (auth) | 6 hours |
| arXiv | `export.arxiv.org/api/query` | None | 1 req/3 sec | 24 hours |
| NIST NVD | `services.nvd.nist.gov/rest/json/cves/2.0` | API key | 50/30 sec | 12 hours |
| Google CSE | `googleapis.com/customsearch/v1` | API key + CSE ID | 100/day free | 1 hour |

### Search Flow
```
User clicks technique
    │
    ▼
Frontend: POST /api/osint/search {technique_id: "AML.T0051"}
    │
    ▼
Backend OSINT Orchestrator:
    ├── Check cache (SQLite osint_results, check expires_at)
    │   └── If fresh → return cached results immediately
    │
    ├── If stale/missing → parallel async queries:
    │   ├── github_search.py   → repos matching technique keywords
    │   ├── arxiv_search.py    → papers matching technique terms
    │   ├── nvd_search.py      → CVEs related to technique
    │   └── web_search.py      → blog posts, news articles
    │
    ├── Normalize results → common schema (title, url, summary, source)
    ├── Score by relevance (keyword match, recency, citation count)
    ├── Store in osint_results table with TTL
    │
    ▼
Return results (or stream via WebSocket for real-time updates)
```

### Pre-mapped Keyword Examples (stored in `technique_search_terms`)
```yaml
AML.T0051:  # Prompt Injection
  arxiv: ["prompt injection", "LLM jailbreak", "instruction injection"]
  github: ["prompt-injection", "llm-security", "jailbreak-detection"]
  nvd: ["prompt injection", "LLM vulnerability"]

AML.T0020:  # Poison Training Data
  arxiv: ["data poisoning", "training data attack", "backdoor attack ML"]
  github: ["data-poisoning", "backdoor-attack", "trojan-nn"]
  nvd: ["data poisoning", "training data"]

AML.T0024:  # Exfiltration via ML Inference API
  arxiv: ["model extraction", "model stealing", "model distillation attack"]
  github: ["model-extraction", "model-stealing"]
  nvd: ["model extraction", "API abuse"]

AML.T0043:  # Craft Adversarial Data
  arxiv: ["adversarial examples", "adversarial perturbation", "evasion attack"]
  github: ["adversarial-examples", "adversarial-attacks"]
  nvd: ["adversarial machine learning"]
```

---

## 8. Data Ingestion Pipeline

### Source: `dist/ATLAS.yaml` from `mitre-atlas/atlas-data`
- Raw URL: `https://raw.githubusercontent.com/mitre-atlas/atlas-data/main/dist/ATLAS.yaml`
- Format: Compiled YAML with all references resolved
- Top-level: `{id, name, version, matrices: [{tactics, techniques, mitigations}], case-studies: [...]}`

### Pipeline Steps
1. **Version Check** → GitHub Releases API (`/repos/mitre-atlas/atlas-data/releases/latest`)
2. **Fetch** → Download `ATLAS.yaml`, compute SHA-256 checksum
3. **Validate** → Against official JSON Schema from `dist/schemas/`
4. **Transform & Load** → Full refresh (atomic transaction):
   - Clear all existing data
   - Insert tactics (with `matrix_order`), techniques, subtechniques, mitigations, case studies
   - Build junction tables (technique_tactics, mitigation_techniques, case_study_procedures)
   - Rebuild FTS5 indexes
5. **Log** → Record in `ingestion_log` table

### Why Full Refresh (not incremental)
- Dataset is tiny (~200 objects + 52 case studies) → refresh takes < 1 second
- No per-object change tracking in ATLAS.yaml
- Objects can be updated, removed, or restructured between versions
- Simpler, more reliable, atomic transaction ensures consistency

---

## 9. API Endpoints

### Core Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matrix` | Full matrix: tactics + technique IDs (for rendering grid) |
| GET | `/api/tactics` | All tactics with technique counts |
| GET | `/api/tactics/{id}` | Single tactic with its techniques |
| GET | `/api/techniques` | All techniques (filter: `?tactic_id=`, `?maturity=`) |
| GET | `/api/techniques/{id}` | Full detail: description, subtechniques, mitigations, case studies, OSINT cache |
| GET | `/api/mitigations` | All mitigations (filter: `?category=`) |
| GET | `/api/case-studies` | All case studies (filter: `?type=`, `?technique_id=`) |
| GET | `/api/case-studies/{id}` | Case study with ordered procedure steps |
| GET | `/api/search?q=` | Full-text search across techniques and case studies |

### OSINT
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/osint/search` | Trigger OSINT search for `{technique_id}` |
| GET | `/api/osint/results/{technique_id}` | Get cached OSINT results |
| WS | `/api/osint/stream` | WebSocket for streaming results |

### Repos & Killchains
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/repos/{technique_id}` | GitHub repos mapped to technique |
| POST | `/api/repos/discover/{technique_id}` | Trigger repo discovery |
| GET | `/api/killchains` | List all killchains |
| GET | `/api/killchains/{id}` | Killchain with steps + diagram data |
| POST | `/api/killchains` | Create custom killchain |

### Sync
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sync` | Trigger ATLAS data sync |
| GET | `/api/sync/status` | Current version, last sync time |

---

## 10. Pre-Seeded Data

### 10 Priority Killchains (from case studies + notable incidents)

| # | Killchain | Source | Category |
|---|-----------|--------|----------|
| 1 | Microsoft Tay Data Poisoning | AML.CS0009 | Data Poisoning |
| 2 | DeepSeek Model Distillation | AML.CS0032 | Model Extraction |
| 3 | PoisonGPT Supply Chain Attack | AML.CS0019 | Supply Chain |
| 4 | ChatGPT Training Data Extraction | Research 2023 | Exfiltration |
| 5 | Adversarial Patches on Autonomous Vehicles | AML.CS0012 | Evasion |
| 6 | ChatGPT Atlas Browser Jailbreak | Research 2025 | Prompt Injection |
| 7 | Car Dealership Chatbot Exploit | Incident 2024 | Prompt Injection |
| 8 | ShadowRay Infrastructure Attack | AML.CS0029 | Infrastructure |
| 9 | Malicious Models on Hugging Face | AML.CS0030 | Supply Chain |
| 10 | Cylance AI Malware Detection Bypass | AML.CS0003 | Evasion |

### Top GitHub Repos per Attack Category (100+ curated)

See `research/github_repos_atlas_ttps.md` for the complete catalog.

**Highlight repos:**
- **ART** (IBM) - Comprehensive ML attack+defense library → AML.T0043, T0020, T0024, T0044
- **garak** (NVIDIA) - LLM vulnerability scanner → AML.T0051, T0054
- **promptfoo** - LLM testing, 50+ vuln types → AML.T0051, T0054
- **PyRIT** (Microsoft) - GenAI red teaming → AML.T0051, T0054, T0048
- **BackdoorBench** - Backdoor attack benchmark → AML.T0019, T0020
- **ModelScan** (Protect AI) - ML model scanner → AML.T0010, T0019

---

## 11. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js frontend + FastAPI backend
- [ ] Create SQLite schema (copy from Section 4)
- [ ] Build `ingest.py` script (fetch ATLAS.yaml → populate DB)
- [ ] Basic API endpoints: `/api/matrix`, `/api/techniques/{id}`
- [ ] Verify with 16 tactics, 84+ techniques ingested

### Phase 2: Matrix Visualization (Week 2-3)
- [ ] D3.js matrix grid component (AtlasMatrix.tsx)
- [ ] Clickable technique cells with color coding
- [ ] Technique detail page with description, subtechniques
- [ ] Mitigations panel with categories
- [ ] Case studies panel with procedure steps

### Phase 3: OSINT Integration (Week 3-4)
- [ ] GitHub search service (API integration)
- [ ] arXiv search service
- [ ] OSINT orchestrator with caching
- [ ] Technique → search terms mapping (seed data)
- [ ] OSINT results panel in technique detail view

### Phase 4: Killchain Visualization (Week 4-5)
- [ ] React Flow killchain component
- [ ] Seed 10 killchains from case studies
- [ ] Killchain gallery page
- [ ] Click node → technique detail navigation
- [ ] Matrix highlight when viewing killchain

### Phase 5: Polish & Automation (Week 5-6)
- [ ] Auto-sync with ATLAS updates (version check)
- [ ] Full-text search across techniques + case studies
- [ ] Seed curated GitHub repos (100+)
- [ ] Maturity level indicators
- [ ] NVIDIA Kill Chain comparison view
- [ ] Export capabilities

---

## 12. Environment Variables

```env
# Backend
ATLAS_DB_PATH=./data/atlas.db
GITHUB_TOKEN=ghp_...              # For GitHub API (60 req/min)
NVD_API_KEY=...                   # For NIST NVD (50 req/30sec)
GOOGLE_CSE_API_KEY=...            # For Google Custom Search
GOOGLE_CSE_ID=...                 # Custom Search Engine ID
OSINT_CACHE_TTL_HOURS=6           # Default OSINT cache TTL

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```
