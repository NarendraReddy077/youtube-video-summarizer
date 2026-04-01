from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    youtube_api_key: str = ""
    ollama_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "gemma3:4b"
    chromadb_dir: str = "./database/chroma_db"
    sqlite_db_path: str = "sqlite:///./database/yt_summarizer.db"

settings = Settings()
