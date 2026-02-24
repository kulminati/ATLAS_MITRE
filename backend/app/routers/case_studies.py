from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.database import get_db
from app.models.atlas import (
    CaseStudyDetail,
    CaseStudySummary,
    ProcedureStep,
    Reference,
)

router = APIRouter(tags=["case_studies"])


@router.get("/case-studies", response_model=list[CaseStudySummary])
def list_case_studies(
    type: Optional[str] = Query(None),
    technique_id: Optional[str] = Query(None),
):
    conn = get_db()

    if technique_id:
        rows = conn.execute(
            "SELECT DISTINCT cs.id, cs.name, cs.incident_date, cs.case_study_type, cs.target "
            "FROM case_studies cs "
            "JOIN case_study_procedures csp ON cs.id = csp.case_study_id "
            "WHERE csp.technique_id = ? "
            "ORDER BY cs.id",
            (technique_id,),
        ).fetchall()
    elif type:
        rows = conn.execute(
            "SELECT id, name, incident_date, case_study_type, target "
            "FROM case_studies WHERE case_study_type = ? ORDER BY id",
            (type,),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT id, name, incident_date, case_study_type, target "
            "FROM case_studies ORDER BY id"
        ).fetchall()

    return [CaseStudySummary(**dict(r)) for r in rows]


@router.get("/case-studies/{case_study_id}", response_model=CaseStudyDetail)
def get_case_study(case_study_id: str):
    conn = get_db()

    row = conn.execute(
        "SELECT * FROM case_studies WHERE id = ?", (case_study_id,)
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Case study not found")

    # Procedure steps with tactic/technique names
    proc_rows = conn.execute(
        "SELECT csp.step_order, csp.tactic_id, ta.name AS tactic_name, "
        "csp.technique_id, te.name AS technique_name, csp.description "
        "FROM case_study_procedures csp "
        "JOIN tactics ta ON csp.tactic_id = ta.id "
        "JOIN techniques te ON csp.technique_id = te.id "
        "WHERE csp.case_study_id = ? "
        "ORDER BY csp.step_order",
        (case_study_id,),
    ).fetchall()
    procedures = [ProcedureStep(**dict(pr)) for pr in proc_rows]

    # References
    ref_rows = conn.execute(
        "SELECT title, url FROM references_ WHERE entity_type = 'case_study' AND entity_id = ?",
        (case_study_id,),
    ).fetchall()
    references = [Reference(**dict(rr)) for rr in ref_rows]

    return CaseStudyDetail(
        id=row["id"],
        name=row["name"],
        summary=row["summary"],
        incident_date=row["incident_date"],
        incident_date_granularity=row["incident_date_granularity"],
        reporter=row["reporter"],
        target=row["target"],
        actor=row["actor"],
        case_study_type=row["case_study_type"],
        procedures=procedures,
        references=references,
    )
