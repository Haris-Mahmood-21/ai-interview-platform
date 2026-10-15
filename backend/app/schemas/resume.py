from pydantic import BaseModel, ConfigDict


class ResumeProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    extracted_skills: list[str]
    extracted_projects: list[dict]