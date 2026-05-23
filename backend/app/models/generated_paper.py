from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class GeneratedPaper(Base):
    __tablename__ = "generated_papers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source = Column(String, nullable=False)        # general, resume
    questions_json = Column(Text, nullable=False)  # JSON list of question IDs
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="generated_papers")