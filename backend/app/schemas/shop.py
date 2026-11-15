from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ShopProductCreate(BaseModel):
    name: str = Field(..., min_length=2)
    name_te: Optional[str] = None
    category: str  # Seeds, Fertilizers, Pesticides, Farming Tools, Machinery, Irrigation
    brand: Optional[str] = ""
    price: float = Field(..., gt=0)
    unit: str = "Kg"
    stock_quantity: int = 50
    is_available: bool = True
    description: Optional[str] = ""
    image_url: Optional[str] = None

class ShopProductOut(BaseModel):
    id: int
    shop_id: int
    name: str
    name_te: Optional[str] = None
    category: str
    brand: str
    price: float
    unit: str
    stock_quantity: int
    is_available: bool
    description: str
    image_url: Optional[str] = None
    created_at: datetime
    shop_name: Optional[str] = None
    shop_phone: Optional[str] = None
    shop_district: Optional[str] = None
    is_shop_verified: Optional[bool] = False

    class Config:
        from_attributes = True

class EquipmentRentalCreate(BaseModel):
    equipment_name: str = Field(..., min_length=2)
    equipment_name_te: Optional[str] = None
    category: str  # Tractor, Harvester, Power Tiller, Sprayer, Drones, Water Pump
    daily_rate: float = Field(..., gt=0)
    hourly_rate: Optional[float] = None
    deposit_amount: Optional[float] = 0.0
    driver_included: bool = False
    condition: str = "Good"
    is_available: bool = True
    description: Optional[str] = ""
    image_url: Optional[str] = None

class EquipmentRentalOut(BaseModel):
    id: int
    shop_id: int
    equipment_name: str
    equipment_name_te: Optional[str] = None
    category: str
    daily_rate: float
    hourly_rate: Optional[float] = None
    deposit_amount: float
    driver_included: bool
    condition: str
    is_available: bool
    description: str
    image_url: Optional[str] = None
    created_at: datetime
    shop_name: Optional[str] = None
    shop_phone: Optional[str] = None
    shop_district: Optional[str] = None
    is_shop_verified: Optional[bool] = False

    class Config:
        from_attributes = True

class ShopEnquiryCreate(BaseModel):
    shop_id: int
    product_name: str
    customer_name: str
    contact_phone: str
    message: Optional[str] = ""

class ShopEnquiryOut(BaseModel):
    id: int
    shop_id: int
    user_id: int
    product_name: str
    customer_name: str
    contact_phone: str
    message: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
