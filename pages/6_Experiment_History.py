import streamlit as st
import pandas as pd
from src.experiment_manager import ExperimentManager

st.set_page_config(page_title="Experiment History", layout="wide")

st.title("Experiment History")

em = ExperimentManager()
history = em.get_all_experiments()

if not history:
    st.info("No experiment history available.")
else:
    df = pd.json_normalize(history)
    
    st.dataframe(df)
    
    csv = df.to_csv(index=False).encode('utf-8')
    st.download_button(
        "Download History as CSV",
        csv,
        "experiment_history.csv",
        "text/csv",
        key='download-csv'
    )
