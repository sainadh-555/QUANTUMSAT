# Architecture

The system is built as a modular Streamlit web application.

## Components

1. **Frontend (Streamlit)**: Pages defined in the `pages/` directory handle UI and orchestrate data flow.
2. **Data Layer**: 
   - `src/data_loader.py`: Handles loading satellite image patches.
   - `src/dataset_validation.py`: Verifies folder structure.
3. **Preprocessing Pipeline**:
   - `src/features.py`: Extracts classical representations (e.g., RGB means).
   - `src/preprocessing.py`: Normalizes features without data leakage.
4. **Machine Learning Core**:
   - `src/classical_models.py`: Scikit-Learn based models.
   - `src/quantum_models.py`: Qiskit based models (FidelityQuantumKernel).
5. **Persistence**:
   - `src/persistence.py`: JSON-based local database.
   - `src/experiment_manager.py`: Handles saving experiments and fetching history.
