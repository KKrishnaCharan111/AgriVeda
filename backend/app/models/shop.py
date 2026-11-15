from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ShopProduct(Base):
    __tablename__ = "shop_products"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False, index=True)
    name_te = Column(String(150), nullable=True)
    category = Column(String(50), nullable=False)  # Seeds, Fertilizers, Pesticides, Farming Tools, Machinery, Irrigation
    brand = Column(String(100), default="")
    price = Column(Float, nullable=False)
    unit = Column(String(30), default="Kg")  # Kg, Liter, Packet, Piece, Bag
    stock_quantity = Column(Integer, default=50)
    is_available = Column(Boolean, default=True)
    description = Column(Text, default="")
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    shop = relationship("User", foreign_keys=[shop_id])


class EquipmentRental(Base):
    __tablename__ = "equipment_rentals"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    equipment_name = Column(String(150), nullable=False)
    equipment_name_te = Column(String(150), nullable=True)
    category = Column(String(50), nullable=False)  # Tractor, Harvester, Power Tiller, Sprayer, Drones, Water Pump
    daily_rate = Column(Float, nullable=False)
    hourly_rate = Column(Float, nullable=True)
    deposit_amount = Column(Float, default=0.0)
    driver_included = Column(Boolean, default=False)
    condition = Column(String(50), default="Good")
    is_available = Column(Boolean, default=True)
    description = Column(Text, default="")
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    shop = relationship("User", foreign_keys=[shop_id])


class ShopEnquiry(Base):
    __tablename__ = "shop_enquiries"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String(150), default="")
    customer_name = Column(String(100), default="")
    contact_phone = Column(String(20), nullable=False)
    message = Column(Text, default="")
    status = Column(String(30), default="open")  # open, replied, closed
    created_at = Column(DateTime, default=datetime.utcnow)

    shop = relationship("User", foreign_keys=[shop_id])
    user = relationship("User", foreign_keys=[user_id])
