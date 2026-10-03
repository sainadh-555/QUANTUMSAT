import pytest
import numpy as np
from src.quantum_models import QuantumKernelModel

def test_quantum_model_simulator():
    """Tests the quantum model on synthetic data using AerSimulator."""
    # Synthetic dataset
    X_train = np.random.rand(10, 2)
    y_train = np.array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1])
    X_test = np.random.rand(4, 2)
    
    model = QuantumKernelModel(num_qubits=2, reps=1, entanglement='linear')
    
    # Train
    svm, t_train = model.train(X_train, y_train)
    assert svm is not None
    assert t_train > 0
    
    # Predict
    preds, t_pred = model.predict(X_test)
    assert len(preds) == 4
    assert set(preds).issubset({0, 1})
