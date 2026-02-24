"""NIST NVD CVE search service for ATLAS technique OSINT."""

import logging
import sqlite3
from datetime import datetime, timezone, timedelta

import httpx

from ..config import NVD_API_KEY

logger = logging.getLogger(__name__)

NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"
CACHE_TTL_HOURS = 12


def _check_cache(
    conn: sqlite3.Connection, technique_id: str, ttl_hours: int = CACHE_TTL_HOURS
) -> list[dict] | None:
    """Return cached NVD results if still fresh, else None."""
    rows = conn.execute(
        "SELECT * FROM osint_results WHERE technique_id = ? AND source = 'nvd' ORDER BY relevance_score DESC",
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


async def search_nvd(
    conn: sqlite3.Connection,
    technique_id: str,
    technique_name: str,
    keywords: list[str] | None = None,
) -> list[dict]:
    """Search NVD for CVEs related to a technique."""
    cached = _check_cache(conn, technique_id)
    if cached is not None:
        logger.info("NVD cache hit for %s (%d CVEs)", technique_id, len(cached))
        return cached

    search_terms = keywords or []
    if technique_name:
        search_terms.insert(0, technique_name)

    headers = {}
    if NVD_API_KEY:
        headers["apiKey"] = NVD_API_KEY

    all_cves: dict[str, dict] = {}

    async with httpx.AsyncClient(timeout=30.0) as client:
        for term in search_terms[:2]:  # NVD has stricter rate limits
            try:
                resp = await client.get(
                    NVD_API_URL,
                    params={"keywordSearch": term, "resultsPerPage": 10},
                    headers=headers,
                )
                if resp.status_code == 403:
                    logger.warning("NVD rate limit hit for query: %s", term)
                    break
                resp.raise_for_status()
                data = resp.json()

                for vuln in data.get("vulnerabilities", []):
                    cve = vuln.get("cve", {})
                    cve_id = cve.get("id", "")
                    if not cve_id or cve_id in all_cves:
                        continue

                    # Extract description (English preferred)
                    descriptions = cve.get("descriptions", [])
                    desc = ""
                    for d in descriptions:
                        if d.get("lang") == "en":
                            desc = d.get("value", "")[:500]
                            break
                    if not desc and descriptions:
                        desc = descriptions[0].get("value", "")[:500]

                    # Extract CVSS score for relevance
                    metrics = cve.get("metrics", {})
                    cvss_score = None
                    for version in ["cvssMetricV31", "cvssMetricV30", "cvssMetricV2"]:
                        metric_list = metrics.get(version, [])
                        if metric_list:
                            cvss_score = metric_list[0].get("cvssData", {}).get("baseScore")
                            break

                    relevance = (cvss_score / 10.0) if cvss_score else 0.5
                    url = f"https://nvd.nist.gov/vuln/detail/{cve_id}"

                    all_cves[cve_id] = {
                        "title": cve_id,
                        "url": url,
                        "summary": desc,
                        "relevance_score": round(relevance, 2),
                    }

            except httpx.HTTPError as e:
                logger.error("NVD search failed for '%s': %s", term, e)

    results = sorted(all_cves.values(), key=lambda c: c["relevance_score"], reverse=True)[:15]

    # Persist to cache
    now_iso = datetime.now(timezone.utc).isoformat()
    expires = (datetime.now(timezone.utc) + timedelta(hours=CACHE_TTL_HOURS)).isoformat()

    if results:
        conn.execute(
            "DELETE FROM osint_results WHERE technique_id = ? AND source = 'nvd'",
            (technique_id,),
        )
        for cve in results:
            conn.execute(
                """INSERT INTO osint_results
                   (technique_id, source, title, url, summary, relevance_score, fetched_at, expires_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    technique_id,
                    "nvd",
                    cve["title"],
                    cve["url"],
                    cve["summary"],
                    cve["relevance_score"],
                    now_iso,
                    expires,
                ),
            )
        conn.commit()

    logger.info("NVD: found %d CVEs for %s", len(results), technique_id)
    return results
