# TERRA QUANTUM — AI + Quantum Earth Intelligence

**Project ID**: VNQFF-09  
**Problem Statement**: Quantum-Enhanced Earth Observation Analysis

A professional geospatial intelligence platform combining classical machine learning, Qiskit quantum kernel experiments, satellite image analysis, and a grounded AI copilot.

## Architecture

```
Browser → React Frontend (GitHub Pages) → HTTPS → FastAPI Backend → Qiskit / scikit-learn
```

| Component | Technology | Deployment |
|-----------|-----------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS | GitHub Pages |
| Backend | Python, FastAPI, Qiskit, scikit-learn | Docker (HF Spaces / Render) |

## Features

- **Earth Explorer** — Satellite image workspace with dataset status and image upload
- **Land-Cover Analysis** — Real SVM/Random Forest classification on EuroSAT with evaluation metrics
- **Change Detection** — Before/after satellite image comparison with difference masks
- **Quantum Analysis** — Genuine Qiskit ZZFeatureMap quantum kernel SVM experiments on local Aer Simulator
- **Results** — Experiment history with real metrics only (no fabricated data)
- **Terra Copilot** — Dataset-grounded retrieval assistant with source attribution

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173/QUANTUMSAT/
```

### Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 7860
# API docs at http://localhost:7860/docs
```

### Environment Variables
```
VITE_API_BASE_URL=http://localhost:7860/api   # Frontend .env
EUROSAT_DIR=./data/EuroSAT/2750              # Backend (optional)
IBM_QUANTUM_TOKEN=                            # Backend (optional, for hardware)
```

## Dataset Setup

Download **EuroSAT** (RGB version):
- https://github.com/phelber/eurosat
- Extract to `backend/data/EuroSAT/2750/`

Download **OSCD** (optional, for change detection):
- https://rcdaudt.github.io/oscd/
- Extract to `backend/data/OSCD/`

## Deployment

### Frontend (GitHub Pages)
Automatically deployed via `.github/workflows/deploy.yml` on push to `main`.

### Backend (Docker)
```bash
cd backend
docker build -t terra-quantum-api .
docker run -p 7860:7860 terra-quantum-api
```

After deploying the backend, set `VITE_API_BASE_URL` in your frontend build environment to the public backend URL.
