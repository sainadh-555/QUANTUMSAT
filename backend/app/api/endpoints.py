from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from app.core.dataset_validation import validate_eurosat_dataset
from app.core.experiment_manager import ExperimentManager
from app.core.data_loader import load_eurosat_images, create_splits
from app.core.features import extract_features
from app.core.classical_models import ClassicalModels
from app.core.evaluation import evaluate_classification
from app.core.change_detection import extract_patch_features, compute_difference_features, generate_change_map
from config.settings import (
    EUROSAT_DIR, OSCD_DIR, DEFAULT_CLASSES, AVAILABLE_CLASSES,
    SAMPLE_DIR, MODELS_DIR
)
from PIL import Image
import numpy as np
import io
import base64
import time
import traceback
import json

router = APIRouter()
em = ExperimentManager()


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Terra Quantum backend is running"}


@router.get("/system/status")
def system_status():
    eurosat_valid, eurosat_msg, eurosat_classes = validate_eurosat_dataset(EUROSAT_DIR)

    # Check Qiskit availability
    qiskit_available = False
    qiskit_version = None
    try:
        import qiskit
        qiskit_available = True
        qiskit_version = qiskit.__version__
    except ImportError:
        pass

    sklearn_available = False
    try:
        import sklearn
        sklearn_available = True
    except ImportError:
        pass

    return {
        "status": "ok",
        "datasets": {
            "eurosat": {
                "available": eurosat_valid,
                "message": eurosat_msg,
                "classes": eurosat_classes,
                "path": str(EUROSAT_DIR)
            }
        },
        "dependencies": {
            "qiskit": qiskit_available,
            "qiskit_version": qiskit_version,
            "scikit_learn": sklearn_available,
        },
        "available_classes": AVAILABLE_CLASSES,
        "default_classes": DEFAULT_CLASSES,
    }


@router.post("/classify/train")
def classify_train(
    model_type: str = Form("RBF-SVM"),
    classes: str = Form("AnnualCrop,Forest,Residential,River"),
    samples_per_class: int = Form(50),
):
    """
    Trains a classical classifier on EuroSAT and returns real metrics.
    """
    class_list = [c.strip() for c in classes.split(",") if c.strip()]
    if not class_list:
        raise HTTPException(status_code=400, detail="No classes specified")

    eurosat_valid, msg, _ = validate_eurosat_dataset(EUROSAT_DIR)
    if not eurosat_valid:
        raise HTTPException(status_code=422, detail=f"EuroSAT dataset not available: {msg}")

    try:
        total_start = time.time()

        # Load images
        X_imgs, y, class_mapping = load_eurosat_images(
            EUROSAT_DIR, class_list, max_per_class=samples_per_class
        )
        if len(X_imgs) == 0:
            raise HTTPException(status_code=422, detail="No images loaded from dataset")

        # Extract features
        X_features = extract_features(X_imgs)

        # Split
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X_features, y, test_size=0.2, random_state=42, stratify=y
        )

        # Train
        cm = ClassicalModels()
        model, train_time = cm.train(model_type, X_train, y_train)

        # Predict and evaluate
        preds, pred_time = cm.predict(model, X_test)
        metrics = evaluate_classification(y_test, preds, labels=list(range(len(class_list))))

        total_time = round(time.time() - total_start, 2)
        
        # Cache model for future predictions
        global _latest_model, _latest_model_classes
        _latest_model = model
        _latest_model_classes = {v: k for k, v in class_mapping.items()}
        


        # Save experiment
        exp_id = em.save_experiment(
            module="Land Cover",
            model_type=model_type,
            config={"samples_per_class": samples_per_class, "n_features": 4},
            metrics=metrics,
            dataset_info={"classes": class_list, "total_samples": len(X_imgs)},
            runtime_seconds=total_time,
        )

        # Reverse class mapping for labels
        idx_to_class = {v: k for k, v in class_mapping.items()}

        return {
            "status": "success",
            "experiment_id": exp_id,
            "model_type": model_type,
            "classes": class_list,
            "class_mapping": class_mapping,
            "metrics": metrics,
            "runtime_seconds": total_time,
            "train_time": round(train_time, 3),
            "prediction_time": round(pred_time, 3),
            "n_train": len(X_train),
            "n_test": len(X_test),
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Global cache for the last trained model to support predictions
_latest_model = None
_latest_model_classes = None

@router.post("/classify/predict")
async def classify_predict(image: UploadFile = File(...)):
    """
    Predicts the land-cover class of a single uploaded image.
    Requires a model to have been trained recently.
    """
    global _latest_model, _latest_model_classes
    
    # Check if a model is in memory (simplified for this demo)
    # If not, we could train a tiny one on the fly if EuroSAT is available
    if not _latest_model:
        eurosat_valid, _, _ = validate_eurosat_dataset(EUROSAT_DIR)
        if not eurosat_valid:
            raise HTTPException(status_code=400, detail="No model is currently trained, and the EuroSAT dataset is not installed to train one. Please install EuroSAT or train a model first.")
        
        # Train a quick mini-model so the user doesn't get stuck
        class_list = DEFAULT_CLASSES
        try:
            X_imgs, y, class_mapping = load_eurosat_images(EUROSAT_DIR, class_list, max_per_class=10)
            X_features = extract_features(X_imgs)
            cm = ClassicalModels()
            _latest_model, _ = cm.train("RBF-SVM", X_features, y)
            _latest_model_classes = {v: k for k, v in class_mapping.items()}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to auto-train model for prediction: {e}")

    try:
        # Read and process uploaded image
        img_bytes = await image.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        # Ensure it's 64x64
        if img.size != (64, 64):
            img = img.resize((64, 64))
            
        # Extract features
        features = extract_features([np.array(img)])
        
        # Predict
        cm = ClassicalModels()
        pred_idx, _ = cm.predict(_latest_model, features)
        
        predicted_class = _latest_model_classes.get(pred_idx[0], "Unknown")
        
        return {
            "status": "success",
            "prediction": predicted_class,
            "confidence": "N/A (SVM margin)",
            "message": "Prediction successful using active classical model."
        }
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/classify/quantum")
def classify_quantum(
    classes: str = Form("AnnualCrop,Forest,Residential,River"),
    samples_per_class: int = Form(15),
    qubits: int = Form(4),
    reps: int = Form(1),
    entanglement: str = Form("linear"),
):
    """
    Runs a real Qiskit quantum kernel SVM experiment.
    Bounded to small sample sizes due to simulator cost.
    """
    class_list = [c.strip() for c in classes.split(",") if c.strip()]
    if samples_per_class > 30:
        raise HTTPException(
            status_code=400,
            detail="Quantum experiments are bounded to 30 samples per class to keep execution feasible on the simulator."
        )

    eurosat_valid, msg, _ = validate_eurosat_dataset(EUROSAT_DIR)
    if not eurosat_valid:
        raise HTTPException(status_code=422, detail=f"EuroSAT not available: {msg}")

    try:
        total_start = time.time()

        X_imgs, y, class_mapping = load_eurosat_images(
            EUROSAT_DIR, class_list, max_per_class=samples_per_class
        )
        X_features = extract_features(X_imgs)

        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X_features, y, test_size=0.2, random_state=42, stratify=y
        )

        # Normalize for quantum circuit
        from sklearn.preprocessing import MinMaxScaler
        scaler = MinMaxScaler(feature_range=(0, np.pi))
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        from app.core.quantum_models import QuantumKernelModel
        qmodel = QuantumKernelModel(
            num_qubits=qubits, reps=reps, entanglement=entanglement
        )
        model, train_time = qmodel.train(X_train_scaled, y_train)
        preds, pred_time = qmodel.predict(X_test_scaled)

        metrics = evaluate_classification(y_test, preds, labels=list(range(len(class_list))))
        total_time = round(time.time() - total_start, 2)

        # Get circuit info
        circuit_depth = qmodel.feature_map.depth()
        circuit_width = qmodel.feature_map.num_qubits

        exp_id = em.save_experiment(
            module="Quantum Analysis",
            model_type=f"Quantum SVM (ZZFeatureMap, {qubits}q, {reps}r)",
            config={
                "qubits": qubits,
                "reps": reps,
                "entanglement": entanglement,
                "samples_per_class": samples_per_class,
            },
            metrics=metrics,
            dataset_info={"classes": class_list, "total_samples": len(X_imgs)},
            runtime_seconds=total_time,
        )

        return {
            "status": "success",
            "experiment_id": exp_id,
            "model_type": f"Quantum SVM (ZZFeatureMap)",
            "metrics": metrics,
            "runtime_seconds": total_time,
            "circuit": {
                "depth": circuit_depth,
                "width": circuit_width,
                "feature_map": "ZZFeatureMap",
                "reps": reps,
                "entanglement": entanglement,
            },
            "n_train": len(X_train),
            "n_test": len(X_test),
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/change-detection/compare")
async def change_detection_compare(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
):
    """
    Compares two uploaded images and produces a change mask.
    """
    try:
        img1_bytes = await image1.read()
        img2_bytes = await image2.read()

        img1 = Image.open(io.BytesIO(img1_bytes)).convert("RGB")
        img2 = Image.open(io.BytesIO(img2_bytes)).convert("RGB")

        if img1.size != img2.size:
            raise HTTPException(
                status_code=400,
                detail=f"Image dimensions must match. Got {img1.size} vs {img2.size}."
            )

        patch_size = 8
        feat1, pos1 = extract_patch_features(img1, patch_size)
        feat2, pos2 = extract_patch_features(img2, patch_size)

        diff_features = compute_difference_features(feat1, feat2)

        # Simple threshold-based change detection baseline
        magnitudes = np.linalg.norm(diff_features, axis=1)
        threshold = np.mean(magnitudes) + np.std(magnitudes)
        predictions = (magnitudes > threshold).astype(int)

        change_map = generate_change_map(predictions, pos1, np.array(img1).shape, patch_size)

        # Encode change map as base64 PNG
        change_img = Image.fromarray(change_map)
        buf = io.BytesIO()
        change_img.save(buf, format="PNG")
        change_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        total_patches = len(predictions)
        changed_patches = int(np.sum(predictions))
        unchanged_patches = total_patches - changed_patches

        return {
            "status": "success",
            "change_map_b64": change_b64,
            "statistics": {
                "total_patches": total_patches,
                "changed_patches": changed_patches,
                "unchanged_patches": unchanged_patches,
                "change_percentage": round(changed_patches / total_patches * 100, 2) if total_patches > 0 else 0,
                "threshold_used": round(float(threshold), 4),
                "method": "Mean RGB patch difference with statistical thresholding",
            },
            "image_info": {
                "size": list(img1.size),
                "patch_size": patch_size,
            },
            "warning": "This is a statistical baseline. Detected differences may be caused by lighting, sensor noise, or seasonal variation rather than actual land-use change."
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/copilot/ask")
async def copilot_ask(question: str = Form(...)):
    """
    Dataset-grounded retrieval assistant.
    Returns structured answers based on available datasets, experiments, and project documentation.
    """
    q = question.lower().strip()
    experiments = em.get_all_experiments()
    eurosat_valid, _, eurosat_classes = validate_eurosat_dataset(EUROSAT_DIR)

    # Structured retrieval logic
    if any(kw in q for kw in ["land-cover", "land cover", "class", "detected", "classification", "predict"]):
        if experiments:
            latest = [e for e in experiments if e.get("module") == "Land Cover"]
            if latest:
                exp = latest[-1]
                m = exp.get("metrics", {})
                return {
                    "answer": f"The most recent land-cover experiment (ID: {exp['experiment_id']}) used {exp['model_type']} on classes {exp.get('dataset', {}).get('classes', [])}. "
                              f"Accuracy: {round(m.get('accuracy', 0)*100, 1)}%, Macro F1: {round(m.get('macro_f1', 0)*100, 1)}%. "
                              f"Runtime: {exp.get('runtime_seconds', 'unknown')}s.",
                    "source": "experiment_record",
                    "experiment_id": exp["experiment_id"],
                }
        return {
            "answer": "No land-cover classification experiments have been run yet. Navigate to Land-Cover Analysis to train a model on available dataset images.",
            "source": "system",
        }

    if any(kw in q for kw in ["quantum", "qiskit", "kernel", "circuit", "qubit"]):
        qexps = [e for e in experiments if "Quantum" in e.get("module", "")]
        if qexps:
            exp = qexps[-1]
            m = exp.get("metrics", {})
            c = exp.get("config", {})
            return {
                "answer": f"The latest quantum experiment (ID: {exp['experiment_id']}) used {exp['model_type']}. "
                          f"Configuration: {c.get('qubits', 4)} qubits, {c.get('reps', 1)} repetitions, {c.get('entanglement', 'linear')} entanglement. "
                          f"Accuracy: {round(m.get('accuracy', 0)*100, 1)}%. Runtime: {exp.get('runtime_seconds', 'unknown')}s. "
                          f"The quantum kernel uses ZZFeatureMap to encode classical image features into quantum states, "
                          f"then measures fidelity between state pairs as a kernel for SVM classification.",
                "source": "experiment_record",
                "experiment_id": exp["experiment_id"],
            }
        return {
            "answer": "No quantum experiments have been run yet. The quantum analysis module uses Qiskit's ZZFeatureMap "
                      "to encode 4 classical image features (mean R, G, B and green-channel std dev) into quantum states. "
                      "FidelityQuantumKernel measures state overlaps to build a kernel matrix for SVM classification. "
                      "Navigate to Quantum Analysis to run an experiment.",
            "source": "project_documentation",
        }

    if any(kw in q for kw in ["change", "detection", "difference", "compare"]):
        return {
            "answer": "The change detection module compares two satellite images by extracting mean RGB features from small patches, "
                      "computing absolute differences, and applying statistical thresholding to identify changed regions. "
                      "Upload two images of the same area from different dates to run an analysis. "
                      "Warning: Detected differences may reflect lighting or seasonal variation, not confirmed land-use change.",
            "source": "project_documentation",
        }

    if any(kw in q for kw in ["dataset", "eurosat", "data", "image"]):
        if eurosat_valid:
            return {
                "answer": f"EuroSAT dataset is available with {len(eurosat_classes)} classes: {', '.join(eurosat_classes)}. "
                          f"Each class contains Sentinel-2 satellite image patches at 10m resolution (64×64 pixels, RGB). "
                          f"The dataset covers land-cover categories across European cities and rural areas.",
                "source": "dataset_metadata",
            }
        return {
            "answer": "The EuroSAT dataset is not currently installed. It contains 27,000 Sentinel-2 satellite image patches "
                      "across 10 land-cover classes at 10m spatial resolution. Download it from https://github.com/phelber/eurosat "
                      "and place it in the data/EuroSAT/2750/ directory.",
            "source": "project_documentation",
        }

    if any(kw in q for kw in ["feature", "extract"]):
        return {
            "answer": "The feature extraction pipeline computes 4 features from each satellite image patch: "
                      "mean red channel intensity, mean green channel intensity, mean blue channel intensity, "
                      "and green-channel standard deviation. These 4 features map directly to 4 qubits in the quantum circuit. "
                      "This representation captures basic spectral signatures sufficient for land-cover classification.",
            "source": "project_documentation",
        }

    if any(kw in q for kw in ["limitation", "accuracy", "reliable"]):
        return {
            "answer": "Key limitations: (1) The 4-feature representation is intentionally simple for quantum compatibility. "
                      "Deep learning with full spectral bands would outperform this approach. "
                      "(2) Quantum kernel computation scales quadratically with sample count, limiting practical dataset sizes. "
                      "(3) The local Aer simulator provides exact noiseless results; real hardware introduces decoherence errors. "
                      "(4) Change detection uses statistical thresholding, not learned segmentation, so false positives are expected.",
            "source": "project_documentation",
        }

    # Fallback
    return {
        "answer": "I cannot verify that from the datasets or analysis results currently available. "
                  "Try asking about: land-cover classification, quantum kernel experiments, change detection, "
                  "the EuroSAT dataset, feature extraction, or analysis limitations.",
        "source": "none",
    }


@router.get("/experiments")
def get_experiments():
    return em.get_all_experiments()


@router.get("/experiments/{experiment_id}")
def get_experiment(experiment_id: str):
    experiments = em.get_all_experiments()
    for exp in experiments:
        if exp.get("experiment_id") == experiment_id:
            return exp
    raise HTTPException(status_code=404, detail="Experiment not found")
