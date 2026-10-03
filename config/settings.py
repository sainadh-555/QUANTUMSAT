import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
RESULTS_DIR = BASE_DIR / "results"

# Ensure directories exist
for d in [DATA_DIR, MODELS_DIR, RESULTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Datasets
EUROSAT_DIR = Path(os.getenv("EUROSAT_DIR", DATA_DIR / "EuroSAT" / "2750"))
OSCD_DIR = Path(os.getenv("OSCD_DIR", DATA_DIR / "OSCD"))

# Available EuroSAT Classes (Initial required: AnnualCrop, Forest, Residential, River)
AVAILABLE_CLASSES = [
    "AnnualCrop", "Forest", "HerbaceousVegetation", "Highway", 
    "Industrial", "Pasture", "PermanentCrop", "Residential", 
    "River", "SeaLake"
]

DEFAULT_CLASSES = ["AnnualCrop", "Forest", "Residential", "River"]

# Image sizes
EUROSAT_IMG_SIZE = (64, 64)

# Quantum Configuration
DEFAULT_QUBITS = 4
DEFAULT_REPS = 1

# Database for experiments
DB_PATH = RESULTS_DIR / "experiments.json"
