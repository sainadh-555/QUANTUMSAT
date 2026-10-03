from pathlib import Path
import numpy as np
from PIL import Image
import random

def load_eurosat_images(dataset_path: Path, classes: list, max_per_class: int = 100, seed: int = 42):
    """
    Loads images and labels from the EuroSAT dataset.
    Returns: X (list of PIL images), y (list of integer labels), class_mapping (dict)
    """
    random.seed(seed)
    X = []
    y = []
    
    class_mapping = {cls: idx for idx, cls in enumerate(classes)}
    
    for cls in classes:
        class_dir = dataset_path / cls
        if not class_dir.exists():
            continue
            
        images = list(class_dir.glob("*.jpg"))
        random.shuffle(images)
        images = images[:max_per_class]
        
        for img_path in images:
            try:
                img = Image.open(img_path).copy()
                X.append(img)
                y.append(class_mapping[cls])
            except Exception as e:
                print(f"Error loading {img_path}: {e}")
                
    return X, y, class_mapping

def create_splits(X, y, test_size=0.2, val_size=0.1, seed=42):
    """
    Creates train/val/test splits without leakage.
    Returns: X_train, y_train, X_val, y_val, X_test, y_test
    """
    from sklearn.model_selection import train_test_split
    
    # First split off the test set
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=test_size, random_state=seed, stratify=y
    )
    
    # Then split val from train
    # Adjusted val_size relative to train_val size
    adjusted_val_size = val_size / (1.0 - test_size)
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=adjusted_val_size, random_state=seed, stratify=y_train_val
    )
    
    return X_train, y_train, X_val, y_val, X_test, y_test
