from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    title_te = Column(String(150), nullable=True)
    crop_type = Column(String(100), default="Paddy")
    work_type = Column(String(50), nullable=False)  # Harvesting, Planting, Irrigation, Weeding, Spraying, Tractor Operation
    workers_needed = Column(Integer, default=5)
    daily_wage = Column(Float, nullable=False)  # in INR
    start_date = Column(String(50), nullable=False)
    duration_days = Column(Integer, default=3)
    village = Column(String(100), default="")
    district = Column(String(50), nullable=False, index=True)
    state = Column(String(50), default="Andhra Pradesh")
    description = Column(Text, default="")
    contact_phone = Column(String(20), nullable=True)
    status = Column(String(30), default="open", index=True)  # open, in_progress, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer = relationship("User", foreign_keys=[farmer_id])
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    proposed_wage = Column(Float, nullable=True)
    message = Column(Text, default="")
    status = Column(String(30), default="applied")  # applied, accepted, rejected, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = relationship("JobListing", back_populates="applications")
    worker = relationship("User", foreign_keys=[worker_id])
