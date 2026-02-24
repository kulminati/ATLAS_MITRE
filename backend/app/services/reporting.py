"""Reporting service: compile executive report data from the ATLAS database."""

import logging
import sqlite3

logger = logging.getLogger(__name__)

# Maturity ranking for risk scoring (higher = more mature/dangerous)
MATURITY_RANK = {
    "realized": 3,
    "demonstrated": 2,
    "feasible": 1,
}


def _get_executive_summary(conn: sqlite3.Connection) -> dict:
    """Gather top-level counts for the executive summary."""
    tactics_count = conn.execute("SELECT COUNT(*) AS c FROM tactics").fetchone()["c"]
    techniques_total = conn.execute("SELECT COUNT(*) AS c FROM techniques").fetchone()["c"]
    case_studies_count = conn.execute("SELECT COUNT(*) AS c FROM case_studies").fetchone()["c"]
    killchains_count = conn.execute("SELECT COUNT(*) AS c FROM killchains").fetchone()["c"]
    mitigations_count = conn.execute("SELECT COUNT(*) AS c FROM mitigations").fetchone()["c"]

    # Techniques by maturity
    maturity_rows = conn.execute(
        "SELECT maturity, COUNT(*) AS c FROM techniques GROUP BY maturity"
    ).fetchall()
    techniques_by_maturity = {r["maturity"] or "unknown": r["c"] for r in maturity_rows}

    # Parent vs subtechnique counts
    parent_count = conn.execute(
        "SELECT COUNT(*) AS c FROM techniques WHERE is_subtechnique = 0"
    ).fetchone()["c"]
    subtechnique_count = conn.execute(
        "SELECT COUNT(*) AS c FROM techniques WHERE is_subtechnique = 1"
    ).fetchone()["c"]

    return {
        "tactics_count": tactics_count,
        "techniques_total": techniques_total,
        "parent_techniques": parent_count,
        "subtechniques": subtechnique_count,
        "techniques_by_maturity": techniques_by_maturity,
        "case_studies_count": case_studies_count,
        "killchains_count": killchains_count,
        "mitigations_count": mitigations_count,
    }


def _get_tactic_breakdown(conn: sqlite3.Connection) -> list[dict]:
    """Get technique count and case study count per tactic."""
    rows = conn.execute(
        "SELECT t.id, t.name, t.matrix_order, "
        "(SELECT COUNT(*) FROM technique_tactics tt WHERE tt.tactic_id = t.id) AS technique_count, "
        "(SELECT COUNT(DISTINCT csp.case_study_id) FROM case_study_procedures csp WHERE csp.tactic_id = t.id) AS case_study_count "
        "FROM tactics t ORDER BY t.matrix_order"
    ).fetchall()
    return [
        {
            "tactic_id": r["id"],
            "tactic_name": r["name"],
            "matrix_order": r["matrix_order"],
            "technique_count": r["technique_count"],
            "case_study_count": r["case_study_count"],
        }
        for r in rows
    ]


def _get_top_risk_techniques(conn: sqlite3.Connection, limit: int = 10) -> list[dict]:
    """Rank techniques by risk: maturity level, then case study count, then OSINT signal."""
    rows = conn.execute(
        "SELECT t.id, t.name, t.maturity, t.is_subtechnique, "
        "(SELECT COUNT(DISTINCT csp.case_study_id) FROM case_study_procedures csp WHERE csp.technique_id = t.id) AS case_study_count, "
        "(SELECT COUNT(*) FROM osint_results o WHERE o.technique_id = t.id) AS osint_count, "
        "(SELECT COUNT(*) FROM github_repos g WHERE g.technique_id = t.id) AS github_count "
        "FROM techniques t "
        "ORDER BY t.id"
    ).fetchall()

    scored = []
    for r in rows:
        maturity_score = MATURITY_RANK.get(r["maturity"] or "", 0)
        case_count = r["case_study_count"]
        osint_signal = r["osint_count"] + r["github_count"]
        scored.append({
            "technique_id": r["id"],
            "technique_name": r["name"],
            "maturity": r["maturity"],
            "is_subtechnique": bool(r["is_subtechnique"]),
            "case_study_count": case_count,
            "osint_signal": osint_signal,
            "risk_score": maturity_score * 1000 + case_count * 100 + osint_signal,
        })

    scored.sort(key=lambda x: x["risk_score"], reverse=True)
    return scored[:limit]


def _get_killchain_severity_distribution(conn: sqlite3.Connection) -> dict:
    """Count killchains by severity level."""
    rows = conn.execute(
        "SELECT severity, COUNT(*) AS c FROM killchains GROUP BY severity"
    ).fetchall()
    return {(r["severity"] or "unknown"): r["c"] for r in rows}


def _get_attack_category_distribution(conn: sqlite3.Connection) -> dict:
    """Count killchains by attack category."""
    rows = conn.execute(
        "SELECT attack_category, COUNT(*) AS c FROM killchains "
        "WHERE attack_category IS NOT NULL GROUP BY attack_category ORDER BY c DESC"
    ).fetchall()
    return {r["attack_category"]: r["c"] for r in rows}


def _get_osint_coverage(conn: sqlite3.Connection) -> dict:
    """Summarize OSINT coverage across techniques."""
    techniques_with_github = conn.execute(
        "SELECT COUNT(DISTINCT technique_id) AS c FROM github_repos"
    ).fetchone()["c"]
    techniques_with_arxiv = conn.execute(
        "SELECT COUNT(DISTINCT technique_id) AS c FROM osint_results WHERE source = 'arxiv'"
    ).fetchone()["c"]
    techniques_with_cves = conn.execute(
        "SELECT COUNT(DISTINCT technique_id) AS c FROM osint_results WHERE source = 'nvd'"
    ).fetchone()["c"]

    total_github_repos = conn.execute("SELECT COUNT(*) AS c FROM github_repos").fetchone()["c"]
    total_arxiv_papers = conn.execute(
        "SELECT COUNT(*) AS c FROM osint_results WHERE source = 'arxiv'"
    ).fetchone()["c"]
    total_cves = conn.execute(
        "SELECT COUNT(*) AS c FROM osint_results WHERE source = 'nvd'"
    ).fetchone()["c"]

    total_techniques = conn.execute("SELECT COUNT(*) AS c FROM techniques").fetchone()["c"]

    return {
        "total_techniques": total_techniques,
        "techniques_with_github": techniques_with_github,
        "techniques_with_arxiv": techniques_with_arxiv,
        "techniques_with_cves": techniques_with_cves,
        "total_github_repos": total_github_repos,
        "total_arxiv_papers": total_arxiv_papers,
        "total_cves": total_cves,
    }


def _get_osint_highlights(conn: sqlite3.Connection) -> dict:
    """Get recent/notable OSINT results."""
    # Most recent CVEs
    recent_cves = conn.execute(
        "SELECT technique_id, title, url, summary, fetched_at "
        "FROM osint_results WHERE source = 'nvd' "
        "ORDER BY fetched_at DESC LIMIT 5"
    ).fetchall()

    # Highest-starred GitHub repos
    top_repos = conn.execute(
        "SELECT technique_id, repo_full_name, description, stars, language, url "
        "FROM github_repos ORDER BY stars DESC LIMIT 5"
    ).fetchall()

    return {
        "recent_cves": [
            {
                "technique_id": r["technique_id"],
                "title": r["title"],
                "url": r["url"],
                "summary": r["summary"],
                "fetched_at": r["fetched_at"],
            }
            for r in recent_cves
        ],
        "top_github_repos": [
            {
                "technique_id": r["technique_id"],
                "repo_full_name": r["repo_full_name"],
                "description": r["description"],
                "stars": r["stars"],
                "language": r["language"],
                "url": r["url"],
            }
            for r in top_repos
        ],
    }


def _get_atlas_metadata(conn: sqlite3.Connection) -> dict:
    """Get ATLAS version and last sync date."""
    meta = conn.execute(
        "SELECT version, last_updated FROM atlas_metadata LIMIT 1"
    ).fetchone()
    if meta:
        return {
            "version": meta["version"],
            "last_updated": meta["last_updated"],
        }
    return {"version": "unknown", "last_updated": None}


def generate_executive_report(conn: sqlite3.Connection) -> dict:
    """Compile and return the full executive report data."""
    logger.info("Generating executive report")

    metadata = _get_atlas_metadata(conn)
    summary = _get_executive_summary(conn)
    tactic_breakdown = _get_tactic_breakdown(conn)
    top_risk = _get_top_risk_techniques(conn, limit=10)
    severity_dist = _get_killchain_severity_distribution(conn)
    category_dist = _get_attack_category_distribution(conn)
    osint_coverage = _get_osint_coverage(conn)
    osint_highlights = _get_osint_highlights(conn)

    return {
        "atlas_version": metadata["version"],
        "last_sync": metadata["last_updated"],
        "executive_summary": summary,
        "tactic_breakdown": tactic_breakdown,
        "top_risk_techniques": top_risk,
        "killchain_severity_distribution": severity_dist,
        "attack_category_distribution": category_dist,
        "osint_coverage": osint_coverage,
        "osint_highlights": osint_highlights,
    }
