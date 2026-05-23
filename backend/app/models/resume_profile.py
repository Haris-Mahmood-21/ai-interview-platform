from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.database import Base


class ResumeProfile(Base):
    __tablename__ = "resume_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    raw_text = Column(Text, nullable=True)
    extracted_skills = Column(Text, nullable=True)   # JSON string
    extracted_projects = Column(Text, nullable=True) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resume_profiles")