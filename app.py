import streamlit as st

def main():
    st.set_page_config(
        page_title="Quantum Earth Intelligence",
        page_icon="🌍",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    st.title("Quantum Earth Intelligence")
    st.subheader("Project ID: VNQFF-09 | Quantum-Enhanced Earth Observation Analysis")
    
    st.markdown("""
    Welcome to Quantum Earth Intelligence. This dashboard integrates classical and 
    quantum machine learning for satellite-image analysis, focusing on:
    - **Land-Cover Classification**
    - **Satellite-Image Change Detection**
    
    Please use the sidebar to navigate between modules.
    """)
    
    # Add status checks later

if __name__ == "__main__":
    main()
