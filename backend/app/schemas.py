from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class UserLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    access_key: Optional[str] = None
    full_name: Optional[str] = None
    job_role: Optional[str] = None
    is_signup: bool = False  # Dynamic toggle flag for signup vs login behavior

class UserLoginResponse(BaseModel):
    user_id: int
    username: str
    session_token: str
    full_name: Optional[str] = None
    job_role: Optional[str] = None

class GenerateDocRequest(BaseModel):
    prompt: str = Field(min_length=5, max_length=1000)
    category: str
    session_token: str

class GenerateDocResponse(BaseModel):
    title: str
    technical_output: str
    user_output: str

class HistoricalDocItem(BaseModel):
    id: int
    title: str
    category: str
    prompt_text: str
    technical_output: str
    user_output: str
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardMetricsResponse(BaseModel):
    total_generations: int
    dev_vs_user_split: dict
    unique_categories: List[str]

class TelemetryLogEntry(BaseModel):
    action: str
    detail: str
    created_at: datetime

class RecentLogsResponse(BaseModel):
    logs: List[TelemetryLogEntry]