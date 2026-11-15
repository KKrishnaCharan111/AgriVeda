from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PaymentOrderCreate(BaseModel):
    purpose: str = Field(..., pattern="^(buyer_pro|shop_listing|featured_promotion|deal_commission)$")
    amount: float = Field(..., gt=0)
    reference_id: Optional[str] = None
    description: Optional[str] = ""
    idempotency_key: Optional[str] = None

class PaymentOrderOut(BaseModel):
    id: int
    order_number: str
    user_id: int
    purpose: str
    reference_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    gateway_name: str
    gateway_order_id: Optional[str] = None
    description: str
    created_at: datetime
    class Config:
        from_attributes = True

class MockPaymentCheckoutRequest(BaseModel):
    order_id: int
    payment_method: str = Field(..., pattern="^(upi_phonepe|upi_gpay|upi_paytm|upi_id|upi_qr|debit_card|credit_card|net_banking)$")
    upi_id: Optional[str] = None
    simulate_failure: Optional[bool] = False

class PaymentTransactionOut(BaseModel):
    id: int
    order_id: int
    transaction_reference: str
    payment_method: str
    amount: float
    currency: str
    status: str
    gateway_payment_id: Optional[str] = None
    is_mock: bool
    created_at: datetime
    class Config:
        from_attributes = True

class SubscriptionOut(BaseModel):
    id: int
    user_id: int
    plan_name: str
    plan_type: str
    price: float
    status: str
    start_date: datetime
    end_date: datetime
    created_at: datetime
    class Config:
        from_attributes = True

class CommissionRecordOut(BaseModel):
    id: int
    deal_id: int
    buyer_id: int
    transaction_amount: float
    commission_percent: float
    commission_amount: float
    status: str
    created_at: datetime
    buyer_name: Optional[str] = None
    class Config:
        from_attributes = True

class RefundRequestCreate(BaseModel):
    transaction_id: int
    amount_requested: float = Field(..., gt=0)
    reason: str = Field(..., min_length=3)
    explanation: str = Field(..., min_length=10)
    evidence_url: Optional[str] = None

class AdminRefundActionRequest(BaseModel):
    action: str = Field(..., pattern="^(approve|reject|process_refund)$")
    admin_notes: Optional[str] = ""
    partial_amount: Optional[float] = None

class RefundRequestOut(BaseModel):
    id: int
    refund_number: str
    transaction_id: int
    user_id: int
    amount_requested: float
    amount_refunded: float
    reason: str
    explanation: str
    evidence_url: Optional[str] = None
    status: str
    admin_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    gateway_refund_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    transaction_reference: Optional[str] = None

    class Config:
        from_attributes = True
