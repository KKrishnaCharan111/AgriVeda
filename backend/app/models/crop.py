from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class CropListing(Base):
    __tablename__ = "crop_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String(100), nullable=False, index=True)
    crop_name_te = Column(String(100), nullable=True)
    variety = Column(String(100), default="Hybrid")
    category = Column(String(50), default="Cereals")  # Cereals, Pulses, Vegetables, Fruits, Spices, Commercial
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="Quintal")  # Quintal, Kg, Ton, Bag
    expected_price_per_unit = Column(Float, nullable=False)
    quality_grade = Column(String(20), default="Grade A")  # Grade A, Grade B, Premium, Standard
    organic_certified = Column(Boolean, default=False)
    description = Column(Text, default="")
    harvest_date = Column(String(50), default="")
    village = Column(String(100), default="")
    district = Column(String(50), nullable=False, index=True)
    state = Column(String(50), default="Andhra Pradesh", index=True)
    pin_code = Column(String(10), default="")
    status = Column(String(30), default="available", index=True)  # available, in_negotiation, sold, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("User", foreign_keys=[farmer_id])
    images = relationship("CropImage", back_populates="listing", cascade="all, delete-orphan")
    offers = relationship("BuyerOffer", back_populates="listing", cascade="all, delete-orphan")
    deals = relationship("CropDeal", back_populates="listing", cascade="all, delete-orphan")


class CropImage(Base):
    __tablename__ = "crop_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("crop_listings.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("CropListing", back_populates="images")


class BuyerOffer(Base):
    __tablename__ = "buyer_offers"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("crop_listings.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offered_price_per_unit = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    counter_price = Column(Float, nullable=True)
    message = Column(Text, default="")
    status = Column(String(30), default="Offer Sent")  # New Enquiry, Offer Sent, Negotiation, Accepted, Rejected, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    listing = relationship("CropListing", back_populates="offers")
    buyer = relationship("User", foreign_keys=[buyer_id])


class CropDeal(Base):
    __tablename__ = "crop_deals"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("crop_listings.id", ondelete="CASCADE"), nullable=False)
    offer_id = Column(Integer, ForeignKey("buyer_offers.id", ondelete="SET NULL"), nullable=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    agreed_price_per_unit = Column(Float, nullable=False)
    agreed_quantity = Column(Float, nullable=False)
    total_deal_value = Column(Float, nullable=False)
    platform_commission_percent = Column(Float, default=1.0)
    platform_commission_amount = Column(Float, default=0.0)
    deal_status = Column(String(30), default="New Enquiry")  
    # Specific statuses required: New Enquiry, Offer Sent, Negotiation, Accepted, Completed, Cancelled, Disputed
    dispute_reason = Column(Text, nullable=True)
    completion_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    listing = relationship("CropListing", back_populates="deals")
    farmer = relationship("User", foreign_keys=[farmer_id])
    buyer = relationship("User", foreign_keys=[buyer_id])
    offer = relationship("BuyerOffer", foreign_keys=[offer_id])
