from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.crop import CropListing, CropImage, BuyerOffer, CropDeal
from app.models.payment import CommissionRecord
from app.models.feedback import Notification
from app.models.user import User
from app.schemas.crop import (
    CropListingCreate, CropListingUpdate, CropListingOut,
    BuyerOfferCreate, BuyerOfferUpdate, BuyerOfferOut,
    CropDealCreate, CropDealStatusUpdate, CropDealOut
)
from app.services.auth_service import get_current_user, require_roles
from app.config import settings

router = APIRouter(prefix="/crops", tags=["Crop Marketplace"])

@router.get("", response_model=List[CropListingOut])
def list_crops(
    query: Optional[str] = None,
    category: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    organic_only: Optional[bool] = False,
    status: Optional[str] = "available",
    db: Session = Depends(get_db)
):
    q = db.query(CropListing)
    if status:
        q = q.filter(CropListing.status == status)
    if query:
        term = f"%{query.strip()}%"
        q = q.filter(
            (CropListing.crop_name.ilike(term)) |
            (CropListing.variety.ilike(term)) |
            (CropListing.district.ilike(term)) |
            (CropListing.village.ilike(term))
        )
    if category and category != "All":
        q = q.filter(CropListing.category == category)
    if district and district != "All":
        q = q.filter(CropListing.district.ilike(f"%{district.strip()}%"))
    if state and state != "All":
        q = q.filter(CropListing.state.ilike(f"%{state.strip()}%"))
    if min_price is not None:
        q = q.filter(CropListing.expected_price_per_unit >= min_price)
    if max_price is not None:
        q = q.filter(CropListing.expected_price_per_unit <= max_price)
    if organic_only:
        q = q.filter(CropListing.organic_certified == True)

    listings = q.order_by(CropListing.created_at.desc()).all()
    
    # Enrich with farmer details
    results = []
    for item in listings:
        out = CropListingOut.from_orm(item)
        if item.farmer:
            out.farmer_name = item.farmer.full_name
            out.farmer_phone = item.farmer.phone
        results.append(out)
    return results

@router.post("", response_model=CropListingOut)
def create_crop_listing(
    payload: CropListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["farmer", "admin"]))
):
    listing = CropListing(
        farmer_id=current_user.id,
        crop_name=payload.crop_name,
        crop_name_te=payload.crop_name_te,
        variety=payload.variety or "Hybrid",
        category=payload.category or "Cereals",
        quantity=payload.quantity,
        unit=payload.unit,
        expected_price_per_unit=payload.expected_price_per_unit,
        quality_grade=payload.quality_grade or "Grade A",
        organic_certified=payload.organic_certified or False,
        description=payload.description or "",
        harvest_date=payload.harvest_date or "",
        village=payload.village or current_user.village,
        district=payload.district or current_user.district,
        state=payload.state or current_user.state,
        pin_code=payload.pin_code or "",
        status="available"
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    out = CropListingOut.from_orm(listing)
    out.farmer_name = current_user.full_name
    out.farmer_phone = current_user.phone
    return out

@router.get("/{crop_id}", response_model=CropListingOut)
def get_crop_listing(crop_id: int, db: Session = Depends(get_db)):
    listing = db.query(CropListing).filter(CropListing.id == crop_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found")
    out = CropListingOut.from_orm(listing)
    if listing.farmer:
        out.farmer_name = listing.farmer.full_name
        out.farmer_phone = listing.farmer.phone
    return out

@router.put("/{crop_id}", response_model=CropListingOut)
def update_crop_listing(
    crop_id: int,
    payload: CropListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(CropListing).filter(CropListing.id == crop_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found")
    if listing.farmer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to modify this listing")

    for field, val in payload.dict(exclude_unset=True).items():
        setattr(listing, field, val)

    db.commit()
    db.refresh(listing)
    out = CropListingOut.from_orm(listing)
    if listing.farmer:
        out.farmer_name = listing.farmer.full_name
        out.farmer_phone = listing.farmer.phone
    return out

# Buyer Offers
@router.post("/{crop_id}/offers", response_model=BuyerOfferOut)
def create_buyer_offer(
    crop_id: int,
    payload: BuyerOfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["buyer", "admin"]))
):
    listing = db.query(CropListing).filter(CropListing.id == crop_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found")

    total_amount = payload.offered_price_per_unit * payload.quantity
    offer = BuyerOffer(
        listing_id=crop_id,
        buyer_id=current_user.id,
        offered_price_per_unit=payload.offered_price_per_unit,
        quantity=payload.quantity,
        total_amount=total_amount,
        message=payload.message or "",
        status="Offer Sent"
    )
    db.add(offer)

    # Notify farmer
    notif = Notification(
        user_id=listing.farmer_id,
        title=f"New Offer for {listing.crop_name}",
        title_te=f"{listing.crop_name} కోసం కొత్త కొనుగోలు ఆఫర్",
        message=f"Buyer {current_user.full_name} sent an offer of ₹{payload.offered_price_per_unit}/{listing.unit} for {payload.quantity} {listing.unit}.",
        message_te=f"కొనుగోలుదారు {current_user.full_name} ₹{payload.offered_price_per_unit}/{listing.unit} ధరతో {payload.quantity} {listing.unit} కోసం ఆఫర్ పంపారు.",
        notification_type="deal",
        action_url=f"/crops/{crop_id}"
    )
    db.add(notif)
    db.commit()
    db.refresh(offer)

    out = BuyerOfferOut.from_orm(offer)
    out.buyer_name = current_user.full_name
    out.buyer_phone = current_user.phone
    out.crop_name = listing.crop_name
    return out

@router.get("/{crop_id}/offers", response_model=List[BuyerOfferOut])
def get_crop_offers(
    crop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(CropListing).filter(CropListing.id == crop_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found")

    # Only listing farmer, buyer who made offers, or admin can view
    if listing.farmer_id == current_user.id or current_user.role == "admin":
        offers = db.query(BuyerOffer).filter(BuyerOffer.listing_id == crop_id).order_by(BuyerOffer.created_at.desc()).all()
    else:
        offers = db.query(BuyerOffer).filter(BuyerOffer.listing_id == crop_id, BuyerOffer.buyer_id == current_user.id).all()

    results = []
    for o in offers:
        out = BuyerOfferOut.from_orm(o)
        if o.buyer:
            out.buyer_name = o.buyer.full_name
            out.buyer_phone = o.buyer.phone
        out.crop_name = listing.crop_name
        results.append(out)
    return results

@router.put("/offers/{offer_id}", response_model=BuyerOfferOut)
def update_offer(
    offer_id: int,
    payload: BuyerOfferUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offer = db.query(BuyerOffer).filter(BuyerOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if payload.counter_price is not None:
        offer.counter_price = payload.counter_price
        offer.status = "Negotiation"
    if payload.status is not None:
        offer.status = payload.status

    db.commit()
    db.refresh(offer)

    out = BuyerOfferOut.from_orm(offer)
    if offer.buyer:
        out.buyer_name = offer.buyer.full_name
        out.buyer_phone = offer.buyer.phone
    if offer.listing:
        out.crop_name = offer.listing.crop_name
    return out

# Crop Deals
@router.post("/deals", response_model=CropDealOut)
def create_deal(
    payload: CropDealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(CropListing).filter(CropListing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found")

    total_val = payload.agreed_price_per_unit * payload.agreed_quantity
    comm_pct = settings.PLATFORM_COMMISSION_PERCENT
    comm_amt = (total_val * comm_pct) / 100.0

    deal = CropDeal(
        listing_id=payload.listing_id,
        offer_id=payload.offer_id,
        farmer_id=listing.farmer_id,
        buyer_id=payload.buyer_id,
        agreed_price_per_unit=payload.agreed_price_per_unit,
        agreed_quantity=payload.agreed_quantity,
        total_deal_value=total_val,
        platform_commission_percent=comm_pct,
        platform_commission_amount=comm_amt,
        deal_status="Accepted"
    )
    db.add(deal)
    listing.status = "in_negotiation"
    db.commit()
    db.refresh(deal)

    out = CropDealOut.from_orm(deal)
    out.farmer_name = listing.farmer.full_name if listing.farmer else ""
    buyer = db.query(User).filter(User.id == payload.buyer_id).first()
    out.buyer_name = buyer.full_name if buyer else ""
    out.crop_name = listing.crop_name
    return out

@router.get("/deals/my", response_model=List[CropDealOut])
def get_my_deals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        deals = db.query(CropDeal).order_by(CropDeal.created_at.desc()).all()
    elif current_user.role == "farmer":
        deals = db.query(CropDeal).filter(CropDeal.farmer_id == current_user.id).order_by(CropDeal.created_at.desc()).all()
    else:
        deals = db.query(CropDeal).filter(CropDeal.buyer_id == current_user.id).order_by(CropDeal.created_at.desc()).all()

    results = []
    for d in deals:
        out = CropDealOut.from_orm(d)
        if d.farmer:
            out.farmer_name = d.farmer.full_name
        if d.buyer:
            out.buyer_name = d.buyer.full_name
        if d.listing:
            out.crop_name = d.listing.crop_name
        results.append(out)
    return results

@router.put("/deals/{deal_id}/status", response_model=CropDealOut)
def update_deal_status(
    deal_id: int,
    payload: CropDealStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deal = db.query(CropDeal).filter(CropDeal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    valid_statuses = [
        "New Enquiry", "Offer Sent", "Negotiation", "Accepted", "Completed", "Cancelled", "Disputed"
    ]
    if payload.deal_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid deal status. Must be one of {valid_statuses}")

    deal.deal_status = payload.deal_status
    if payload.dispute_reason:
        deal.dispute_reason = payload.dispute_reason

    if payload.deal_status == "Completed":
        deal.completion_date = datetime.utcnow()
        if deal.listing:
            deal.listing.status = "sold"
        # Record commission
        existing_comm = db.query(CommissionRecord).filter(CommissionRecord.deal_id == deal.id).first()
        if not existing_comm:
            comm = CommissionRecord(
                deal_id=deal.id,
                buyer_id=deal.buyer_id,
                transaction_amount=deal.total_deal_value,
                commission_percent=deal.platform_commission_percent,
                commission_amount=deal.platform_commission_amount,
                status="Pending"
            )
            db.add(comm)

    elif payload.deal_status == "Cancelled":
        if deal.listing:
            deal.listing.status = "available"

    db.commit()
    db.refresh(deal)

    out = CropDealOut.from_orm(deal)
    if deal.farmer:
        out.farmer_name = deal.farmer.full_name
    if deal.buyer:
        out.buyer_name = deal.buyer.full_name
    if deal.listing:
        out.crop_name = deal.listing.crop_name
    return out
