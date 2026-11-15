from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CropImageOut(BaseModel):
    id: int
    image_url: str
    is_primary: bool
    class Config:
        from_attributes = True

class CropListingCreate(BaseModel):
    crop_name: str = Field(..., min_length=2)
    crop_name_te: Optional[str] = None
    variety: Optional[str] = "Hybrid"
    category: Optional[str] = "Cereals"
    quantity: float = Field(..., gt=0)
    unit: str = "Quintal"
    expected_price_per_unit: float = Field(..., gt=0)
    quality_grade: Optional[str] = "Grade A"
    organic_certified: Optional[bool] = False
    description: Optional[str] = ""
    harvest_date: Optional[str] = ""
    village: Optional[str] = ""
    district: str
    state: str = "Andhra Pradesh"
    pin_code: Optional[str] = ""

class CropListingUpdate(BaseModel):
    crop_name: Optional[str] = None
    crop_name_te: Optional[str] = None
    variety: Optional[str] = None
    quantity: Optional[float] = None
    expected_price_per_unit: Optional[float] = None
    quality_grade: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class CropListingOut(BaseModel):
    id: int
    farmer_id: int
    crop_name: str
    crop_name_te: Optional[str] = None
    variety: str
    category: str
    quantity: float
    unit: str
    expected_price_per_unit: float
    quality_grade: str
    organic_certified: bool
    description: str
    harvest_date: str
    village: str
    district: str
    state: str
    pin_code: str
    status: str
    created_at: datetime
    images: List[CropImageOut] = []
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None

    class Config:
        from_attributes = True

class BuyerOfferCreate(BaseModel):
    listing_id: int
    offered_price_per_unit: float = Field(..., gt=0)
    quantity: float = Field(..., gt=0)
    message: Optional[str] = ""

class BuyerOfferUpdate(BaseModel):
    counter_price: Optional[float] = None
    status: Optional[str] = None  # Accepted, Rejected, Negotiation, Cancelled

class BuyerOfferOut(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    offered_price_per_unit: float
    quantity: float
    total_amount: float
    counter_price: Optional[float] = None
    message: str
    status: str
    created_at: datetime
    buyer_name: Optional[str] = None
    buyer_phone: Optional[str] = None
    crop_name: Optional[str] = None

    class Config:
        from_attributes = True

class CropDealCreate(BaseModel):
    listing_id: int
    offer_id: Optional[int] = None
    buyer_id: int
    agreed_price_per_unit: float = Field(..., gt=0)
    agreed_quantity: float = Field(..., gt=0)

class CropDealStatusUpdate(BaseModel):
    deal_status: str  # New Enquiry, Offer Sent, Negotiation, Accepted, Completed, Cancelled, Disputed
    dispute_reason: Optional[str] = None

class CropDealOut(BaseModel):
    id: int
    listing_id: int
    offer_id: Optional[int] = None
    farmer_id: int
    buyer_id: int
    agreed_price_per_unit: float
    agreed_quantity: float
    total_deal_value: float
    platform_commission_percent: float
    platform_commission_amount: float
    deal_status: str
    dispute_reason: Optional[str] = None
    completion_date: Optional[datetime] = None
    created_at: datetime
    farmer_name: Optional[str] = None
    buyer_name: Optional[str] = None
    crop_name: Optional[str] = None

    class Config:
        from_attributes = True
