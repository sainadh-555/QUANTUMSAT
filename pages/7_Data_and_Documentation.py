import streamlit as st

st.set_page_config(page_title="Data and Documentation", layout="wide")

st.title("Data and Documentation")

st.markdown("""
### Datasets
- **EuroSAT**: A land cover classification dataset based on Sentinel-2 satellite images. Download it from the [official repository](https://github.com/phelber/eurosat) and place it in the `data/EuroSAT/2750/` folder.
- **OSCD (Onera Satellite Change Detection)**: A dataset for urban change detection. Place in `data/OSCD/`.

### Setup
Configure the dataset paths in the `.env` file. If not set, defaults to `data/...` within the project.

### IBM Quantum Hardware
To run on actual quantum hardware, set your `IBM_QUANTUM_TOKEN` in the `.env` file. You can obtain a free token from the [IBM Quantum Platform](https://quantum.ibm.com/).

### Architecture
This application consists of:
- **Classical Models**: RBF-SVM and Random Forest from scikit-learn.
- **Quantum Models**: Quantum-kernel SVM using Qiskit.
- **Frontend**: Streamlit for responsive UI.
""")
