"""OSINT orchestrator service - coordinates searches across all sources."""

import asyncio
import logging
import sqlite3
from datetime import datetime, timezone

from .github_search import search_github
from .arxiv_search import search_arxiv
from .nvd_search import search_nvd

logger = logging.getLogger(__name__)

# Keyword mappings for better OSINT results per technique
# Maps technique IDs to additional search keywords beyond the technique name
TECHNIQUE_KEYWORDS: dict[str, list[str]] = {
    "AML.T0051": ["prompt injection", "LLM jailbreak", "instruction injection"],
    "AML.T0051.000": ["direct prompt injection", "LLM jailbreak"],
    "AML.T0051.001": ["indirect prompt injection", "cross-plugin injection"],
    "AML.T0051.002": ["stored prompt injection", "persistent prompt injection"],
    "AML.T0020": ["data poisoning", "training data attack", "backdoor attack ML"],
    "AML.T0043": ["adversarial examples", "evasion attack ML", "adversarial perturbation"],
    "AML.T0043.000": ["white box adversarial", "gradient-based attack"],
    "AML.T0043.001": ["black box adversarial", "query-based attack"],
    "AML.T0043.002": ["physical adversarial", "adversarial patch"],
    "AML.T0024": ["model extraction", "model stealing", "model distillation attack"],
    "AML.T0024.000": ["model replication", "model clone"],
    "AML.T0024.001": ["side channel model extraction"],
    "AML.T0025": ["model inversion attack", "attribute inference", "membership inference"],
    "AML.T0040": ["ML model access", "model API abuse"],
    "AML.T0042": ["model supply chain", "model poisoning", "trojan model"],
    "AML.T0042.001": ["ML model backdoor", "neural trojan"],
    "AML.T0042.002": ["model marketplace attack", "Hugging Face security"],
    "AML.T0048": ["AML framework", "adversarial ML toolbox"],
    "AML.T0016": ["training data collection", "data scraping ML"],
    "AML.T0019": ["system misuse", "AI misuse", "GenAI misuse"],
    "AML.T0047": ["ML supply chain compromise", "ML dependency attack"],
    "AML.T0044": ["model evasion", "adversarial evasion"],
    "AML.T0015": ["ML artifact collection", "model weight extraction"],
    "AML.T0010": ["ML intellectual property theft", "model IP theft"],
    "AML.T0034": ["cost harvesting", "denial of ML service", "ML resource abuse"],
    "AML.T0029": ["denial of ML service", "model degradation", "model DoS"],
    "AML.T0031": ["model output manipulation", "AI content manipulation"],
    "AML.T0049": ["LLM plugin compromise", "tool use exploit"],
    "AML.T0050": ["command injection via API", "tool command injection"],
    "AML.T0052": ["LLM data leakage", "training data extraction"],
    "AML.T0053": ["LLM hallucination exploit", "package hallucination"],
    "AML.T0054": ["LLM agent manipulation", "agentic AI exploit"],
}


def _get_keywords(technique_id: str, technique_name: str) -> list[str]:
    """Get search keywords for a technique, combining mapped keywords with the name."""
    keywords = list(TECHNIQUE_KEYWORDS.get(technique_id, []))
    # Always include the technique name as a keyword
    if technique_name and technique_name not in keywords:
        keywords.insert(0, technique_name)
    return keywords


async def fetch_osint(
    conn: sqlite3.Connection,
    technique_id: str,
    technique_name: str,
) -> dict:
    """Fetch OSINT data from all sources concurrently."""
    keywords = _get_keywords(technique_id, technique_name)
    logger.info("Fetching OSINT for %s (%s) with keywords: %s", technique_id, technique_name, keywords)

    github_results, arxiv_results, nvd_results = await asyncio.gather(
        search_github(conn, technique_id, technique_name, keywords),
        search_arxiv(conn, technique_id, technique_name, keywords),
        search_nvd(conn, technique_id, technique_name, keywords),
        return_exceptions=True,
    )

    # Handle exceptions gracefully
    if isinstance(github_results, Exception):
        logger.error("GitHub search failed: %s", github_results)
        github_results = []
    if isinstance(arxiv_results, Exception):
        logger.error("arXiv search failed: %s", arxiv_results)
        arxiv_results = []
    if isinstance(nvd_results, Exception):
        logger.error("NVD search failed: %s", nvd_results)
        nvd_results = []

    return {
        "technique_id": technique_id,
        "github_repos": github_results,
        "arxiv_papers": arxiv_results,
        "nvd_cves": nvd_results,
        "cached": False,
        "last_fetched": datetime.now(timezone.utc).isoformat(),
    }


def get_cached_osint(conn: sqlite3.Connection, technique_id: str) -> dict | None:
    """Get all cached OSINT results for a technique without making API calls."""
    github_rows = conn.execute(
        "SELECT * FROM github_repos WHERE technique_id = ? ORDER BY stars DESC",
        (technique_id,),
    ).fetchall()

    arxiv_rows = conn.execute(
        "SELECT * FROM osint_results WHERE technique_id = ? AND source = 'arxiv' ORDER BY relevance_score DESC",
        (technique_id,),
    ).fetchall()

    nvd_rows = conn.execute(
        "SELECT * FROM osint_results WHERE technique_id = ? AND source = 'nvd' ORDER BY relevance_score DESC",
        (technique_id,),
    ).fetchall()

    if not github_rows and not arxiv_rows and not nvd_rows:
        return None

    # Determine last fetched time
    last_fetched = None
    for rows in [github_rows, arxiv_rows, nvd_rows]:
        if rows:
            row_dict = dict(rows[0])
            ts = row_dict.get("last_updated") or row_dict.get("fetched_at")
            if ts and (last_fetched is None or ts > last_fetched):
                last_fetched = ts

    return {
        "technique_id": technique_id,
        "github_repos": [dict(r) for r in github_rows],
        "arxiv_papers": [dict(r) for r in arxiv_rows],
        "nvd_cves": [dict(r) for r in nvd_rows],
        "cached": True,
        "last_fetched": last_fetched,
    }


def clear_cache(conn: sqlite3.Connection, technique_id: str) -> None:
    """Clear all cached OSINT results for a technique."""
    conn.execute("DELETE FROM github_repos WHERE technique_id = ?", (technique_id,))
    conn.execute("DELETE FROM osint_results WHERE technique_id = ?", (technique_id,))
    conn.commit()
