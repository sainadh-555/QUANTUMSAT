import plotly.express as px
import plotly.graph_objects as go
import numpy as np

def plot_confusion_matrix(cm, classes):
    """Returns a Plotly figure for a confusion matrix."""
    fig = px.imshow(cm,
                    labels=dict(x="Predicted", y="True Label", color="Count"),
                    x=classes,
                    y=classes,
                    text_auto=True,
                    color_continuous_scale="Blues")
    fig.update_layout(title="Confusion Matrix")
    return fig

def plot_metric_comparison(metrics_dict):
    """
    Plots a comparison of metrics between different models.
    metrics_dict format: {'Model Name': {'accuracy': 0.9, 'f1': 0.88, ...}}
    """
    models = list(metrics_dict.keys())
    if not models:
        return None
        
    metric_names = ['accuracy', 'macro_precision', 'macro_recall', 'macro_f1']
    
    fig = go.Figure()
    
    for m_name in metric_names:
        values = [metrics_dict[model].get(m_name, 0) for model in models]
        fig.add_trace(go.Bar(
            name=m_name,
            x=models,
            y=values
        ))
        
    fig.update_layout(
        title="Model Metric Comparison",
        barmode='group',
        yaxis_title="Score (0-1)"
    )
    
    return fig
