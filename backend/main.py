from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
from pathlib import Path

app = FastAPI()

# --- IMPORTANT: CORS SETUP ---
# This allows your React app (running on localhost:5173)
# to talk to this backend (running on localhost:8000)
origins = ["http://localhost:5173", "http://163.192.101.22", "http://vmattoo.dev"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- DATA MODELS ---
class Note(BaseModel):
    id: int
    title: str
    date: str
    content: str


# --- ROUTES ---


# Route 1: Serve the Resume File (Inline View)
# CHANGED: Added /api/ prefix to avoid conflict with frontend route
@app.get("/api/resume")
def get_resume():
    # Use absolute path relative to this file's directory
    resume_path = Path(__file__).parent / "resume.pdf"
    if not resume_path.exists():
        raise FileNotFoundError(f"Resume file not found at {resume_path}")
    return FileResponse(
        str(resume_path),
        media_type="application/pdf",
        content_disposition_type="inline",  # <--- THIS IS KEY
    )


@app.get("/")
def read_root():
    return {"status": "System Online"}


# Route 1: Serve the Resume File


# Route 2: Get Notes (JSON Data)
@app.get("/api/notes", response_model=List[Note])
def get_notes():
    # In a real app, you would fetch this from a database (SQLite)
    return [
        {
            "id": 1,
            "title": "Oracle Cloud Architecture",
            "date": "2025-12-20",
            "content": "Deploying a split-stack architecture on ARM instances...",
        },
        {
            "id": 2,
            "title": "React vs. Vanilla JS",
            "date": "2025-12-18",
            "content": "Why component-based state management wins for dashboards...",
        },
    ]
