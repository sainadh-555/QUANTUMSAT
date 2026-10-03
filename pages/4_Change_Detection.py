import streamlit as st
import numpy as np
from PIL import Image
from src.change_detection import load_image_pair, extract_patch_features, compute_difference_features, generate_change_map

st.set_page_config(page_title="Change Detection", layout="wide")

st.title("Satellite-Image Change Detection")

col1, col2 = st.columns(2)

with col1:
    st.subheader("Earlier Image")
    earlier_file = st.file_uploader("Upload Earlier Image (T1)", type=["jpg", "png", "tif"])

with col2:
    st.subheader("Later Image")
    later_file = st.file_uploader("Upload Later Image (T2)", type=["jpg", "png", "tif"])

if earlier_file and later_file:
    img1 = Image.open(earlier_file)
    img2 = Image.open(later_file)
    
    if img1.size != img2.size:
        st.error("Images must have the same dimensions for direct comparison.")
    else:
        st.success("Images loaded successfully.")
        
        col_img1, col_img2 = st.columns(2)
        col_img1.image(img1, caption="Earlier", use_column_width=True)
        col_img2.image(img2, caption="Later", use_column_width=True)
        
        if st.button("Run Basic Change Detection"):
            with st.spinner("Extracting features..."):
                f1, pos1 = extract_patch_features(img1)
                f2, pos2 = extract_patch_features(img2)
                
                diff = compute_difference_features(f1, f2)
                
                # Simple thresholding as a placeholder for the classifier
                threshold = np.mean(diff) + np.std(diff)
                preds = np.where(np.sum(diff, axis=1) > threshold, 1, 0)
                
                change_map = generate_change_map(preds, pos1, np.array(img1).shape)
                
                st.subheader("Detected Changes")
                st.image(change_map, caption="Change Map (White = Changed)", use_column_width=True, clamp=True)
