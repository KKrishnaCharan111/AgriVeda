from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class CropDoctorRequest(Base):
    __tablename__ = "crop_doctor_requests"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    crop_type = Column(String(100), nullable=False)
    image_url = Column(String(255), nullable=True)
    symptoms = Column(Text, nullable=False)
    voice_note_url = Column(String(255), nullable=True)
    
    # Diagnosis Results
    detected_disease = Column(String(150), nullable=True)
    detected_disease_te = Column(String(150), nullable=True)
    confidence_score = Column(Float, default=0.85)
    severity = Column(String(30), default="Moderate")  # Low, Moderate, High, Critical
    possible_causes = Column(Text, default="")
    possible_causes_te = Column(Text, default="")
    treatment_recommendations = Column(Text, default="")
    treatment_recommendations_te = Column(Text, default="")
    prevention_guide = Column(Text, default="")
    prevention_guide_te = Column(Text, default="")
    safety_warnings = Column(Text, default="Always wear protective equipment when applying organic or chemical treatments. Consult local Krishi Vigyan Kendra (KVK) for verification.")
    safety_warnings_te = Column(Text, default="సేంద్రీయ లేదా రసాయన నివారణలు ఉపయోగించేటప్పుడు రక్షణ పరికరాలను ధరించండి. తీవ్రమైన సమస్యల కోసం స్థానిక కృషి విజ్ఞాన కేంద్రాన్ని సంప్రదించండి.")
    is_expert_consult_recommended = Column(Boolean, default=True)
    language = Column(String(10), default="te")
    status = Column(String(30), default="analyzed")
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("User", foreign_keys=[farmer_id])


class ExpertContactRequest(Base):
    __tablename__ = "expert_contact_requests"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crop_doctor_request_id = Column(Integer, ForeignKey("crop_doctor_requests.id", ondelete="SET NULL"), nullable=True)
    farmer_name = Column(String(100), nullable=False)
    farmer_phone = Column(String(20), nullable=False)
    crop_name = Column(String(100), default="")
    issue_summary = Column(Text, default="")
    status = Column(String(30), default="Pending")  # Pending, Connected, Callback Scheduled, Resolved
    expert_notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer = relationship("User", foreign_keys=[farmer_id])
    crop_doctor_request = relationship("CropDoctorRequest")


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    district = Column(String(50), nullable=False, index=True)
    state = Column(String(50), default="Andhra Pradesh")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    temperature = Column(Float, nullable=False)
    temperature_min = Column(Float, nullable=True)
    temperature_max = Column(Float, nullable=True)
    humidity = Column(Float, default=65.0)
    wind_speed = Column(Float, default=12.0)
    rainfall_mm = Column(Float, default=0.0)
    weather_condition = Column(String(50), default="Sunny")
    weather_condition_te = Column(String(50), default="ఎండగా ఉంది")
    forecast_summary = Column(Text, default="")
    forecast_summary_te = Column(Text, default="")
    weather_warning = Column(Text, nullable=True)
    weather_warning_te = Column(Text, nullable=True)
    warning_level = Column(String(20), default="Green")  # Green, Yellow, Orange, Red
    source = Column(String(100), default="Open-Meteo & IMD Agri Advisory")
    last_updated = Column(DateTime, default=datetime.utcnow)


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(50), default="Andhra Pradesh", index=True)
    district = Column(String(50), nullable=False, index=True)
    market_name = Column(String(100), nullable=False, index=True)  # Mandi name
    crop_name = Column(String(100), nullable=False, index=True)
    crop_name_te = Column(String(100), nullable=True)
    variety = Column(String(100), default="FAQ")
    min_price = Column(Float, nullable=False)  # in INR
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    unit = Column(String(30), default="Quintal")
    arrival_date = Column(String(30), nullable=False)
    data_source = Column(String(100), default="Agmarknet / State Agricultural Marketing Board")
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String(200), nullable=False)
    name_te = Column(String(200), nullable=False)
    category = Column(String(50), default="Central")  # Central, State (AP), State (TS)
    target_states = Column(String(200), default="All India")
    description_en = Column(Text, nullable=False)
    description_te = Column(Text, nullable=False)
    benefits_en = Column(Text, nullable=False)
    benefits_te = Column(Text, nullable=False)
    eligibility_conditions_en = Column(Text, nullable=False)
    eligibility_conditions_te = Column(Text, nullable=False)
    required_documents_en = Column(Text, nullable=False)
    required_documents_te = Column(Text, nullable=False)
    application_procedure_en = Column(Text, nullable=False)
    application_procedure_te = Column(Text, nullable=False)
    official_portal_url = Column(String(255), nullable=False)
    last_verified_date = Column(String(50), default="2026-10-15")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FarmingReminder(Base):
    __tablename__ = "farming_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    crop_name_te = Column(String(100), nullable=True)
    stage = Column(String(50), default="Sowing")  # Sowing, Irrigation, Fertilization, Pest Prevention, Harvesting
    title_en = Column(String(200), nullable=False)
    title_te = Column(String(200), nullable=False)
    description_en = Column(Text, default="")
    description_te = Column(Text, default="")
    due_date = Column(String(30), nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])


class ProblemSolverQuery(Base):
    __tablename__ = "problem_solver_queries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    question_text = Column(Text, nullable=False)
    detected_language = Column(String(10), default="te")
    answer_text_en = Column(Text, nullable=False)
    answer_text_te = Column(Text, nullable=False)
    topic = Column(String(50), default="General Farming")  # Crop Health, Weather, Soil, Market, Schemes
    image_url = Column(String(255), nullable=True)
    audio_query_url = Column(String(255), nullable=True)
    has_expert_request = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
