import streamlit as st
import numpy as np
from src.quantum_models import QuantumKernelModel
from src.evaluation import evaluate_classification
from src.experiment_manager import ExperimentManager

st.set_page_config(page_title="Quantum Laboratory", layout="wide")

st.title("Quantum Laboratory")
st.markdown("Run Quantum-Kernel Support Vector Machines using Qiskit.")

st.subheader("Configuration")
col1, col2 = st.columns(2)

with col1:
    qubits = st.number_input("Number of Qubits", min_value=2, max_value=8, value=4)
    reps = st.number_input("Feature Map Repetitions", min_value=1, max_value=5, value=1)
    
with col2:
    entanglement = st.selectbox("Entanglement", ["linear", "circular", "full"])
    use_hardware = st.checkbox("Run on IBM Quantum Hardware (Requires token)")

if st.button("Train Quantum Model"):
    if 'data_splits' not in st.session_state:
        st.error("Please load data in the Land-Cover Explorer first.")
    else:
        with st.spinner("Training Quantum-Kernel SVM... This may take time."):
            X_train = st.session_state['data_splits']['X_train']
            y_train = st.session_state['data_splits']['y_train']
            X_test = st.session_state['data_splits']['X_test']
            y_test = st.session_state['data_splits']['y_test']
            
            # Use only subset of features matching qubits
            X_train_q = X_train[:, :qubits]
            X_test_q = X_test[:, :qubits]
            
            try:
                from src.quantum_backend import get_quantum_backend
                backend = get_quantum_backend(use_hardware=use_hardware)
                
                qkm = QuantumKernelModel(num_qubits=qubits, reps=reps, entanglement=entanglement, backend=backend)
                model, train_time = qkm.train(X_train_q, y_train)
                preds, pred_time = qkm.predict(X_test_q)
                
                metrics = evaluate_classification(y_test, preds)
                
                st.success("Training Complete!")
                st.write(f"**Accuracy:** {metrics['accuracy']:.4f}")
                st.write(f"**Training Time:** {train_time:.2f}s")
                
                # Save experiment
                em = ExperimentManager()
                exp_id = em.save_experiment(
                    module="Quantum Lab",
                    model_type="Quantum-Kernel SVM",
                    config={"qubits": qubits, "reps": reps, "entanglement": entanglement, "hardware": use_hardware},
                    metrics={"accuracy": metrics['accuracy'], "train_time": train_time},
                    dataset_info={"features_used": qubits}
                )
                st.info(f"Experiment saved: {exp_id}")
                
            except Exception as e:
                st.error(f"Quantum execution failed: {str(e)}")
