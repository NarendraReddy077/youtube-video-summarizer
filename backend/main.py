from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from database.database import engine, Base
import database.models

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="YouTube Summarizer API",
    description="Multi-agent AI backend for YouTube video summarization and Q&A",
    version="1.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "YouTube Summarizer API is running"}
