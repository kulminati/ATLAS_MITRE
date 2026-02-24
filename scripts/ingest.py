#!/usr/bin/env python3
"""CLI entry point for ATLAS YAML ingestion."""

import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.database import get_db
from app.services.ingestion import ingest_atlas


def main():
    conn = get_db()
    try:
        result = ingest_atlas(conn)
        print(f"\nDone. Ingested ATLAS v{result['version']}: "
              f"{result['tactics']} tactics, "
              f"{result['techniques']} techniques, "
              f"{result['subtechniques']} subtechniques, "
              f"{result['mitigations']} mitigations, "
              f"{result['case_studies']} case studies.")
    except Exception as exc:
        print(f"\nIngestion failed: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
