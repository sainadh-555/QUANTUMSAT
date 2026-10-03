import numpy as np

def extract_features(images):
    """
    Extracts basic features from a list of PIL Images.
    Initial four-feature representation:
    - Mean red intensity
    - Mean green intensity
    - Mean blue intensity
    - Green-channel standard deviation
    """
    features = []
    for img in images:
        arr = np.array(img)
        # Assuming RGB image
        if arr.shape[-1] == 3:
            r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
            
            mean_r = np.mean(r)
            mean_g = np.mean(g)
            mean_b = np.mean(b)
            std_g = np.std(g)
            
            features.append([mean_r, mean_g, mean_b, std_g])
        else:
            # Fallback for grayscale or other formats
            features.append([0.0, 0.0, 0.0, 0.0])
            
    return np.array(features)
