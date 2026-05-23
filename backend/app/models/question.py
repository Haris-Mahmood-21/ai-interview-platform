from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)   # dsa, os, ml, web
    type = Column(String, nullable=False)        # coding, theory
    difficulty = Column(String, nullable=False)  # easy, medium, hard
    question_text = Column(Text, nullable=False)
    test_cases = Column(Text, nullable=True)     # JSON string for coding questions

    responses = relationship("Response", back_populates="question")