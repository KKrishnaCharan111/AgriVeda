from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FarmerProfileOut(BaseModel):
    id: int
    farm_size_acres: float
    primary_crops: str
    irrigation_type: str
    experience_years: int
    class Config:
        from_attributes = True

class LabourProfileOut(BaseModel):
    id: int
    skills: str
    daily_wage_expected: float
    availability_status: str
    work_radius_km: int
    experience_years: int
    class Config:
        from_attributes = True

class BuyerProfileOut(BaseModel):
    id: int
    company_name: str
    business_type: str
    gst_number: Optional[str] = None
    is_pro: bool
    pro_expiry: Optional[datetime] = None
    class Config:
        from_attributes = True

class ShopProfileOut(BaseModel):
    id: int
    shop_name: str
    owner_name: str
    license_number: Optional[str] = None
    address: str
    is_verified: bool
    is_featured: bool
    featured_expiry: Optional[datetime] = None
    delivery_available: bool
    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    phone: str
    email: Optional[str] = None
    full_name: str
    role: str
    preferred_language: str
    state: str
    district: str
    village: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    farmer_profile: Optional[FarmerProfileOut] = None
    labour_profile: Optional[LabourProfileOut] = None
    buyer_profile: Optional[BuyerProfileOut] = None
    shop_profile: Optional[ShopProfileOut] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    preferred_language: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    # Farmer fields
    farm_size_acres: Optional[float] = None
    primary_crops: Optional[str] = None
    irrigation_type: Optional[str] = None
    # Labour fields
    skills: Optional[str] = None
    daily_wage_expected: Optional[float] = None
    availability_status: Optional[str] = None
    # Buyer fields
    company_name: Optional[str] = None
    business_type: Optional[str] = None
    gst_number: Optional[str] = None
    # Shop fields
    shop_name: Optional[str] = None
    owner_name: Optional[str] = None
    license_number: Optional[str] = None
    address: Optional[str] = None
    delivery_available: Optional[bool] = None
