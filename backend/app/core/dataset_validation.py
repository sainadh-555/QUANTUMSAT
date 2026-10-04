import requests
import zipfile
import tempfile
import os
import shutil
from pathlib import Path
from config.settings import DEFAULT_CLASSES

def download_file(url: str, dest_path: Path):
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(dest_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

def ensure_eurosat_dataset(dataset_path: Path):
    """
    Downloads and extracts EuroSAT dataset automatically if missing.
    """
    if dataset_path.exists() and dataset_path.is_dir():
        classes = [d.name for d in dataset_path.iterdir() if d.is_dir()]
        if all(c in classes for c in DEFAULT_CLASSES):
            return True, "EuroSAT already exists."
            
    # Need to download
    print("Downloading EuroSAT dataset...")
    base_dir = dataset_path.parent
    base_dir.mkdir(parents=True, exist_ok=True)
    
    zip_url = "https://madm.dfki.de/files/sentinel/EuroSAT.zip"
    
    try:
        with tempfile.TemporaryDirectory() as tmp_dir:
            zip_path = Path(tmp_dir) / "EuroSAT.zip"
            download_file(zip_url, zip_path)
            
            print("Extracting EuroSAT...")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(base_dir)
                
        return True, "EuroSAT dataset successfully downloaded and extracted."
    except Exception as e:
        return False, f"Failed to download or extract EuroSAT: {str(e)}"

def validate_eurosat_dataset(dataset_path: Path):
    """
    Validates if the EuroSAT dataset exists and has the required structure.
    Downloads it automatically if missing.
    Returns: (is_valid: bool, msg: str, available_classes: list)
    """
    success, msg = ensure_eurosat_dataset(dataset_path)
    if not success:
        return False, msg, []

    if not dataset_path.exists() or not dataset_path.is_dir():
        return False, f"Path {dataset_path} does not exist after download attempt.", []

    classes_found = [d.name for d in dataset_path.iterdir() if d.is_dir()]
    missing_classes = [c for c in DEFAULT_CLASSES if c not in classes_found]

    if missing_classes:
        return False, f"Missing required classes: {missing_classes}. Found: {classes_found}", classes_found

    return True, f"Dataset valid. Found {len(classes_found)} classes.", classes_found

def get_class_image_count(dataset_path: Path, class_name: str):
    """Returns the number of valid images in a class folder."""
    class_dir = dataset_path / class_name
    if not class_dir.exists():
        return 0
    return len(list(class_dir.glob("*.jpg")))
