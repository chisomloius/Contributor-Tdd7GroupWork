from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class UserLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    access_key: Optional[str] = None
    full_name: Optional[str] = None
    job_role: Optional[str] = None


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
    technical_output: str
    user_output: str


class DashboardMetricsResponse(BaseModel):
    total_generations: int
    dev_vs_user_split: dict
    unique_categories: list[str]


class TelemetryLogEntry(BaseModel):
    action: str
    detail: str
    created_at: datetime


class RecentLogsResponse(BaseModel):
    logs: list[TelemetryLogEntry]
