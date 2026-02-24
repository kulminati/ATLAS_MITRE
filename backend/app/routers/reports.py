from fastapi import APIRouter

from app.database import get_db
from app.models.atlas import ExecutiveReport
from app.services.reporting import generate_executive_report

router = APIRouter(tags=["reports"])


@router.get("/reports/executive", response_model=ExecutiveReport)
def get_executive_report():
    conn = get_db()
    data = generate_executive_report(conn)
    return data
