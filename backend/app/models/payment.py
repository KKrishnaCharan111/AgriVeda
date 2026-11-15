from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class PaymentOrder(Base):
    __tablename__ = "payment_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    purpose = Column(String(50), nullable=False)  # buyer_pro, shop_listing, featured_promotion, deal_commission
    reference_id = Column(String(50), nullable=True)  # listing_id or deal_id or subscription_id
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="Pending", index=True)
    # Required statuses: Pending, Processing, Successful, Failed, Cancelled, Refund Requested, Partially Refunded, Refunded
    gateway_name = Column(String(50), default="Razorpay Sandbox")
    gateway_order_id = Column(String(100), nullable=True)
    idempotency_key = Column(String(100), unique=True, nullable=True)
    description = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
    transactions = relationship("PaymentTransaction", back_populates="order", cascade="all, delete-orphan")


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("payment_orders.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    transaction_reference = Column(String(100), unique=True, index=True, nullable=False)
    payment_method = Column(String(50), nullable=False)
    # upi_phonepe, upi_gpay, upi_paytm, upi_id, upi_qr, debit_card, credit_card, net_banking
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="Processing", index=True)
    gateway_payment_id = Column(String(100), nullable=True)
    gateway_signature = Column(String(255), nullable=True)
    is_mock = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("PaymentOrder", back_populates="transactions")
    user = relationship("User", foreign_keys=[user_id])
    refund_requests = relationship("RefundRequest", back_populates="transaction", cascade="all, delete-orphan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_name = Column(String(50), nullable=False)  # Buyer Pro, Agricultural Shop Monthly
    plan_type = Column(String(50), nullable=False)  # buyer_pro, shop_listing
    price = Column(Float, nullable=False)
    status = Column(String(20), default="active")  # active, expired, cancelled
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=False)
    order_id = Column(Integer, ForeignKey("payment_orders.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
    order = relationship("PaymentOrder", foreign_keys=[order_id])


class CommissionRecord(Base):
    __tablename__ = "commission_records"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("crop_deals.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    transaction_amount = Column(Float, nullable=False)
    commission_percent = Column(Float, default=1.0)
    commission_amount = Column(Float, nullable=False)
    status = Column(String(30), default="Pending")  # Pending, Invoiced, Paid, Waived
    payment_order_id = Column(Integer, ForeignKey("payment_orders.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    deal = relationship("CropDeal", foreign_keys=[deal_id])
    buyer = relationship("User", foreign_keys=[buyer_id])


class RefundRequest(Base):
    __tablename__ = "refund_requests"

    id = Column(Integer, primary_key=True, index=True)
    refund_number = Column(String(50), unique=True, index=True, nullable=False)
    transaction_id = Column(Integer, ForeignKey("payment_transactions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount_requested = Column(Float, nullable=False)
    amount_refunded = Column(Float, default=0.0)
    reason = Column(String(100), nullable=False)  # Accidental double payment, Service not delivered, Deal cancelled, Other
    explanation = Column(Text, nullable=False)
    evidence_url = Column(String(255), nullable=True)
    status = Column(String(30), default="Requested", index=True)
    # Required: Requested, Under Review, Approved, Rejected, Processing, Partially Refunded, Refunded, Failed
    admin_notes = Column(Text, nullable=True)
    reviewed_by_admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    gateway_refund_id = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transaction = relationship("PaymentTransaction", back_populates="refund_requests")
    user = relationship("User", foreign_keys=[user_id])
    admin = relationship("User", foreign_keys=[reviewed_by_admin_id])
    refund_transactions = relationship("RefundTransaction", back_populates="refund_request", cascade="all, delete-orphan")


class RefundTransaction(Base):
    __tablename__ = "refund_transactions"

    id = Column(Integer, primary_key=True, index=True)
    refund_request_id = Column(Integer, ForeignKey("refund_requests.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    gateway_refund_id = Column(String(100), nullable=False)
    status = Column(String(30), default="Refunded")  # Processing, Refunded, Failed
    processed_by_admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    refund_request = relationship("RefundRequest", back_populates="refund_transactions")
