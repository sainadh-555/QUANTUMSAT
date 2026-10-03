import streamlit as st
from config.settings import EUROSAT_DIR, DEFAULT_CLASSES
from src.dataset_validation import validate_eurosat_dataset

st.set_page_config(page_title="Overview Dashboard", page_icon="📊", layout="wide")

st.title("Project Overview")
st.markdown("""
### Quantum Earth Intelligence (VNQFF-09)
This platform explores the intersection of **Classical** and **Quantum Machine Learning** 
applied to satellite earth observation.
""")

col1, col2 = st.columns(2)

with col1:
    st.subheader("Dataset Status")
    is_valid, msg, classes = validate_eurosat_dataset(EUROSAT_DIR)
    
    if is_valid:
        st.success(msg)
        st.write(f"Classes available: {', '.join(classes)}")
    else:
        st.error(msg)
        st.warning("Please download the EuroSAT dataset and place it in the configured data directory.")

with col2:
    st.subheader("System Status")
    st.write("✅ Application Framework: Streamlit")
    try:
        import qiskit
        st.write(f"✅ Qiskit Version: {qiskit.__version__}")
    except ImportError:
        st.error("❌ Qiskit not installed")
        
    try:
        from sklearn import __version__ as sklearn_version
        st.write(f"✅ Scikit-Learn Version: {sklearn_version}")
    except ImportError:
        st.error("❌ Scikit-Learn not installed")

st.markdown("---")
st.subheader("Quick Navigation")
st.markdown("""
- **[Land-Cover Explorer](/Land_Cover_Explorer)**: Train and evaluate classical machine learning models on satellite patches.
- **[Quantum Laboratory](/Quantum_Laboratory)**: Build and train quantum-kernel classifiers.
- **[Change Detection](/Change_Detection)**: Compare satellite images across time.
- **[Model Comparison](/Model_Comparison)**: Review metrics across all trained models.
- **[Experiment History](/Experiment_History)**: Export and review past experiment logs.
- **[Data & Documentation](/Data_and_Documentation)**: Setup instructions and research methodology.
""")
