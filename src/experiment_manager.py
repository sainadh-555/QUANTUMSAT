import uuid
from datetime import datetime
from src.persistence import ExperimentHistory
from config.settings import DB_PATH

class ExperimentManager:
    def __init__(self):
        self.history = ExperimentHistory(DB_PATH)
        
    def save_experiment(self, module, model_type, config, metrics, dataset_info):
        experiment_id = f"EXP-{uuid.uuid4().hex[:8].upper()}"
        
        data = {
            "experiment_id": experiment_id,
            "timestamp": datetime.now().isoformat(),
            "module": module, # "Land Cover" or "Change Detection"
            "model_type": model_type,
            "dataset": dataset_info,
            "configuration": config,
            "metrics": metrics
        }
        
        self.history.save_experiment(data)
        return experiment_id
        
    def get_all_experiments(self):
        return self.history.load_experiments()
