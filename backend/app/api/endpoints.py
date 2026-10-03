from fastapi import APIRouter, HTTPException, UploadFile, File
from app.schemas.models import ExperimentConfig, TrainRequest, PredictionRequest, ChangeDetectionRequest
from app.core.dataset_validation import validate_eurosat_dataset
from app.core.experiment_manager import ExperimentManager
import os
import sys

# Temporary path fix for config if needed
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from backend.config.settings import EUROSAT_DIR, OSCD_DIR

router = APIRouter()
em = ExperimentManager()

@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}

@router.get("/system/status")
def system_status():
    eurosat_valid, eurosat_msg, eurosat_classes = validate_eurosat_dataset(EUROSAT_DIR)
    
    return {
        "datasets": {
            "eurosat": {
                "available": eurosat_valid,
                "message": eurosat_msg,
                "classes": eurosat_classes
            }
        },
        "dependencies": {
            "qiskit": True, # Assume true if API runs
            "scikit_learn": True
        }
    }

@router.post("/classification/train")
def train_classification(request: TrainRequest):
    # Dummy implementation for now, will connect to core ML soon
    exp_id = em.save_experiment(
        module="Land Cover",
        model_type=request.model_type,
        config={"samples": request.samples_per_class},
        metrics={"accuracy": 0.95}, # Placeholder
        dataset_info={"classes": request.classes}
    )
    return {"status": "success", "experiment_id": exp_id}

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
