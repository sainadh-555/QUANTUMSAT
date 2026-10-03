import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
RESULTS_DIR = BASE_DIR / "results"
SAMPLE_DIR = BASE_DIR / "sample_data"

for d in [DATA_DIR, MODELS_DIR, RESULTS_DIR, SAMPLE_DIR]:
    d.mkdir(parents=True, exist_ok=True)

EUROSAT_DIR = Path(os.getenv("EUROSAT_DIR", str(DATA_DIR / "EuroSAT" / "2750")))
OSCD_DIR = Path(os.getenv("OSCD_DIR", str(DATA_DIR / "OSCD")))

AVAILABLE_CLASSES = [
    "AnnualCrop", "Forest", "HerbaceousVegetation", "Highway",
    "Industrial", "Pasture", "PermanentCrop", "Residential",
    "River", "SeaLake"
]

DEFAULT_CLASSES = ["AnnualCrop", "Forest", "Residential", "River"]
EUROSAT_IMG_SIZE = (64, 64)
DEFAULT_QUBITS = 4
DEFAULT_REPS = 1
DB_PATH = RESULTS_DIR / "experiments.json"
