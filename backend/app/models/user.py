from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="farmer")  # farmer, labour, buyer, shop, admin
    preferred_language = Column(String(10), default="te")  # te (Telugu), en (English)
    state = Column(String(50), default="Andhra Pradesh")
    district = Column(String(50), default="Guntur")
    village = Column(String(100), default="")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    labour_profile = relationship("LabourProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    shop_profile = relationship("ShopProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    farm_size_acres = Column(Float, default=0.0)
    primary_crops = Column(Text, default="[]")  # JSON or comma-separated list
    irrigation_type = Column(String(50), default="Borewell")  # Borewell, Canal, Rainfed, Drip
    experience_years = Column(Integer, default=5)

    user = relationship("User", back_populates="farmer_profile")


class LabourProfile(Base):
    __tablename__ = "labour_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    skills = Column(Text, default="Harvesting, Planting, Weeding")  # Comma-separated list
    daily_wage_expected = Column(Float, default=600.0)
    availability_status = Column(String(20), default="available")  # available, busy
    work_radius_km = Column(Integer, default=15)
    experience_years = Column(Integer, default=3)

    user = relationship("User", back_populates="labour_profile")


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    company_name = Column(String(150), default="")
    business_type = Column(String(50), default="Wholesaler")  # Wholesaler, Trader, Retailer, Exporter, Processor
    gst_number = Column(String(25), nullable=True)
    is_pro = Column(Boolean, default=False)
    pro_expiry = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="buyer_profile")


class ShopProfile(Base):
    __tablename__ = "shop_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    shop_name = Column(String(150), nullable=False)
    owner_name = Column(String(100), default="")
    license_number = Column(String(50), nullable=True)
    address = Column(Text, default="")
    is_verified = Column(Boolean, default=False)  # Admin verification badge
    is_featured = Column(Boolean, default=False)
    featured_expiry = Column(DateTime, nullable=True)
    delivery_available = Column(Boolean, default=True)

    user = relationship("User", back_populates="shop_profile")
