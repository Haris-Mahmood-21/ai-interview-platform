from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    user_answer = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    is_correct = Column(Boolean, default=False)
    score = Column(Float, default=0.0)

    attempt = relationship("Attempt", back_populates="responses")
    question = relationship("Question", back_populates="responses")