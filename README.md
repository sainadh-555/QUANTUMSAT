# QUANTUM EARTH INTELLIGENCE

**Project ID**: VNQFF-09

A professional, quantum-enhanced earth observation analysis platform combining React, FastAPI, and Qiskit.

## Architecture
- **Frontend**: React, Vite, TailwindCSS (deployed via GitHub Pages)
- **Backend**: Python, FastAPI, Qiskit, scikit-learn (deployed via Docker/Hugging Face Spaces)

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 7860
```

## Deployment

### Deploying Frontend (GitHub Pages)
The frontend is automatically deployed to GitHub Pages via GitHub Actions when pushing to the `main` branch. See `.github/workflows/deploy.yml`.

### Deploying Backend
The backend can be deployed to any free service that supports Docker (e.g., Hugging Face Spaces, Render, Fly.io).

1. Connect your repository to the service.
2. Select the `backend/Dockerfile` as the build source.
3. Expose port `7860`.
4. Update the frontend environment variable `VITE_API_BASE_URL` with your new backend URL and push to GitHub.
