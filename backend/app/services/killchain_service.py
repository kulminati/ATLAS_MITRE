"""Killchain service: build, query, and generate React Flow diagrams from case studies."""

import logging
import sqlite3
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Must match frontend/src/lib/colors.ts
TACTIC_COLORS = {
    "AML.TA0002": "#6366f1",  # Reconnaissance - indigo
    "AML.TA0003": "#8b5cf6",  # Resource Development - violet
    "AML.TA0004": "#ec4899",  # Initial Access - pink
    "AML.TA0000": "#ef4444",  # ML Model Access - red
    "AML.TA0005": "#f97316",  # Execution - orange
    "AML.TA0006": "#eab308",  # Persistence - yellow
    "AML.TA0012": "#84cc16",  # Privilege Escalation - lime
    "AML.TA0007": "#22c55e",  # Defense Evasion - green
    "AML.TA0013": "#14b8a6",  # Credential Access - teal
    "AML.TA0008": "#06b6d4",  # Discovery - cyan
    "AML.TA0015": "#0ea5e9",  # Lateral Movement - sky
    "AML.TA0009": "#3b82f6",  # Collection - blue
    "AML.TA0001": "#a855f7",  # ML Attack Staging - purple
    "AML.TA0014": "#d946ef",  # Command and Control - fuchsia
    "AML.TA0010": "#f43f5e",  # Exfiltration - rose
    "AML.TA0011": "#dc2626",  # Impact - dark red
}

# Technique ID -> attack category mapping
TECHNIQUE_CATEGORY_MAP = {
    "AML.T0020": "Data Poisoning",
    "AML.T0018": "Data Poisoning",
    "AML.T0019": "Data Poisoning",
    "AML.T0051": "Prompt Injection",
    "AML.T0024": "Model Extraction",
    "AML.T0044": "Model Extraction",
    "AML.T0043": "Adversarial Evasion",
    "AML.T0043.000": "Adversarial Evasion",
    "AML.T0043.001": "Adversarial Evasion",
    "AML.T0043.002": "Adversarial Evasion",
    "AML.T0043.003": "Adversarial Evasion",
    "AML.T0047": "ML Supply Chain",
    "AML.T0010": "ML Supply Chain",
    "AML.T0011": "ML Supply Chain",
    "AML.T0012": "Exfiltration",
    "AML.T0025": "Exfiltration",
    "AML.T0048": "Model Inference",
    "AML.T0049": "Model Inference",
    "AML.T0024.000": "Model Extraction",
    "AML.T0024.001": "Model Extraction",
    "AML.T0005": "Model Replication",
    "AML.T0042": "Adversarial Evasion",
    "AML.T0040": "Model Inversion",
}

DEFAULT_CATEGORY = "AI/ML Attack"

COLS = 3
COL_WIDTH = 300
ROW_HEIGHT = 320


def generate_flow_positions(steps: list[dict]) -> list[dict]:
    """Calculate x,y positions for nodes in a zigzag/snake layout.

    Row 0: nodes at x=0, x=300, x=600 (left to right)
    Row 1: nodes at x=600, x=300, x=0  (right to left)
    Row 2: repeat pattern
    y spacing: 150px per row
    """
    positions = []
    for i, step in enumerate(steps):
        row = i // COLS
        col = i % COLS
        # Even rows go left-to-right, odd rows go right-to-left
        if row % 2 == 1:
            col = COLS - 1 - col
        positions.append({
            "id": step["id"],
            "x": col * COL_WIDTH,
            "y": row * ROW_HEIGHT,
        })
    return positions


def _determine_severity(steps: list[dict]) -> str:
    """Auto-assign severity based on tactic presence and step count."""
    tactic_ids = {s.get("tactic_id", "") for s in steps}
    # Critical if Impact tactic is present
    if "AML.TA0011" in tactic_ids:
        return "critical"
    step_count = len(steps)
    if step_count >= 6:
        return "high"
    if step_count >= 3:
        return "medium"
    return "low"


def _determine_attack_category(steps: list[dict]) -> str:
    """Auto-determine attack category from dominant technique patterns."""
    category_counts: dict[str, int] = {}
    for step in steps:
        technique_id = step.get("technique_id", "")
        # Check exact match first, then base technique ID
        cat = TECHNIQUE_CATEGORY_MAP.get(technique_id)
        if not cat:
            base_id = technique_id.split(".")[0] + "." + technique_id.split(".")[1] if "." in technique_id else technique_id
            cat = TECHNIQUE_CATEGORY_MAP.get(base_id)
        if cat:
            category_counts[cat] = category_counts.get(cat, 0) + 1

    if not category_counts:
        return DEFAULT_CATEGORY

    # Return the most common category
    return max(category_counts, key=lambda k: category_counts[k])


def build_killchain_from_case_study(conn: sqlite3.Connection, case_study_id: str) -> int | None:
    """Build a killchain from a case study's procedure steps.

    Returns the created killchain ID, or None if the case study has no procedures.
    """
    # Read case study
    cs_row = conn.execute(
        "SELECT id, name, summary, incident_date FROM case_studies WHERE id = ?",
        (case_study_id,),
    ).fetchone()
    if not cs_row:
        logger.warning("Case study %s not found", case_study_id)
        return None

    # Read procedure steps
    proc_rows = conn.execute(
        "SELECT step_order, tactic_id, technique_id, description "
        "FROM case_study_procedures "
        "WHERE case_study_id = ? ORDER BY step_order",
        (case_study_id,),
    ).fetchall()
    if not proc_rows:
        logger.info("Case study %s has no procedure steps, skipping", case_study_id)
        return None

    steps = [dict(r) for r in proc_rows]

    severity = _determine_severity(steps)
    attack_category = _determine_attack_category(steps)

    # Parse year from incident_date
    year = None
    incident_date = cs_row["incident_date"]
    if incident_date:
        try:
            year = int(str(incident_date)[:4])
        except (ValueError, IndexError):
            pass

    # Insert killchain record
    cursor = conn.execute(
        "INSERT INTO killchains (name, description, source_case_study_id, severity, attack_category, year, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            cs_row["name"],
            cs_row["summary"],
            case_study_id,
            severity,
            attack_category,
            year,
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    killchain_id = cursor.lastrowid

    # Insert killchain steps from procedure steps
    for step in steps:
        conn.execute(
            "INSERT INTO killchain_steps (killchain_id, step_order, tactic_id, technique_id, description) "
            "VALUES (?, ?, ?, ?, ?)",
            (
                killchain_id,
                step["step_order"],
                step["tactic_id"],
                step["technique_id"],
                step["description"],
            ),
        )

    return killchain_id


def get_killchain_with_flow(conn: sqlite3.Connection, killchain_id: int) -> dict | None:
    """Fetch a killchain with steps and generate React Flow diagram data.

    Returns a dict with killchain info, steps, and diagram (nodes + edges).
    """
    kc_row = conn.execute(
        "SELECT * FROM killchains WHERE id = ?", (killchain_id,)
    ).fetchone()
    if not kc_row:
        return None

    # Fetch steps with joined tactic/technique names
    step_rows = conn.execute(
        "SELECT ks.id, ks.step_order, ks.tactic_id, ta.name AS tactic_name, "
        "ks.technique_id, te.name AS technique_name, ks.description "
        "FROM killchain_steps ks "
        "LEFT JOIN tactics ta ON ks.tactic_id = ta.id "
        "LEFT JOIN techniques te ON ks.technique_id = te.id "
        "WHERE ks.killchain_id = ? "
        "ORDER BY ks.step_order",
        (killchain_id,),
    ).fetchall()

    steps = []
    for r in step_rows:
        steps.append({
            "id": str(r["id"]),
            "step_order": r["step_order"],
            "tactic_id": r["tactic_id"],
            "tactic_name": r["tactic_name"],
            "technique_id": r["technique_id"],
            "technique_name": r["technique_name"],
            "description": r["description"],
        })

    # Generate React Flow nodes and edges
    positions = generate_flow_positions(steps)
    pos_map = {p["id"]: p for p in positions}

    nodes = []
    for step in steps:
        pos = pos_map.get(step["id"], {"x": 0, "y": 0})
        color = TACTIC_COLORS.get(step["tactic_id"], "#6b7280")
        nodes.append({
            "id": step["id"],
            "type": "killchainStep",
            "position": {"x": pos["x"], "y": pos["y"]},
            "data": {
                "step_order": step["step_order"],
                "tactic_id": step["tactic_id"],
                "tactic_name": step["tactic_name"],
                "technique_id": step["technique_id"],
                "technique_name": step["technique_name"],
                "description": step["description"],
                "color": color,
            },
        })

    edges = []
    for i in range(len(steps) - 1):
        edges.append({
            "id": f"e-{steps[i]['id']}-{steps[i + 1]['id']}",
            "source": steps[i]["id"],
            "target": steps[i + 1]["id"],
            "animated": True,
            "style": {"stroke": "#64748b", "strokeWidth": 2},
        })

    return {
        "id": kc_row["id"],
        "name": kc_row["name"],
        "description": kc_row["description"],
        "source_case_study_id": kc_row["source_case_study_id"],
        "severity": kc_row["severity"],
        "attack_category": kc_row["attack_category"],
        "year": kc_row["year"],
        "steps": steps,
        "nodes": nodes,
        "edges": edges,
    }


def list_killchains(
    conn: sqlite3.Connection,
    category: str | None = None,
    severity: str | None = None,
) -> list[dict]:
    """List all killchains with basic info and step count."""
    query = (
        "SELECT k.*, COUNT(ks.id) AS step_count "
        "FROM killchains k "
        "LEFT JOIN killchain_steps ks ON k.id = ks.killchain_id "
    )
    conditions = []
    params: list = []

    if category:
        conditions.append("k.attack_category = ?")
        params.append(category)
    if severity:
        conditions.append("k.severity = ?")
        params.append(severity)

    if conditions:
        query += "WHERE " + " AND ".join(conditions) + " "

    query += "GROUP BY k.id ORDER BY k.id"

    rows = conn.execute(query, params).fetchall()
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "description": r["description"],
            "source_case_study_id": r["source_case_study_id"],
            "severity": r["severity"],
            "attack_category": r["attack_category"],
            "year": r["year"],
            "created_at": r["created_at"],
            "step_count": r["step_count"],
        }
        for r in rows
    ]
