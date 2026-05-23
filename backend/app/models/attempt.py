from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mode = Column(String, nullable=False)          # general, resume
    category = Column(String, nullable=False)      # dsa, os, ml, web
    coding_score = Column(Float, default=0.0)
    theory_score = Column(Float, default=0.0)
    total_score = Column(Float, default=0.0)
    time_taken = Column(Integer, default=0)        # seconds
    date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="attempts")
    responses = relationship("Response", back_populates="attempt")