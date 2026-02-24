"""GitHub repository search service for ATLAS technique OSINT."""

import logging
import sqlite3
from datetime import datetime, timezone, timedelta

import httpx

from ..config import GITHUB_TOKEN

logger = logging.getLogger(__name__)

GITHUB_SEARCH_URL = "https://api.github.com/search/repositories"
CACHE_TTL_HOURS = 6


def _check_cache(conn: sqlite3.Connection, technique_id: str, ttl_hours: int = CACHE_TTL_HOURS) -> list[dict] | None:
    """Return cached GitHub repos if still fresh, else None."""
    rows = conn.execute(
        "SELECT * FROM github_repos WHERE technique_id = ? ORDER BY stars DESC",
        (technique_id,),
    ).fetchall()
    if not rows:
        return None

    # Check freshness using last_updated of the first result
    last = rows[0]["last_updated"]
    if last:
        try:
            fetched_at = datetime.fromisoformat(last.replace("Z", "+00:00"))
            if datetime.now(timezone.utc) - fetched_at < timedelta(hours=ttl_hours):
                return [dict(r) for r in rows]
        except (ValueError, TypeError):
            pass
    return None


async def search_github(
    conn: sqlite3.Connection,
    technique_id: str,
    technique_name: str,
    keywords: list[str] | None = None,
) -> list[dict]:
    """Search GitHub for repos related to a technique. Returns list of repo dicts."""
    # Check cache first
    cached = _check_cache(conn, technique_id)
    if cached is not None:
        logger.info("GitHub cache hit for %s (%d repos)", technique_id, len(cached))
        return cached

    # Build search queries - prefer specific keywords over generic technique name
    search_terms = list(keywords) if keywords else []
    if not search_terms and technique_name:
        search_terms.append(technique_name)

    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    all_repos: dict[str, dict] = {}  # keyed by repo_full_name for dedup

    async with httpx.AsyncClient(timeout=30.0) as client:
        for term in search_terms[:3]:  # Limit to 3 search terms
            # Search name, description, and topics for relevant results
            query = f'"{term}" in:name,description,topics'
            try:
                resp = await client.get(
                    GITHUB_SEARCH_URL,
                    params={"q": query, "sort": "stars", "order": "desc", "per_page": 10},
                    headers=headers,
                )
                if resp.status_code == 403:
                    logger.warning("GitHub rate limit hit for query: %s", term)
                    break
                resp.raise_for_status()
                data = resp.json()

                for item in data.get("items", []):
                    full_name = item["full_name"]
                    if full_name not in all_repos:
                        all_repos[full_name] = {
                            "technique_id": technique_id,
                            "repo_full_name": full_name,
                            "description": (item.get("description") or "")[:500],
                            "stars": item.get("stargazers_count", 0),
                            "language": item.get("language"),
                            "url": item.get("html_url", ""),
                            "category": "osint-discovery",
                            "last_updated": datetime.now(timezone.utc).isoformat(),
                        }
            except httpx.HTTPError as e:
                logger.error("GitHub search failed for '%s': %s", term, e)

    results = sorted(all_repos.values(), key=lambda r: r["stars"], reverse=True)[:20]

    # Persist to cache
    if results:
        conn.execute("DELETE FROM github_repos WHERE technique_id = ?", (technique_id,))
        for repo in results:
            conn.execute(
                """INSERT INTO github_repos
                   (technique_id, repo_full_name, description, stars, language, url, category, last_updated)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    repo["technique_id"],
                    repo["repo_full_name"],
                    repo["description"],
                    repo["stars"],
                    repo["language"],
                    repo["url"],
                    repo["category"],
                    repo["last_updated"],
                ),
            )
        conn.commit()

    logger.info("GitHub: found %d repos for %s", len(results), technique_id)
    return results
