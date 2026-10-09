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
            
    # Since Render times out on 2GB synchronous downloads, we will fail fast
    # and require the user to mount a disk or use a pre-trained model.
    return False, "EuroSAT dataset is missing. Automatic download is disabled on Render free tier to prevent 100s timeouts. Please mount a persistent disk with the dataset."

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
