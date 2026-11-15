from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class JobListingCreate(BaseModel):
    title: str = Field(..., min_length=3)
    title_te: Optional[str] = None
    crop_type: Optional[str] = "Paddy"
    work_type: str  # Harvesting, Planting, Irrigation, Weeding, Spraying, Tractor Operation
    workers_needed: int = Field(1, ge=1)
    daily_wage: float = Field(..., gt=0)
    start_date: str
    duration_days: int = Field(1, ge=1)
    village: Optional[str] = ""
    district: str
    state: str = "Andhra Pradesh"
    description: Optional[str] = ""
    contact_phone: Optional[str] = None

class JobListingOut(BaseModel):
    id: int
    farmer_id: int
    title: str
    title_te: Optional[str] = None
    crop_type: str
    work_type: str
    workers_needed: int
    daily_wage: float
    start_date: str
    duration_days: int
    village: str
    district: str
    state: str
    description: str
    contact_phone: Optional[str] = None
    status: str
    created_at: datetime
    farmer_name: Optional[str] = None
    applications_count: Optional[int] = 0

    class Config:
        from_attributes = True

class JobApplicationCreate(BaseModel):
    job_id: int
    proposed_wage: Optional[float] = None
    message: Optional[str] = ""

class JobApplicationStatusUpdate(BaseModel):
    status: str  # applied, accepted, rejected, completed

class JobApplicationOut(BaseModel):
    id: int
    job_id: int
    worker_id: int
    proposed_wage: Optional[float] = None
    message: str
    status: str
    created_at: datetime
    worker_name: Optional[str] = None
    worker_phone: Optional[str] = None
    worker_skills: Optional[str] = None
    job_title: Optional[str] = None
    daily_wage: Optional[float] = None
    district: Optional[str] = None

    class Config:
        from_attributes = True
