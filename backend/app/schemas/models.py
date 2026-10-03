from pydantic import BaseModel
from typing import List, Optional

class ExperimentConfig(BaseModel):
    module: str
    model_type: str
    classes: Optional[List[str]] = None
    samples_per_class: Optional[int] = 100
    qubits: Optional[int] = 4
    reps: Optional[int] = 1
    entanglement: Optional[str] = "linear"
    use_hardware: Optional[bool] = False

class PredictionRequest(BaseModel):
    model_id: str
    image_data: str # Base64 encoded image or path reference

class ChangeDetectionRequest(BaseModel):
    earlier_image: str
    later_image: str
    
class TrainRequest(BaseModel):
    dataset: str
    classes: List[str]
    model_type: str
    samples_per_class: int
