from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ComplaintCreate(BaseModel):
    category: str = Field(..., min_length=2)
    subject: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)

class ComplaintResolveRequest(BaseModel):
    status: str = Field(..., pattern="^(Under Review|Resolved|Closed)$")
    admin_response: str = Field(..., min_length=3)

class ComplaintOut(BaseModel):
    id: int
    user_id: int
    category: str
    subject: str
    description: str
    status: str
    admin_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    title_te: Optional[str] = None
    message: str
    message_te: Optional[str] = None
    notification_type: str
    is_read: bool
    action_url: str
    created_at: datetime
    class Config:
        from_attributes = True

class AdminAuditLogOut(BaseModel):
    id: int
    admin_id: Optional[int] = None
    action: str
    target_entity: str
    target_id: Optional[str] = None
    details: str
    ip_address: str
    created_at: datetime
    admin_name: Optional[str] = None
    class Config:
        from_attributes = True

class AdminDashboardStats(BaseModel):
    total_users: int
    total_farmers: int
    total_labourers: int
    total_buyers: int
    total_shops: int
    total_verified_shops: int
    total_crop_listings: int
    total_active_listings: int
    total_deals: int
    total_deals_value: float
    total_commission_earned: float
    total_revenue: float
    total_job_listings: int
    pending_refund_requests: int
    open_complaints: int
