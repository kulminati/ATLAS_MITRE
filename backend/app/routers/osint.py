"""OSINT API routes for technique enrichment."""

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.database import get_db
from app.services.osint import fetch_osint, get_cached_osint, clear_cache

router = APIRouter(tags=["osint"])


def _get_technique_name(technique_id: str) -> str:
    """Look up technique name from DB. Raises 404 if not found."""
    conn = get_db()
    row = conn.execute(
        "SELECT name FROM techniques WHERE id = ?", (technique_id,)
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail=f"Technique {technique_id} not found")
    return row["name"]


# NOTE: /osint/status must be defined BEFORE /osint/{technique_id}
# to avoid FastAPI matching "status" as a technique_id.

@router.get("/osint/status")
async def osint_status():
    """Get OSINT coverage statistics."""
    conn = get_db()

    total_techniques = conn.execute("SELECT COUNT(*) as c FROM techniques").fetchone()["c"]

    techniques_with_github = conn.execute(
        "SELECT COUNT(DISTINCT technique_id) as c FROM github_repos"
    ).fetchone()["c"]

    techniques_with_osint = conn.execute(
        "SELECT COUNT(DISTINCT technique_id) as c FROM osint_results"
    ).fetchone()["c"]

    total_repos = conn.execute("SELECT COUNT(*) as c FROM github_repos").fetchone()["c"]
    total_arxiv = conn.execute(
        "SELECT COUNT(*) as c FROM osint_results WHERE source = 'arxiv'"
    ).fetchone()["c"]
    total_nvd = conn.execute(
        "SELECT COUNT(*) as c FROM osint_results WHERE source = 'nvd'"
    ).fetchone()["c"]

    latest = conn.execute(
        "SELECT MAX(fetched_at) as latest FROM osint_results"
    ).fetchone()["latest"]

    return {
        "total_techniques": total_techniques,
        "techniques_with_github": techniques_with_github,
        "techniques_with_osint": techniques_with_osint,
        "total_github_repos": total_repos,
        "total_arxiv_papers": total_arxiv,
        "total_nvd_cves": total_nvd,
        "last_refresh": latest,
    }


@router.get("/osint/{technique_id}")
async def get_osint(technique_id: str, background_tasks: BackgroundTasks):
    """Get OSINT results for a technique.

    Returns cached results immediately if available.
    Triggers a background refresh if cache is stale or empty.
    """
    technique_name = _get_technique_name(technique_id)
    conn = get_db()

    # Try cache first
    cached = get_cached_osint(conn, technique_id)
    if cached is not None:
        return cached

    # No cache - do synchronous fetch
    result = await fetch_osint(conn, technique_id, technique_name)
    return result


@router.post("/osint/{technique_id}/refresh")
async def refresh_osint(technique_id: str):
    """Force refresh OSINT data for a technique (clears cache and re-fetches)."""
    technique_name = _get_technique_name(technique_id)
    conn = get_db()

    clear_cache(conn, technique_id)

    result = await fetch_osint(conn, technique_id, technique_name)
    return result
