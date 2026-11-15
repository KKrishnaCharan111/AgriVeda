from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # Deal Dispute, Payment Issue, Labour Problem, Shop Grievance, Bug / App Feedback
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(30), default="Submitted", index=True)  # Submitted, Under Review, Resolved, Closed
    admin_response = Column(Text, nullable=True)
    resolved_by_admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
    admin = relationship("User", foreign_keys=[resolved_by_admin_id])


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    target_entity = Column(String(50), nullable=False)  # User, Shop, Refund, MarketPrice, Scheme, Deal
    target_id = Column(String(50), nullable=True)
    details = Column(Text, default="")
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow)

    admin = relationship("User", foreign_keys=[admin_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    title_te = Column(String(150), nullable=True)
    message = Column(Text, nullable=False)
    message_te = Column(Text, nullable=True)
    notification_type = Column(String(30), default="system")  # deal, labour, payment, weather, scheme, system
    is_read = Column(Boolean, default=False)
    action_url = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
