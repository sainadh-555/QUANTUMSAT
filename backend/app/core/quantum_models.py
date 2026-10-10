from qiskit import QuantumCircuit
from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.kernels import FidelityQuantumKernel
from sklearn.svm import SVC
import time

class QuantumKernelModel:
    def __init__(self, num_qubits=4, reps=1, entanglement='linear', backend=None):
        self.num_qubits = num_qubits
        self.reps = reps
        self.entanglement = entanglement
        self.backend = backend
        
        self.feature_map = ZZFeatureMap(
            feature_dimension=self.num_qubits, 
            reps=self.reps, 
            entanglement=self.entanglement
        )
        
        # We will use FidelityQuantumKernel
        # If backend is provided, we use the Fidelity algorithm or Sampler
        self.quantum_kernel = FidelityQuantumKernel(feature_map=self.feature_map)
        
        self.svm = SVC(kernel=self.quantum_kernel.evaluate, probability=False)
        
    def train(self, X_train, y_train):
        start_time = time.time()
        self.svm.fit(X_train, y_train)
        training_time = time.time() - start_time
        return self.svm, training_time
        
    def predict(self, X_test):
        start_time = time.time()
        preds = self.svm.predict(X_test)
        prediction_time = time.time() - start_time
        return preds, prediction_time

    def predict_proba(self, X_test):
        start_time = time.time()
        import numpy as np
        decisions = self.svm.decision_function(X_test)
        
        if len(decisions.shape) == 1:
            # Binary classification
            probs_pos = 1 / (1 + np.exp(-decisions))
            probs = np.vstack([1 - probs_pos, probs_pos]).T
        else:
            # Multi-class softmax
            exp_decisions = np.exp(decisions - np.max(decisions, axis=1, keepdims=True))
            probs = exp_decisions / np.sum(exp_decisions, axis=1, keepdims=True)
            
        prediction_time = time.time() - start_time
        return probs, prediction_time
