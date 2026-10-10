import time
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier

class ClassicalModels:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.models = {
            'RBF-SVM': SVC(kernel='rbf', random_state=random_state, probability=True),
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=random_state)
        }
        
    def train(self, model_name, X_train, y_train):
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not supported.")
            
        model = self.models[model_name]
        
        start_time = time.time()
        model.fit(X_train, y_train)
        training_time = time.time() - start_time
        
        return model, training_time
        
    def predict(self, model, X_test):
        start_time = time.time()
        preds = model.predict(X_test)
        prediction_time = time.time() - start_time
        return preds, prediction_time

    def predict_proba(self, model, X_test):
        start_time = time.time()
        probs = model.predict_proba(X_test)
        prediction_time = time.time() - start_time
        return probs, prediction_time
