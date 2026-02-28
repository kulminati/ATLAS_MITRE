# ATLAS Threat Intelligence Platform

An interactive threat intelligence platform for the [MITRE ATLAS](https://atlas.mitre.org/) (Adversarial Threat Landscape for AI Systems) framework. Built for detection engineers and security leaders to explore, analyze, and operationalize AI/ML threat intelligence.

## Features

### Interactive ATLAS Matrix
- D3.js-powered visualization of all 16 tactics and 155 techniques
- Color-coded by tactic with maturity-level filtering (feasible / demonstrated / realized)
- Click any technique to view full details, subtechniques, mitigations, and case studies

### Live OSINT Enrichment
- Real-time threat intelligence from GitHub, arXiv, and NIST NVD for every technique
- GitHub repos (with stars, language), academic papers (with relevance scores), CVEs (with CVSS)
- TTL-based caching (GitHub: 6hr, arXiv: 24hr, NVD: 12hr)

### Killchain Visualization
- 52 attack killchains auto-generated from ATLAS case studies
- React Flow diagrams with tactic-colored nodes and directional arrows
- Filter by severity (critical/high/medium/low) and attack category
- Step-by-step procedure timelines

### Technique Relationship Graph
- D3.js force-directed graph showing technique co-occurrence across case studies
- Nodes colored by tactic, sized by case study frequency
- Edge thickness indicates co-occurrence strength
- Interactive: hover, click, drag, zoom

### NVIDIA Kill Chain Comparison
- Side-by-side mapping of NVIDIA AI Red Team Kill Chain stages to ATLAS tactics
- Interactive highlight mode and cross-reference matrix view

### Executive Reports
- Auto-generated threat intelligence report with key metrics
- Tactic breakdown, top 10 risk techniques, killchain severity analysis, OSINT coverage
- Print-optimized layout for PDF export

### Full-Text Search
- Search across all techniques and case studies
- Debounced queries with grouped, linked results

### Auto-Sync & Data Freshness
- Automatic ATLAS data sync on startup when data is stale (>7 days)
- Nav bar indicator showing sync status with manual refresh

### JSON Export
- Export killchain and technique data as structured JSON
- One-click download from detail pages

### Learning Platform
- **Technical Deep-Dives**: In-depth "Learn" tab on 15 key techniques with code examples, defense strategies, and lab tool links
- **Interactive Threat Modeling**: 4-step wizard to assess AI system threats by system type, deployment model, and access level
- **Detection Exercises**: 10 hands-on scenarios with CrowdStrike LogScale queries, log analysis, and progressive hints
- **Curated Learning Paths**: 5 structured curricula (Fundamentals, LLM Security, Detection Engineering, Red Team, Leaders)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python 3.11, SQLite (WAL mode, FTS5) |
| Frontend | Next.js 16, React 19, Tailwind CSS v4, D3.js, @xyflow/react |
| Data Source | [mitre-atlas/atlas-data](https://github.com/mitre-atlas/atlas-data) |
| OSINT | GitHub Search API, arXiv API, NIST NVD API |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ATLAS_MITRE

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Ingest ATLAS data (auto-runs on startup if empty, or run manually)
python3 -m scripts.ingest

# Start backend (port 8000)
python3 -m uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the platform.

### Environment Variables

Create a `.env` file in the project root:

```env
ATLAS_DB_PATH=backend/data/atlas.db
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Interactive ATLAS matrix (D3.js) |
| `/technique/[id]` | Technique detail with tabs (subtechniques, mitigations, case studies, OSINT) |
| `/case-study/[id]` | Case study detail with procedure timeline and references |
| `/killchain` | Killchain gallery with severity/category filters |
| `/killchain/[id]` | Killchain detail with React Flow diagram and procedure steps |
| `/graph` | Technique relationship graph (D3.js force-directed) |
| `/compare` | NVIDIA AI Kill Chain vs ATLAS comparison |
| `/reports` | Executive threat intelligence report |
| `/search` | Full-text search across techniques and case studies |
| `/learn` | Curated learning paths with 5 structured curricula |
| `/threat-model` | Interactive AI threat modeling wizard |
| `/exercises` | Detection exercise gallery with difficulty filters |
| `/exercises/[id]` | Interactive exercise with logs, hints, and LogScale solutions |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matrix` | Full matrix with tactics and techniques |
| GET | `/api/tactics` | All tactics |
| GET | `/api/tactics/{id}` | Tactic detail with techniques |
| GET | `/api/techniques` | All techniques (filterable by tactic, maturity) |
| GET | `/api/techniques/{id}` | Technique detail |
| GET | `/api/techniques/{id}/export` | Technique JSON export |
| GET | `/api/techniques/graph` | Technique co-occurrence graph data |
| GET | `/api/case-studies` | All case studies |
| GET | `/api/case-studies/{id}` | Case study detail with procedures and references |
| GET | `/api/killchains` | All killchains (filterable by category, severity) |
| GET | `/api/killchains/{id}` | Killchain detail with React Flow data |
| GET | `/api/killchains/{id}/export` | Killchain JSON export |
| GET | `/api/killchains/categories` | Distinct attack categories |
| POST | `/api/killchains/seed` | Generate killchains from case studies |
| GET | `/api/osint/{technique_id}` | OSINT results (GitHub, arXiv, NVD) |
| POST | `/api/osint/{technique_id}/refresh` | Force OSINT refresh |
| GET | `/api/reports/executive` | Executive report data |
| GET | `/api/search?q=` | Full-text search |
| GET | `/api/sync/status` | Sync status and data freshness |
| POST | `/api/sync` | Trigger ATLAS data sync |
| GET | `/api/techniques/{id}/deepdive` | Technical deep-dive content |
| GET | `/api/exercises` | All detection exercises |
| GET | `/api/exercises/{id}` | Exercise detail with LogScale solution |
| GET | `/api/health` | Health check |

## ATLAS Data Model

- **16 tactics** ordered by kill chain phase
- **155 techniques** (97 parent + 58 subtechniques) with maturity levels (feasible, demonstrated, realized)
- **35 mitigations** with technique mappings
- **52 case studies** with ordered procedure steps
- **52 killchains** auto-generated from case study procedures

## License

This project uses data from [MITRE ATLAS](https://atlas.mitre.org/), which is provided under the [MITRE ATLAS Terms of Use](https://atlas.mitre.org/resources/legal).
