from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.shop import ShopProduct, EquipmentRental, ShopEnquiry
from app.models.user import User, ShopProfile
from app.schemas.shop import (
    ShopProductCreate, ShopProductOut,
    EquipmentRentalCreate, EquipmentRentalOut,
    ShopEnquiryCreate, ShopEnquiryOut
)
from app.services.auth_service import get_current_user, require_roles

router = APIRouter(prefix="/shops", tags=["Agricultural Shops & Products"])

@router.get("")
def list_shops(
    district: Optional[str] = None,
    verified_only: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    q = db.query(User).filter(User.role == "shop", User.is_active == True)
    if district and district != "All":
        q = q.filter(User.district.ilike(f"%{district.strip()}%"))

    shops = q.all()
    results = []
    for s in shops:
        prof = s.shop_profile
        is_ver = prof.is_verified if prof else False
        if verified_only and not is_ver:
            continue
        results.append({
            "id": s.id,
            "shop_name": prof.shop_name if prof else s.full_name,
            "owner_name": prof.owner_name if prof else s.full_name,
            "phone": s.phone,
            "address": prof.address if prof else f"{s.village}, {s.district}",
            "district": s.district,
            "state": s.state,
            "is_verified": is_ver,
            "is_featured": prof.is_featured if prof else False,
            "delivery_available": prof.delivery_available if prof else True
        })
    return results

@router.get("/products", response_model=List[ShopProductOut])
def list_products(
    category: Optional[str] = None,
    shop_id: Optional[int] = None,
    district: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(ShopProduct).filter(ShopProduct.is_available == True)
    if category and category != "All":
        q = q.filter(ShopProduct.category == category)
    if shop_id:
        q = q.filter(ShopProduct.shop_id == shop_id)
    if query:
        term = f"%{query.strip()}%"
        q = q.filter((ShopProduct.name.ilike(term)) | (ShopProduct.brand.ilike(term)))

    products = q.order_by(ShopProduct.created_at.desc()).all()
    results = []
    for p in products:
        out = ShopProductOut.from_orm(p)
        if p.shop:
            out.shop_phone = p.shop.phone
            out.shop_district = p.shop.district
            if p.shop.shop_profile:
                out.shop_name = p.shop.shop_profile.shop_name
                out.is_shop_verified = p.shop.shop_profile.is_verified
        if district and district != "All" and out.shop_district:
            if district.lower() not in out.shop_district.lower():
                continue
        results.append(out)
    return results

@router.post("/products", response_model=ShopProductOut)
def create_product(
    payload: ShopProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["shop", "admin"]))
):
    prod = ShopProduct(
        shop_id=current_user.id,
        name=payload.name,
        name_te=payload.name_te,
        category=payload.category,
        brand=payload.brand or "",
        price=payload.price,
        unit=payload.unit,
        stock_quantity=payload.stock_quantity,
        is_available=payload.is_available,
        description=payload.description or "",
        image_url=payload.image_url
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)

    out = ShopProductOut.from_orm(prod)
    out.shop_phone = current_user.phone
    out.shop_district = current_user.district
    if current_user.shop_profile:
        out.shop_name = current_user.shop_profile.shop_name
        out.is_shop_verified = current_user.shop_profile.is_verified
    return out

@router.get("/rentals", response_model=List[EquipmentRentalOut])
def list_rentals(
    category: Optional[str] = None,
    shop_id: Optional[int] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(EquipmentRental).filter(EquipmentRental.is_available == True)
    if category and category != "All":
        q = q.filter(EquipmentRental.category == category)
    if shop_id:
        q = q.filter(EquipmentRental.shop_id == shop_id)

    rentals = q.order_by(EquipmentRental.created_at.desc()).all()
    results = []
    for r in rentals:
        out = EquipmentRentalOut.from_orm(r)
        if r.shop:
            out.shop_phone = r.shop.phone
            out.shop_district = r.shop.district
            if r.shop.shop_profile:
                out.shop_name = r.shop.shop_profile.shop_name
                out.is_shop_verified = r.shop.shop_profile.is_verified
        if district and district != "All" and out.shop_district:
            if district.lower() not in out.shop_district.lower():
                continue
        results.append(out)
    return results

@router.post("/rentals", response_model=EquipmentRentalOut)
def create_rental(
    payload: EquipmentRentalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["shop", "admin"]))
):
    rental = EquipmentRental(
        shop_id=current_user.id,
        equipment_name=payload.equipment_name,
        equipment_name_te=payload.equipment_name_te,
        category=payload.category,
        daily_rate=payload.daily_rate,
        hourly_rate=payload.hourly_rate,
        deposit_amount=payload.deposit_amount or 0.0,
        driver_included=payload.driver_included,
        condition=payload.condition,
        is_available=payload.is_available,
        description=payload.description or "",
        image_url=payload.image_url
    )
    db.add(rental)
    db.commit()
    db.refresh(rental)

    out = EquipmentRentalOut.from_orm(rental)
    out.shop_phone = current_user.phone
    out.shop_district = current_user.district
    if current_user.shop_profile:
        out.shop_name = current_user.shop_profile.shop_name
        out.is_shop_verified = current_user.shop_profile.is_verified
    return out

@router.post("/enquiries", response_model=ShopEnquiryOut)
def create_enquiry(
    payload: ShopEnquiryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enq = ShopEnquiry(
        shop_id=payload.shop_id,
        user_id=current_user.id,
        product_name=payload.product_name,
        customer_name=payload.customer_name or current_user.full_name,
        contact_phone=payload.contact_phone or current_user.phone,
        message=payload.message or "",
        status="open"
    )
    db.add(enq)
    db.commit()
    db.refresh(enq)
    return enq

@router.get("/enquiries/my", response_model=List[ShopEnquiryOut])
def get_my_enquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "shop":
        enquiries = db.query(ShopEnquiry).filter(ShopEnquiry.shop_id == current_user.id).order_by(ShopEnquiry.created_at.desc()).all()
    else:
        enquiries = db.query(ShopEnquiry).filter(ShopEnquiry.user_id == current_user.id).order_by(ShopEnquiry.created_at.desc()).all()
    return enquiries
