import numpy as np
from PIL import Image

def load_image_pair(path_earlier, path_later):
    """Loads a pair of images for change detection and validates them."""
    try:
        img1 = Image.open(path_earlier)
        img2 = Image.open(path_later)
        
        if img1.size != img2.size:
            return None, None, False, "Image dimensions do not match."
            
        return img1, img2, True, "Images loaded and dimensions match."
    except Exception as e:
        return None, None, False, str(e)

def extract_patch_features(img, patch_size=8):
    """
    Extracts features for small patches to be used in change detection classification.
    """
    arr = np.array(img)
    h, w = arr.shape[:2]
    
    features = []
    positions = []
    
    for y in range(0, h, patch_size):
        for x in range(0, w, patch_size):
            patch = arr[y:min(y+patch_size, h), x:min(x+patch_size, w)]
            # Simple features: mean RGB
            if patch.size > 0:
                if patch.ndim == 3:
                    mean_feat = np.mean(patch, axis=(0, 1))
                else:
                    mean_feat = [np.mean(patch), 0, 0] # Pad if grayscale
                
                features.append(mean_feat)
                positions.append((x, y))
                
    return np.array(features), positions

def compute_difference_features(features1, features2):
    """Computes difference between features of two images."""
    # Absolute difference is a simple baseline
    return np.abs(features1 - features2)

def generate_change_map(predictions, positions, img_shape, patch_size=8):
    """Generates a change map based on patch predictions."""
    h, w = img_shape[:2]
    change_map = np.zeros((h, w), dtype=np.uint8)
    
    for pred, (x, y) in zip(predictions, positions):
        if pred == 1: # Changed
            change_map[y:min(y+patch_size, h), x:min(x+patch_size, w)] = 255
            
    return change_map
