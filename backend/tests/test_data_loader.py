import pytest
import numpy as np
from src.data_loader import create_splits
from src.features import extract_features
from PIL import Image

def test_create_splits():
    # Synthetic data for test
    X = np.arange(100).reshape(100, 1)
    y = np.array([0]*50 + [1]*50)
    
    X_train, y_train, X_val, y_val, X_test, y_test = create_splits(X, y, test_size=0.2, val_size=0.1)
    
    # 20% test, 10% val, 70% train
    assert len(X_test) == 20
    assert len(X_val) == 10
    assert len(X_train) == 70

def test_extract_features():
    # Synthetic image 3x3 RGB
    arr = np.ones((3, 3, 3), dtype=np.uint8) * 100
    img = Image.fromarray(arr)
    
    features = extract_features([img, img])
    assert features.shape == (2, 4)
    assert features[0][0] == 100 # mean_r
