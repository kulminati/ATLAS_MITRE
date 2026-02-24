from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.database import get_db
from app.models.atlas import SyncStatus

router = APIRouter(tags=["sync"])

STALE_DAYS = 7


def _check_needs_sync(tactics_count: int, last_updated: str | None) -> bool:
    """Return True if data is missing or older than STALE_DAYS."""
    if tactics_count == 0:
        return True
    if not last_updated:
        return True
    try:
        updated_dt = datetime.fromisoformat(last_updated)
        if updated_dt.tzinfo is None:
            updated_dt = updated_dt.replace(tzinfo=timezone.utc)
        age = datetime.now(timezone.utc) - updated_dt
        return age.days >= STALE_DAYS
    except (ValueError, TypeError):
        return True


@router.get("/sync/status", response_model=SyncStatus)
def sync_status():
    conn = get_db()

    meta = conn.execute("SELECT version, last_updated FROM atlas_metadata LIMIT 1").fetchone()
    version = meta["version"] if meta else None
    last_updated = meta["last_updated"] if meta else None

    tactics_count = conn.execute("SELECT COUNT(*) AS c FROM tactics").fetchone()["c"]
    techniques_count = conn.execute("SELECT COUNT(*) AS c FROM techniques").fetchone()["c"]
    case_studies_count = conn.execute("SELECT COUNT(*) AS c FROM case_studies").fetchone()["c"]

    return SyncStatus(
        version=version,
        last_updated=last_updated,
        tactics_count=tactics_count,
        techniques_count=techniques_count,
        case_studies_count=case_studies_count,
        needs_sync=_check_needs_sync(tactics_count, last_updated),
    )


@router.post("/sync")
def trigger_sync():
    try:
        from app.services.ingestion import ingest_atlas
        conn = get_db()
        result = ingest_atlas(conn)
        return {"status": "ok", "detail": result}
    except ImportError:
        raise HTTPException(
            status_code=501,
            detail="Ingestion service not yet implemented",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
