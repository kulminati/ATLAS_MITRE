import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
DB_PATH = os.getenv("ATLAS_DB_PATH", str(BASE_DIR / "data" / "atlas.db"))
# Resolve to absolute path so it works from any cwd
DB_PATH = str(Path(DB_PATH).resolve()) if not Path(DB_PATH).is_absolute() else DB_PATH
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
NVD_API_KEY = os.getenv("NVD_API_KEY", "")
ATLAS_YAML_URL = "https://raw.githubusercontent.com/mitre-atlas/atlas-data/main/dist/ATLAS.yaml"
ATLAS_RELEASES_URL = "https://api.github.com/repos/mitre-atlas/atlas-data/releases/latest"
