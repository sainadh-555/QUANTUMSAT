import streamlit as st
from src.experiment_manager import ExperimentManager
from src.visualisation import plot_metric_comparison

st.set_page_config(page_title="Model Comparison", layout="wide")

st.title("Model Comparison")

em = ExperimentManager()
history = em.get_all_experiments()

if not history:
    st.info("No experiments have been run yet.")
else:
    metrics_dict = {}
    for exp in history:
        model_name = exp.get('model_type', 'Unknown')
        # Handle duplicates by adding ID or taking latest
        if model_name in metrics_dict:
            model_name = f"{model_name} ({exp['experiment_id'][-4:]})"
        metrics_dict[model_name] = exp.get('metrics', {})
        
    fig = plot_metric_comparison(metrics_dict)
    if fig:
        st.plotly_chart(fig, use_container_width=True)
