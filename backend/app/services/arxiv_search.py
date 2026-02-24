"""arXiv paper search service for ATLAS technique OSINT."""

import logging
import sqlite3
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

import httpx

logger = logging.getLogger(__name__)

ARXIV_API_URL = "https://export.arxiv.org/api/query"
CACHE_TTL_HOURS = 24


def _check_cache(
    conn: sqlite3.Connection, technique_id: str, ttl_hours: int = CACHE_TTL_HOURS
) -> list[dict] | None:
    """Return cached arXiv results if still fresh, else None."""
    rows = conn.execute(
        "SELECT * FROM osint_results WHERE technique_id = ? AND source = 'arxiv' ORDER BY relevance_score DESC",
        (technique_id,),
    ).fetchall()
    if not rows:
        return None

    fetched = rows[0]["fetched_at"]
    if fetched:
        try:
            fetched_at = datetime.fromisoformat(fetched.replace("Z", "+00:00"))
            if datetime.now(timezone.utc) - fetched_at < timedelta(hours=ttl_hours):
                return [dict(r) for r in rows]
        except (ValueError, TypeError):
            pass
    return None


def _parse_arxiv_response(xml_text: str) -> list[dict]:
    """Parse arXiv Atom XML response into a list of paper dicts."""
    papers = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return papers

    ns = {"atom": "http://www.w3.org/2005/Atom"}

    for entry in root.findall("atom:entry", ns):
        title_el = entry.find("atom:title", ns)
        summary_el = entry.find("atom:summary", ns)
        link_el = entry.find("atom:id", ns)

        title = title_el.text.strip().replace("\n", " ") if title_el is not None and title_el.text else ""
        summary = summary_el.text.strip().replace("\n", " ")[:500] if summary_el is not None and summary_el.text else ""
        url = link_el.text.strip() if link_el is not None and link_el.text else ""

        if title:
            papers.append({
                "title": title,
                "url": url,
                "summary": summary,
            })

    return papers


async def search_arxiv(
    conn: sqlite3.Connection,
    technique_id: str,
    technique_name: str,
    keywords: list[str] | None = None,
) -> list[dict]:
    """Search arXiv for papers related to a technique."""
    cached = _check_cache(conn, technique_id)
    if cached is not None:
        logger.info("arXiv cache hit for %s (%d papers)", technique_id, len(cached))
        return cached

    search_terms = keywords or []
    if technique_name:
        search_terms.insert(0, technique_name)

    all_papers: dict[str, dict] = {}  # keyed by URL for dedup

    async with httpx.AsyncClient(timeout=30.0) as client:
        for term in search_terms[:3]:
            query = f'all:"{term}"'
            try:
                resp = await client.get(
                    ARXIV_API_URL,
                    params={
                        "search_query": query,
                        "start": 0,
                        "max_results": 10,
                        "sortBy": "relevance",
                        "sortOrder": "descending",
                    },
                )
                resp.raise_for_status()
                papers = _parse_arxiv_response(resp.text)

                for paper in papers:
                    if paper["url"] not in all_papers:
                        # Simple relevance: first search term = highest score
                        score = 1.0 - (search_terms.index(term) * 0.2) if term in search_terms else 0.5
                        all_papers[paper["url"]] = {
                            **paper,
                            "relevance_score": round(score, 2),
                        }

            except httpx.HTTPError as e:
                logger.error("arXiv search failed for '%s': %s", term, e)

    results = sorted(all_papers.values(), key=lambda p: p["relevance_score"], reverse=True)[:15]

    # Persist to cache
    now_iso = datetime.now(timezone.utc).isoformat()
    expires = (datetime.now(timezone.utc) + timedelta(hours=CACHE_TTL_HOURS)).isoformat()

    if results:
        conn.execute(
            "DELETE FROM osint_results WHERE technique_id = ? AND source = 'arxiv'",
            (technique_id,),
        )
        for paper in results:
            conn.execute(
                """INSERT INTO osint_results
                   (technique_id, source, title, url, summary, relevance_score, fetched_at, expires_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    technique_id,
                    "arxiv",
                    paper["title"],
                    paper["url"],
                    paper["summary"],
                    paper["relevance_score"],
                    now_iso,
                    expires,
                ),
            )
        conn.commit()

    logger.info("arXiv: found %d papers for %s", len(results), technique_id)
    return results
