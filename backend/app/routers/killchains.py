from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.database import get_db
from app.models.atlas import (
    KillchainDetail,
    KillchainStepSummary,
    KillchainSummary,
    FlowNode,
    FlowEdge,
)
from app.services.killchain_service import (
    get_killchain_with_flow,
    list_killchains,
)

router = APIRouter(tags=["killchains"])


@router.get("/killchains/categories", response_model=list[str])
def get_categories():
    conn = get_db()
    rows = conn.execute(
        "SELECT DISTINCT attack_category FROM killchains "
        "WHERE attack_category IS NOT NULL ORDER BY attack_category"
    ).fetchall()
    return [r["attack_category"] for r in rows]


@router.post("/killchains/seed")
def seed_killchains():
    from app.services.killchain_service import build_killchain_from_case_study

    conn = get_db()

    # Find case studies that have procedure steps
    cs_rows = conn.execute(
        "SELECT DISTINCT cs.id FROM case_studies cs "
        "JOIN case_study_procedures csp ON cs.id = csp.case_study_id "
        "ORDER BY cs.id"
    ).fetchall()

    # Check if killchains already exist
    existing = conn.execute("SELECT COUNT(*) as cnt FROM killchains").fetchone()
    if existing["cnt"] > 0:
        return {"message": "Killchains already seeded", "count": existing["cnt"]}

    count = 0
    for cs_row in cs_rows:
        build_killchain_from_case_study(conn, cs_row["id"])
        count += 1

    return {"message": f"Seeded {count} killchains", "count": count}


@router.get("/killchains", response_model=list[KillchainSummary])
def get_killchains(
    category: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    conn = get_db()
    return list_killchains(conn, category=category, severity=severity)


@router.get("/killchains/{killchain_id}/export")
def export_killchain(killchain_id: int):
    """Export a killchain as comprehensive JSON for download."""
    conn = get_db()
    result = get_killchain_with_flow(conn, killchain_id)
    if not result:
        raise HTTPException(status_code=404, detail="Killchain not found")

    # Build export payload (exclude React Flow diagram data, keep semantic data)
    export_data = {
        "export_type": "killchain",
        "id": result["id"],
        "name": result["name"],
        "description": result["description"],
        "source_case_study_id": result["source_case_study_id"],
        "severity": result["severity"],
        "attack_category": result["attack_category"],
        "year": result["year"],
        "steps": [
            {
                "step_order": s["step_order"],
                "tactic_id": s["tactic_id"],
                "tactic_name": s["tactic_name"],
                "technique_id": s["technique_id"],
                "technique_name": s["technique_name"],
                "description": s["description"],
            }
            for s in result["steps"]
        ],
        "step_count": len(result["steps"]),
    }
    return export_data


@router.get("/killchains/{killchain_id}", response_model=KillchainDetail)
def get_killchain(killchain_id: int):
    conn = get_db()
    result = get_killchain_with_flow(conn, killchain_id)
    if not result:
        raise HTTPException(status_code=404, detail="Killchain not found")
    return result
