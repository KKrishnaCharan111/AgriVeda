from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CropDoctorRequestCreate(BaseModel):
    crop_type: str = Field(..., min_length=2)
    symptoms: str = Field(..., min_length=5)
    image_url: Optional[str] = None
    voice_note_url: Optional[str] = None
    language: Optional[str] = "te"

class CropDoctorResponse(BaseModel):
    id: int
    crop_type: str
    image_url: Optional[str] = None
    detected_disease: str
    detected_disease_te: str
    confidence_score: float
    severity: str
    possible_causes: str
    possible_causes_te: str
    treatment_recommendations: str
    treatment_recommendations_te: str
    prevention_guide: str
    prevention_guide_te: str
    safety_warnings: str
    safety_warnings_te: str
    is_expert_consult_recommended: bool
    created_at: datetime
    class Config:
        from_attributes = True

class ExpertContactCreate(BaseModel):
    crop_doctor_request_id: Optional[int] = None
    farmer_name: str
    farmer_phone: str
    crop_name: str
    issue_summary: str

class ExpertContactOut(BaseModel):
    id: int
    farmer_id: int
    farmer_name: str
    farmer_phone: str
    crop_name: str
    issue_summary: str
    status: str
    expert_notes: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class WeatherOut(BaseModel):
    id: Optional[int] = None
    district: str
    state: str
    temperature: float
    temperature_min: Optional[float] = None
    temperature_max: Optional[float] = None
    humidity: float
    wind_speed: float
    rainfall_mm: float
    weather_condition: str
    weather_condition_te: str
    forecast_summary: str
    forecast_summary_te: str
    weather_warning: Optional[str] = None
    weather_warning_te: Optional[str] = None
    warning_level: str
    source: str
    last_updated: datetime
    hourly_forecast: Optional[List[dict]] = None
    daily_forecast: Optional[List[dict]] = None
    class Config:
        from_attributes = True

class MarketPriceOut(BaseModel):
    id: int
    state: str
    district: str
    market_name: str
    crop_name: str
    crop_name_te: Optional[str] = None
    variety: str
    min_price: float
    max_price: float
    modal_price: float
    unit: str
    arrival_date: str
    data_source: str
    is_verified: bool
    created_at: datetime
    class Config:
        from_attributes = True

class MarketPriceCreate(BaseModel):
    state: str = "Andhra Pradesh"
    district: str
    market_name: str
    crop_name: str
    crop_name_te: Optional[str] = None
    variety: Optional[str] = "FAQ"
    min_price: float
    max_price: float
    modal_price: float
    unit: str = "Quintal"
    arrival_date: str
    data_source: Optional[str] = "Agmarknet"
    is_verified: bool = True

class GovernmentSchemeOut(BaseModel):
    id: int
    name_en: str
    name_te: str
    category: str
    target_states: str
    description_en: str
    description_te: str
    benefits_en: str
    benefits_te: str
    eligibility_conditions_en: str
    eligibility_conditions_te: str
    required_documents_en: str
    required_documents_te: str
    application_procedure_en: str
    application_procedure_te: str
    official_portal_url: str
    last_verified_date: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class GovernmentSchemeCreate(BaseModel):
    name_en: str
    name_te: str
    category: str = "Central"
    target_states: str = "All India"
    description_en: str
    description_te: str
    benefits_en: str
    benefits_te: str
    eligibility_conditions_en: str
    eligibility_conditions_te: str
    required_documents_en: str
    required_documents_te: str
    application_procedure_en: str
    application_procedure_te: str
    official_portal_url: str
    last_verified_date: Optional[str] = "2026-10-15"

class FarmingReminderCreate(BaseModel):
    crop_name: str
    crop_name_te: Optional[str] = None
    stage: str
    title_en: str
    title_te: str
    description_en: Optional[str] = ""
    description_te: Optional[str] = ""
    due_date: str

class FarmingReminderOut(BaseModel):
    id: int
    user_id: int
    crop_name: str
    crop_name_te: Optional[str] = None
    stage: str
    title_en: str
    title_te: str
    description_en: str
    description_te: str
    due_date: str
    is_completed: bool
    created_at: datetime
    class Config:
        from_attributes = True

class ProblemSolverQueryCreate(BaseModel):
    question_text: str = Field(..., min_length=2)
    detected_language: Optional[str] = "te"
    topic: Optional[str] = "General Farming"
    image_url: Optional[str] = None
    audio_query_url: Optional[str] = None

class ProblemSolverResponse(BaseModel):
    id: int
    question_text: str
    detected_language: str
    answer_text_en: str
    answer_text_te: str
    topic: str
    created_at: datetime
    class Config:
        from_attributes = True
