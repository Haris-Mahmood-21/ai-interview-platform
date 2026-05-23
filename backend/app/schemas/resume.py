from pydantic import BaseModel


class ResumeProfileResponse(BaseModel):
    id: int
    user_id: int
    extracted_skills: list[str]
    extracted_projects: list[dict]

    class Config:
        from_attributes = True