# ATLAS Threat Intelligence Platform

Interactive learning platform for the MITRE ATLAS (Adversarial Threat Landscape for AI Systems) matrix.

## Project Structure

```
ATLAS_MITRE/
├── backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── main.py       # FastAPI app entry point (auto-sync on startup)
│   │   ├── config.py     # Settings (DB_PATH, API keys, URLs)
│   │   ├── database.py   # SQLite schema (18 tables), singleton connection
│   │   ├── models/       # Pydantic response models
│   │   │   └── atlas.py
│   │   ├── routers/      # API route handlers
│   │   │   ├── matrix.py       # /api/matrix, /api/tactics, /api/mitigations
│   │   │   ├── techniques.py   # /api/techniques, /api/search, /api/techniques/graph
│   │   │   ├── case_studies.py # /api/case-studies
│   │   │   ├── osint.py        # /api/osint/{technique_id}
│   │   │   ├── killchains.py   # /api/killchains, /api/killchains/{id}/export
│   │   │   ├── reports.py      # /api/reports/executive
│   │   │   └── sync.py         # /api/sync, /api/sync/status
│   │   └── services/     # Business logic
│   │       ├── ingestion.py     # ATLAS YAML fetch & DB insert
│   │       ├── killchain_service.py # Killchain builder & React Flow diagram gen
│   │       ├── reporting.py     # Executive report data compilation
│   │       ├── osint.py         # OSINT orchestrator (asyncio.gather)
│   │       ├── github_search.py # GitHub API search (6hr cache)
│   │       ├── arxiv_search.py  # arXiv API search (24hr cache)
│   │       └── nvd_search.py    # NVD CVE search (12hr cache)
│   ├── data/
│   │   └── atlas.db      # SQLite database (WAL mode)
│   ├── scripts/
│   │   └── ingest.py     # CLI ingestion runner
│   └── requirements.txt
├── frontend/             # Next.js 16 + React 19 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout, dark theme, nav
│   │   │   ├── page.tsx              # Home - D3.js matrix
│   │   │   ├── globals.css           # Tailwind v4 + custom scrollbar
│   │   │   ├── technique/[id]/page.tsx   # Technique detail (server component)
│   │   │   ├── case-study/[id]/page.tsx # Case study detail (server component)
│   │   │   ├── killchain/page.tsx       # Killchain gallery
│   │   │   ├── killchain/[id]/page.tsx  # Killchain detail + React Flow
│   │   │   ├── graph/page.tsx           # Technique relationship graph (D3)
│   │   │   ├── compare/page.tsx         # NVIDIA vs ATLAS comparison
│   │   │   ├── reports/page.tsx         # Executive report (printable)
│   │   │   └── search/page.tsx          # Full-text search
│   │   ├── components/
│   │   │   ├── matrix/
│   │   │   │   ├── AtlasMatrix.tsx       # D3.js interactive SVG matrix
│   │   │   │   ├── MatrixLegend.tsx      # Maturity filter buttons
│   │   │   │   ├── TechniqueTooltip.tsx  # Hover tooltip
│   │   │   │   ├── TechniqueDetailTabs.tsx # Tabbed detail view
│   │   │   │   └── OsintPanel.tsx        # Live OSINT results panel
│   │   │   ├── killchain/
│   │   │   │   ├── KillchainGallery.tsx  # Filterable gallery cards
│   │   │   │   ├── KillchainFlow.tsx     # React Flow diagram
│   │   │   │   └── KillchainStepList.tsx # Vertical timeline
│   │   │   ├── ExportButton.tsx          # JSON export trigger
│   │   │   └── SyncIndicator.tsx         # Nav bar sync status
│   │   └── lib/
│   │       ├── types.ts            # TypeScript interfaces
│   │       ├── api.ts              # Typed API client (fetch-based)
│   │       ├── colors.ts           # Tactic color map (16 colors)
│   │       ├── utils.ts            # HTML stripping utility
│   │       └── nvidia-killchain.ts # NVIDIA kill chain data + mappings
│   └── package.json
└── .env                  # ATLAS_DB_PATH, NEXT_PUBLIC_API_URL
```

## Tech Stack

- **Backend**: FastAPI + Python 3.11 + SQLite (WAL mode, FTS5)
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS v4 + D3.js + @xyflow/react
- **Data Source**: `mitre-atlas/atlas-data` GitHub repo (`dist/ATLAS.yaml`)
- **OSINT APIs**: GitHub Search, arXiv, NIST NVD

## Running the App

```bash
# Backend (port 8000)
cd backend && python3 -m uvicorn app.main:app --reload

# Frontend (port 3000)
cd frontend && npm run dev

# Ingest ATLAS data (run once, or to refresh — also auto-runs on startup if stale)
cd backend && python3 -m scripts.ingest
```

## Key Conventions

- **Database**: Single SQLite file at path from `ATLAS_DB_PATH` env var. Singleton connection via `get_db()`. All tables use `sqlite3.Row` row factory.
- **Ingestion**: Full refresh (DELETE + INSERT), not incremental. FTS5 rebuild happens AFTER main transaction commits. Use `_coerce_str()` for date/list fields from YAML.
- **Auto-sync**: On backend startup, checks if data is missing or stale (>7 days) and auto-triggers ingestion.
- **OSINT services**: All async (`httpx.AsyncClient`). Each has TTL-based caching in DB. Orchestrator uses `asyncio.gather` with `return_exceptions=True`.
- **Frontend pages**: Server components by default. Client components (`"use client"`) only for interactivity (D3 matrix, React Flow, search, reports).
- **API client**: All calls use `cache: "no-store"`. Base URL from `NEXT_PUBLIC_API_URL`.
- **Colors**: 16 tactic colors in `colors.ts`. 3 maturity colors (feasible=amber, demonstrated=orange, realized=red). AI-specific tactics highlighted (red, sky, purple).
- **Route ordering**: In FastAPI, static routes (e.g., `/techniques/graph`) must be defined BEFORE parameterized routes (e.g., `/techniques/{technique_id}`).
- **HTML in descriptions**: Case study summaries contain raw HTML from ATLAS YAML. Use `stripHtml()` from `lib/utils.ts` when rendering.

## ATLAS Data Model

- **16 tactics** ordered by kill chain phase (matrix_order)
- **155 techniques** (97 parent + 58 subtechniques) with maturity levels
- **35 mitigations** with category and technique mappings
- **52 case studies** with ordered procedure steps (tactic -> technique chains)
- **52 killchains** auto-generated from case studies with severity and attack category
- Technique IDs: `AML.T0051`, subtechniques: `AML.T0051.000`
- Many-to-many: technique <-> tactic, mitigation <-> technique

## Known Gotchas

- ATLAS YAML `category` field on mitigations is a **list**, not string - must be joined
- YAML date fields are `datetime.date` objects - use `str()` before DB insert
- Mitigation technique mappings use field name `use` (not `usage`) in YAML
- FTS5 virtual tables cannot be modified inside explicit SQLite transactions
- FTS5 search requires quoted terms: `" ".join(f'"{word}"' for word in q.split())`
- `sqlite3.Row` has no `.get()` method - convert to `dict()` first if needed
- GitHub search: use `in:name,description,topics` (not `in:readme`) for relevant results
- OSINT keyword mappings in `services/osint.py` TECHNIQUE_KEYWORDS dict for better search results
- Killchain node layout uses snake/zigzag pattern (3 cols, alternating L→R / R→L) with dynamic handle positions

## Implementation Phases

1. **Phase 1** (DONE): Data ingestion, SQLite schema, FastAPI REST API, Next.js matrix page
2. **Phase 2** (DONE): D3.js interactive matrix with hover tooltips, maturity filtering, tabbed technique detail
3. **Phase 3** (DONE): OSINT integration (GitHub/arXiv/NVD), async search, caching, live OSINT tab
4. **Phase 4** (DONE): Killchain visualization with React Flow diagrams
5. **Phase 5** (DONE): Polish - auto-sync, search UI, JSON export, NVIDIA Kill Chain comparison
6. **Phase 6** (DONE): Executive report generation, technique relationship graph
