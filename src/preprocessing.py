import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler

class FeatureNormalizer:
    def __init__(self, method='standard'):
        self.method = method
        if method == 'standard':
            self.scaler = StandardScaler()
        elif method == 'minmax':
            # MinMax to [0, 1] usually good for some quantum angles, but let's allow [-1, 1] or [0, pi] later
            self.scaler = MinMaxScaler()
        else:
            self.scaler = None
            
    def fit(self, X):
        """Fit normalization only on training data."""
        if self.scaler:
            self.scaler.fit(X)
            
    def transform(self, X):
        if self.scaler:
            return self.scaler.transform(X)
        return X
        
    def fit_transform(self, X):
        self.fit(X)
        return self.transform(X)
