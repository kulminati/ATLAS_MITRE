import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_db
from app.routers import case_studies, killchains, matrix, osint, reports, sync, techniques

logger = logging.getLogger(__name__)

app = FastAPI(
    title="ATLAS Threat Intelligence API",
    description="API for MITRE ATLAS matrix data, OSINT, and killchain visualization",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matrix.router, prefix="/api")
app.include_router(techniques.router, prefix="/api")
app.include_router(case_studies.router, prefix="/api")
app.include_router(sync.router, prefix="/api")
app.include_router(osint.router, prefix="/api")
app.include_router(killchains.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.on_event("startup")
def startup():
    conn = get_db()

    # Auto-sync: check if data is missing or stale
    from app.routers.sync import _check_needs_sync

    meta = conn.execute("SELECT last_updated FROM atlas_metadata LIMIT 1").fetchone()
    last_updated = meta["last_updated"] if meta else None
    tactics_count = conn.execute("SELECT COUNT(*) AS c FROM tactics").fetchone()["c"]

    if _check_needs_sync(tactics_count, last_updated):
        logger.info("Auto-sync: data is missing or stale, triggering ingestion...")
        try:
            from app.services.ingestion import ingest_atlas
            result = ingest_atlas(conn)
            logger.info("Auto-sync complete: %s", result)
        except Exception:
            logger.exception("Auto-sync failed, will retry on next startup")


@app.get("/api/health")
def health():
    return {"status": "ok"}
