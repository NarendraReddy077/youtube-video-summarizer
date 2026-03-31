from sqlalchemy import Column, String, Integer, Text, DateTime
from database.database import Base
from datetime import datetime

class Video(Base):
    __tablename__ = "videos"

    id = Column(String, primary_key=True, index=True) # YouTube video ID
    url = Column(String, unique=True, index=True)
    title = Column(String, nullable=True)
    summary_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
