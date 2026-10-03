from pathlib import Path
from config.settings import DEFAULT_CLASSES

def validate_eurosat_dataset(dataset_path: Path):
    """
    Validates if the EuroSAT dataset exists and has the required structure.
    Returns: (is_valid: bool, msg: str, available_classes: list)
    """
    if not dataset_path.exists():
        return False, f"Dataset path {dataset_path} does not exist.", []

    if not dataset_path.is_dir():
        return False, f"Path {dataset_path} is not a directory.", []

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
