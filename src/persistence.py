import os
from pathlib import Path
import json

class ExperimentHistory:
    def __init__(self, db_path):
        self.db_path = Path(db_path)
        self._ensure_db()

    def _ensure_db(self):
        if not self.db_path.exists():
            with open(self.db_path, "w") as f:
                json.dump([], f)

    def load_experiments(self):
        with open(self.db_path, "r") as f:
            return json.load(f)

    def save_experiment(self, experiment_data):
        experiments = self.load_experiments()
        experiments.append(experiment_data)
        with open(self.db_path, "w") as f:
            json.dump(experiments, f, indent=4)
