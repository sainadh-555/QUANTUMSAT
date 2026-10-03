# QUANTUM EARTH INTELLIGENCE

**Project ID**: VNQFF-09
**Problem Statement**: Quantum-Enhanced Earth Observation Analysis

This project explores the potential of quantum machine learning (QML) in earth observation tasks, specifically land-cover classification and satellite-image change detection. It integrates real satellite data (EuroSAT, OSCD), classical machine learning (SVM, Random Forest), and Qiskit-based quantum machine learning.

## Features
- **Land-Cover Classification**: Classical and Quantum-Kernel SVM on EuroSAT RGB dataset.
- **Change Detection**: Analyzes pairs of satellite images using patch-based classical and quantum feature representations.
- **Quantum Execution**: Run models on local simulators or submit jobs directly to IBM Quantum hardware.
- **Evaluation Dashboard**: Compare model metrics (accuracy, F1-score, precision, recall) and execution times.

## Installation

### Prerequisites
- Python 3.9+
- Git

### Setup
1. Clone the repository and navigate to it:
   ```bash
   git clone <repo_url>
   cd quantum-earth-intelligence
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and adjust the paths if needed:
   ```bash
   cp .env.example .env
   ```

### Running the Application
Start the Streamlit dashboard:
```bash
python -m streamlit run app.py
```
