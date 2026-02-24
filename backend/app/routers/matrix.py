import sqlite3
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.database import get_db
from app.models.atlas import (
    MatrixResponse,
    MitigationDetail,
    TacticDetail,
    TacticSummary,
    TechniqueRef,
    TechniqueSummary,
)

router = APIRouter(tags=["matrix"])


def _technique_tactic_ids(conn: sqlite3.Connection, technique_id: str) -> list[str]:
    rows = conn.execute(
        "SELECT tactic_id FROM technique_tactics WHERE technique_id = ?",
        (technique_id,),
    ).fetchall()
    return [r["tactic_id"] for r in rows]


@router.get("/matrix", response_model=MatrixResponse)
def get_matrix():
    conn = get_db()

    # Version from metadata
    meta = conn.execute("SELECT version FROM atlas_metadata LIMIT 1").fetchone()
    version = meta["version"] if meta else "unknown"

    # Tactics ordered by matrix_order
    tactics_rows = conn.execute(
        "SELECT t.id, t.name, t.matrix_order, "
        "(SELECT COUNT(*) FROM technique_tactics tt WHERE tt.tactic_id = t.id) AS technique_count "
        "FROM tactics t ORDER BY t.matrix_order"
    ).fetchall()

    tactics = [TacticSummary(**dict(r)) for r in tactics_rows]

    # For each tactic, get its techniques
    tactic_techniques: dict[str, list[TechniqueSummary]] = {}
    for tactic in tactics:
        tech_rows = conn.execute(
            "SELECT te.id, te.name, te.is_subtechnique, te.maturity "
            "FROM techniques te "
            "JOIN technique_tactics tt ON te.id = tt.technique_id "
            "WHERE tt.tactic_id = ? "
            "ORDER BY te.id",
            (tactic.id,),
        ).fetchall()

        tech_summaries = []
        for tr in tech_rows:
            tactic_ids = _technique_tactic_ids(conn, tr["id"])
            tech_summaries.append(
                TechniqueSummary(
                    id=tr["id"],
                    name=tr["name"],
                    is_subtechnique=bool(tr["is_subtechnique"]),
                    maturity=tr["maturity"],
                    tactic_ids=tactic_ids,
                )
            )
        tactic_techniques[tactic.id] = tech_summaries

    return MatrixResponse(
        version=version, tactics=tactics, tactic_techniques=tactic_techniques
    )


@router.get("/tactics", response_model=list[TacticSummary])
def list_tactics():
    conn = get_db()
    rows = conn.execute(
        "SELECT t.id, t.name, t.matrix_order, "
        "(SELECT COUNT(*) FROM technique_tactics tt WHERE tt.tactic_id = t.id) AS technique_count "
        "FROM tactics t ORDER BY t.matrix_order"
    ).fetchall()
    return [TacticSummary(**dict(r)) for r in rows]


@router.get("/tactics/{tactic_id}", response_model=TacticDetail)
def get_tactic(tactic_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM tactics WHERE id = ?", (tactic_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Tactic not found")

    tech_rows = conn.execute(
        "SELECT te.id, te.name, te.is_subtechnique, te.maturity "
        "FROM techniques te "
        "JOIN technique_tactics tt ON te.id = tt.technique_id "
        "WHERE tt.tactic_id = ? "
        "ORDER BY te.id",
        (tactic_id,),
    ).fetchall()

    techniques = []
    for tr in tech_rows:
        tactic_ids = _technique_tactic_ids(conn, tr["id"])
        techniques.append(
            TechniqueSummary(
                id=tr["id"],
                name=tr["name"],
                is_subtechnique=bool(tr["is_subtechnique"]),
                maturity=tr["maturity"],
                tactic_ids=tactic_ids,
            )
        )

    return TacticDetail(
        id=row["id"],
        name=row["name"],
        description=row["description"],
        matrix_order=row["matrix_order"],
        attck_id=row["attck_id"],
        attck_url=row["attck_url"],
        techniques=techniques,
    )


@router.get("/mitigations", response_model=list[MitigationDetail])
def list_mitigations(category: Optional[str] = Query(None)):
    conn = get_db()

    if category:
        rows = conn.execute(
            "SELECT * FROM mitigations WHERE category = ? ORDER BY id",
            (category,),
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM mitigations ORDER BY id").fetchall()

    results = []
    for r in rows:
        # Get lifecycle stages
        stage_rows = conn.execute(
            "SELECT lifecycle_stage FROM mitigation_lifecycle WHERE mitigation_id = ?",
            (r["id"],),
        ).fetchall()
        lifecycle_stages = [s["lifecycle_stage"] for s in stage_rows]

        # Get techniques
        tech_rows = conn.execute(
            "SELECT t.id, t.name, mt.usage "
            "FROM mitigation_techniques mt "
            "JOIN techniques t ON mt.technique_id = t.id "
            "WHERE mt.mitigation_id = ?",
            (r["id"],),
        ).fetchall()
        techniques = [TechniqueRef(**dict(tr)) for tr in tech_rows]

        results.append(
            MitigationDetail(
                id=r["id"],
                name=r["name"],
                description=r["description"],
                category=r["category"],
                attck_id=r["attck_id"],
                attck_url=r["attck_url"],
                lifecycle_stages=lifecycle_stages,
                techniques=techniques,
            )
        )

    return results
