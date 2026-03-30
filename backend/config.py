import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    youtube_api_key: str = os.getenv("YOUTUBE_API_KEY", "")
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = "gemma2"
    chromadb_dir: str = "./database/chroma_db"
    sqlite_db_path: str = "sqlite:///./database/yt_summarizer.db"

settings = Settings()
