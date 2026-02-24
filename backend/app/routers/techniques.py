import sqlite3
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.database import get_db
from app.models.atlas import (
    CaseStudySummary,
    GraphEdge,
    GraphNode,
    MitigationRef,
    TechniqueDetail,
    TechniqueGraph,
    TechniqueSummary,
)

router = APIRouter(tags=["techniques"])


def _technique_tactic_ids(conn: sqlite3.Connection, technique_id: str) -> list[str]:
    rows = conn.execute(
        "SELECT tactic_id FROM technique_tactics WHERE technique_id = ?",
        (technique_id,),
    ).fetchall()
    return [r["tactic_id"] for r in rows]


@router.get("/techniques", response_model=list[TechniqueSummary])
def list_techniques(
    tactic_id: Optional[str] = Query(None),
    maturity: Optional[str] = Query(None),
    subtechniques: Optional[bool] = Query(None),
):
    conn = get_db()

    conditions: list[str] = []
    params: list[str | bool] = []

    if tactic_id:
        conditions.append(
            "te.id IN (SELECT technique_id FROM technique_tactics WHERE tactic_id = ?)"
        )
        params.append(tactic_id)
    if maturity:
        conditions.append("te.maturity = ?")
        params.append(maturity)
    if subtechniques is not None:
        conditions.append("te.is_subtechnique = ?")
        params.append(subtechniques)

    where = ""
    if conditions:
        where = "WHERE " + " AND ".join(conditions)

    rows = conn.execute(
        f"SELECT te.id, te.name, te.is_subtechnique, te.maturity "
        f"FROM techniques te {where} ORDER BY te.id",
        params,
    ).fetchall()

    results = []
    for r in rows:
        tactic_ids = _technique_tactic_ids(conn, r["id"])
        results.append(
            TechniqueSummary(
                id=r["id"],
                name=r["name"],
                is_subtechnique=bool(r["is_subtechnique"]),
                maturity=r["maturity"],
                tactic_ids=tactic_ids,
            )
        )
    return results


@router.get("/techniques/graph", response_model=TechniqueGraph)
def get_technique_graph():
    """Return a graph of technique co-occurrence in case studies."""
    conn = get_db()

    # Get parent techniques only (not subtechniques) with their case study counts
    tech_rows = conn.execute(
        "SELECT t.id, t.name, t.maturity, "
        "  (SELECT COUNT(DISTINCT csp.case_study_id) "
        "   FROM case_study_procedures csp WHERE csp.technique_id = t.id) AS case_study_count "
        "FROM techniques t "
        "WHERE t.is_subtechnique = 0 "
        "ORDER BY t.id"
    ).fetchall()

    nodes: list[GraphNode] = []
    for r in tech_rows:
        tactic_ids = _technique_tactic_ids(conn, r["id"])
        nodes.append(
            GraphNode(
                id=r["id"],
                name=r["name"],
                tactic_ids=tactic_ids,
                maturity=r["maturity"],
                case_study_count=r["case_study_count"],
            )
        )

    # Find co-occurring technique pairs in case studies.
    # We resolve subtechniques to their parent for edge aggregation so that
    # the graph only shows parent-level connections.
    edge_rows = conn.execute(
        "SELECT t1_parent, t2_parent, COUNT(*) AS weight FROM ("
        "  SELECT DISTINCT"
        "    COALESCE(p1.id, a.technique_id) AS t1_parent,"
        "    COALESCE(p2.id, b.technique_id) AS t2_parent,"
        "    a.case_study_id"
        "  FROM case_study_procedures a"
        "  JOIN case_study_procedures b"
        "    ON a.case_study_id = b.case_study_id"
        "  LEFT JOIN techniques t1 ON a.technique_id = t1.id"
        "  LEFT JOIN techniques p1 ON t1.parent_technique_id = p1.id"
        "  LEFT JOIN techniques t2 ON b.technique_id = t2.id"
        "  LEFT JOIN techniques p2 ON t2.parent_technique_id = p2.id"
        "  WHERE COALESCE(p1.id, a.technique_id) < COALESCE(p2.id, b.technique_id)"
        ") sub "
        "GROUP BY t1_parent, t2_parent "
        "ORDER BY weight DESC"
    ).fetchall()

    # Build a set of valid parent technique IDs for filtering
    parent_ids = {n.id for n in nodes}
    edges: list[GraphEdge] = []
    for r in edge_rows:
        src = r["t1_parent"]
        tgt = r["t2_parent"]
        if src in parent_ids and tgt in parent_ids:
            edges.append(GraphEdge(source=src, target=tgt, weight=r["weight"]))

    return TechniqueGraph(nodes=nodes, edges=edges)


@router.get("/techniques/{technique_id}/export")
def export_technique(technique_id: str):
    """Export a technique as comprehensive JSON for download."""
    conn = get_db()

    row = conn.execute(
        "SELECT * FROM techniques WHERE id = ?", (technique_id,)
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Technique not found")

    tactic_ids = _technique_tactic_ids(conn, technique_id)

    # Tactic names
    tactic_rows = conn.execute(
        "SELECT id, name FROM tactics WHERE id IN ({})".format(
            ",".join("?" for _ in tactic_ids)
        ),
        tactic_ids,
    ).fetchall() if tactic_ids else []
    tactic_map = {r["id"]: r["name"] for r in tactic_rows}

    # Subtechniques
    sub_rows = conn.execute(
        "SELECT id, name, maturity FROM techniques WHERE parent_technique_id = ? ORDER BY id",
        (technique_id,),
    ).fetchall()

    # Mitigations
    mit_rows = conn.execute(
        "SELECT m.id, m.name, m.category, mt.usage "
        "FROM mitigation_techniques mt "
        "JOIN mitigations m ON mt.mitigation_id = m.id "
        "WHERE mt.technique_id = ?",
        (technique_id,),
    ).fetchall()

    # Case studies
    cs_rows = conn.execute(
        "SELECT DISTINCT cs.id, cs.name, cs.incident_date, cs.case_study_type, cs.target "
        "FROM case_study_procedures csp "
        "JOIN case_studies cs ON csp.case_study_id = cs.id "
        "WHERE csp.technique_id = ?",
        (technique_id,),
    ).fetchall()

    export_data = {
        "export_type": "technique",
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "is_subtechnique": bool(row["is_subtechnique"]),
        "parent_technique_id": row["parent_technique_id"],
        "maturity": row["maturity"],
        "attck_id": row["attck_id"],
        "attck_url": row["attck_url"],
        "created_date": row["created_date"],
        "modified_date": row["modified_date"],
        "tactics": [
            {"id": tid, "name": tactic_map.get(tid)} for tid in tactic_ids
        ],
        "subtechniques": [
            {"id": sr["id"], "name": sr["name"], "maturity": sr["maturity"]}
            for sr in sub_rows
        ],
        "mitigations": [
            {"id": mr["id"], "name": mr["name"], "category": mr["category"], "usage": mr["usage"]}
            for mr in mit_rows
        ],
        "case_studies": [
            {"id": cr["id"], "name": cr["name"], "incident_date": cr["incident_date"],
             "case_study_type": cr["case_study_type"], "target": cr["target"]}
            for cr in cs_rows
        ],
    }
    return export_data


@router.get("/techniques/{technique_id}", response_model=TechniqueDetail)
def get_technique(technique_id: str):
    conn = get_db()

    row = conn.execute(
        "SELECT * FROM techniques WHERE id = ?", (technique_id,)
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Technique not found")

    # Tactic IDs
    tactic_ids = _technique_tactic_ids(conn, technique_id)

    # Subtechniques
    sub_rows = conn.execute(
        "SELECT id, name, is_subtechnique, maturity "
        "FROM techniques WHERE parent_technique_id = ? ORDER BY id",
        (technique_id,),
    ).fetchall()
    subtechniques = []
    for sr in sub_rows:
        sub_tactic_ids = _technique_tactic_ids(conn, sr["id"])
        subtechniques.append(
            TechniqueSummary(
                id=sr["id"],
                name=sr["name"],
                is_subtechnique=bool(sr["is_subtechnique"]),
                maturity=sr["maturity"],
                tactic_ids=sub_tactic_ids,
            )
        )

    # Mitigations
    mit_rows = conn.execute(
        "SELECT m.id, m.name, m.category, mt.usage "
        "FROM mitigation_techniques mt "
        "JOIN mitigations m ON mt.mitigation_id = m.id "
        "WHERE mt.technique_id = ?",
        (technique_id,),
    ).fetchall()
    mitigations = [MitigationRef(**dict(mr)) for mr in mit_rows]

    # Case studies (via procedures that reference this technique)
    cs_rows = conn.execute(
        "SELECT DISTINCT cs.id, cs.name, cs.incident_date, cs.case_study_type, cs.target "
        "FROM case_study_procedures csp "
        "JOIN case_studies cs ON csp.case_study_id = cs.id "
        "WHERE csp.technique_id = ?",
        (technique_id,),
    ).fetchall()
    case_studies = [CaseStudySummary(**dict(cr)) for cr in cs_rows]

    return TechniqueDetail(
        id=row["id"],
        name=row["name"],
        description=row["description"],
        is_subtechnique=bool(row["is_subtechnique"]),
        parent_technique_id=row["parent_technique_id"],
        maturity=row["maturity"],
        attck_id=row["attck_id"],
        attck_url=row["attck_url"],
        created_date=row["created_date"],
        modified_date=row["modified_date"],
        tactic_ids=tactic_ids,
        subtechniques=subtechniques,
        mitigations=mitigations,
        case_studies=case_studies,
    )


@router.get("/search")
def search(q: str = Query(..., min_length=1)):
    conn = get_db()

    # FTS5 requires special syntax - wrap each word with * for prefix matching
    # and quote the whole thing to handle special characters
    fts_query = " ".join(f'"{word}"' for word in q.split())

    technique_rows = conn.execute(
        "SELECT id, name, description FROM techniques_fts WHERE techniques_fts MATCH ? LIMIT 50",
        (fts_query,),
    ).fetchall()

    case_study_rows = conn.execute(
        "SELECT id, name, summary FROM case_studies_fts WHERE case_studies_fts MATCH ? LIMIT 50",
        (fts_query,),
    ).fetchall()

    return {
        "techniques": [dict(r) for r in technique_rows],
        "case_studies": [dict(r) for r in case_study_rows],
    }
