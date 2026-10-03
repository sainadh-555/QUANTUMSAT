import streamlit as st
import numpy as np
from config.settings import EUROSAT_DIR, DEFAULT_CLASSES
from src.dataset_validation import validate_eurosat_dataset
from src.data_loader import load_eurosat_images, create_splits
from src.features import extract_features
from src.preprocessing import FeatureNormalizer
from src.classical_models import ClassicalModels
from src.evaluation import evaluate_classification
from src.experiment_manager import ExperimentManager

st.set_page_config(page_title="Land-Cover Explorer", layout="wide")

st.title("Land-Cover Explorer")

is_valid, msg, available_classes = validate_eurosat_dataset(EUROSAT_DIR)

if not is_valid:
    st.error(msg)
    st.stop()
    
classes_to_use = st.multiselect("Select classes to classify:", available_classes, default=DEFAULT_CLASSES)
max_samples = st.number_input("Max samples per class", min_value=10, max_value=2000, value=100)

if st.button("Load Data & Extract Features"):
    with st.spinner("Loading images and extracting features..."):
        X_imgs, y, class_mapping = load_eurosat_images(EUROSAT_DIR, classes_to_use, max_samples)
        
        if not X_imgs:
            st.error("No images loaded.")
            st.stop()
            
        st.success(f"Loaded {len(X_imgs)} images.")
        st.session_state['class_mapping'] = class_mapping
        
        features = extract_features(X_imgs)
        
        # Splits
        X_train, y_train, X_val, y_val, X_test, y_test = create_splits(features, y)
        
        # Normalize
        normalizer = FeatureNormalizer()
        X_train_norm = normalizer.fit_transform(X_train)
        X_test_norm = normalizer.transform(X_test)
        
        st.session_state['data_splits'] = {
            'X_train': X_train_norm, 'y_train': y_train,
            'X_test': X_test_norm, 'y_test': y_test
        }
        st.success("Features extracted and normalized.")

st.markdown("---")
st.subheader("Train Classical Models")

model_choice = st.selectbox("Select Model", ["RBF-SVM", "Random Forest"])

if st.button("Train & Evaluate"):
    if 'data_splits' not in st.session_state:
        st.warning("Please load data first.")
    else:
        with st.spinner(f"Training {model_choice}..."):
            X_train = st.session_state['data_splits']['X_train']
            y_train = st.session_state['data_splits']['y_train']
            X_test = st.session_state['data_splits']['X_test']
            y_test = st.session_state['data_splits']['y_test']
            
            clf_module = ClassicalModels()
            model, train_time = clf_module.train(model_choice, X_train, y_train)
            
            preds, pred_time = clf_module.predict(model, X_test)
            
            metrics = evaluate_classification(y_test, preds)
            
            st.write(f"**Training Time:** {train_time:.2f}s")
            st.write(f"**Accuracy:** {metrics['accuracy']:.4f}")
            st.write(f"**Macro F1:** {metrics['macro_f1']:.4f}")
            
            # Save experiment
            em = ExperimentManager()
            exp_id = em.save_experiment(
                module="Land Cover",
                model_type=f"Classical ({model_choice})",
                config={"model": model_choice, "samples_per_class": max_samples},
                metrics={"accuracy": metrics['accuracy'], "macro_f1": metrics['macro_f1'], "train_time": train_time},
                dataset_info={"classes": classes_to_use}
            )
            st.success(f"Experiment saved: {exp_id}")
