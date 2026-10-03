from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import endpoints
import os

app = FastAPI(
    title="Terra Quantum API",
    description="Backend API for Quantum-Enhanced Earth Observation Analysis (VNQFF-09)",
    version="2.0.0",
)

# CORS — allow the GitHub Pages frontend and localhost dev
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://sainadh-555.github.io",
]
# Allow all in dev; in production the env var can restrict this
cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins == "*":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix="/api")


@app.get("/")
def read_root():
    return {
        "name": "Terra Quantum API",
        "project": "VNQFF-09",
        "version": "2.0.0",
        "docs": "/docs",
    }
