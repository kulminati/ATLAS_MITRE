"""Seed killchains from all case studies that have procedure steps.

Usage:
    python3 -m scripts.seed_killchains
"""

import sys
from pathlib import Path

# Ensure the backend package is importable when run as a script
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db
from app.services.killchain_service import build_killchain_from_case_study


def seed_killchains() -> dict:
    """Create killchains for every case study that has procedure steps.

    Returns a summary dict with counts.
    """
    conn = get_db()

    # Check if killchains already exist
    existing = conn.execute("SELECT COUNT(*) FROM killchains").fetchone()[0]
    if existing > 0:
        print(f"Found {existing} existing killchains. Clearing before re-seed...")
        conn.execute("DELETE FROM killchain_steps")
        conn.execute("DELETE FROM killchains")
        conn.commit()

    # Find all case studies that have procedure steps
    rows = conn.execute(
        "SELECT DISTINCT cs.id, cs.name, COUNT(csp.id) AS step_count "
        "FROM case_studies cs "
        "JOIN case_study_procedures csp ON cs.id = csp.case_study_id "
        "GROUP BY cs.id "
        "ORDER BY cs.id"
    ).fetchall()

    print(f"Found {len(rows)} case studies with procedure steps.")

    created = 0
    skipped = 0

    for r in rows:
        cs_id = r["id"]
        cs_name = r["name"]
        step_count = r["step_count"]

        killchain_id = build_killchain_from_case_study(conn, cs_id)
        if killchain_id:
            created += 1
            print(f"  [{created:3d}] {cs_id}: \"{cs_name}\" -> killchain #{killchain_id} ({step_count} steps)")
        else:
            skipped += 1
            print(f"  [SKIP] {cs_id}: \"{cs_name}\" (no procedures)")

    conn.commit()

    # Print summary
    summary = {
        "total_case_studies": len(rows),
        "killchains_created": created,
        "skipped": skipped,
    }

    # Print severity/category breakdown
    severity_rows = conn.execute(
        "SELECT severity, COUNT(*) as cnt FROM killchains GROUP BY severity ORDER BY cnt DESC"
    ).fetchall()
    category_rows = conn.execute(
        "SELECT attack_category, COUNT(*) as cnt FROM killchains GROUP BY attack_category ORDER BY cnt DESC"
    ).fetchall()
    total_steps = conn.execute("SELECT COUNT(*) FROM killchain_steps").fetchone()[0]

    print(f"\nSeed complete: {created} killchains created, {total_steps} total steps.")
    print("\nSeverity breakdown:")
    for row in severity_rows:
        print(f"  {row['severity']:10s}: {row['cnt']}")
    print("\nCategory breakdown:")
    for row in category_rows:
        print(f"  {row['attack_category']:25s}: {row['cnt']}")

    return summary


if __name__ == "__main__":
    seed_killchains()
