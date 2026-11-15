from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.models.user import User, ShopProfile, BuyerProfile
from app.models.crop import CropListing, CropDeal
from app.models.labour import JobListing
from app.models.shop import ShopProduct
from app.models.smart import MarketPrice, GovernmentScheme
from app.models.payment import (
    PaymentOrder, PaymentTransaction, RefundRequest, CommissionRecord
)
from app.models.feedback import Complaint, AdminAuditLog
from app.schemas.payment import AdminRefundActionRequest, RefundRequestOut
from app.schemas.feedback import (
    AdminDashboardStats, AdminAuditLogOut, ComplaintOut, ComplaintResolveRequest
)
from app.schemas.smart import MarketPriceCreate, GovernmentSchemeCreate
from app.services.payment_service import handle_admin_refund_action
from app.services.auth_service import require_roles

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"])

@router.get("/stats", response_model=AdminDashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    total_users = db.query(User).count()
    total_farmers = db.query(User).filter(User.role == "farmer").count()
    total_labourers = db.query(User).filter(User.role == "labour").count()
    total_buyers = db.query(User).filter(User.role == "buyer").count()
    total_shops = db.query(User).filter(User.role == "shop").count()
    total_verified_shops = db.query(ShopProfile).filter(ShopProfile.is_verified == True).count()

    total_crop_listings = db.query(CropListing).count()
    total_active_listings = db.query(CropListing).filter(CropListing.status == "available").count()

    total_deals = db.query(CropDeal).count()
    total_deals_val = db.query(func.sum(CropDeal.total_deal_value)).scalar() or 0.0
    total_comm = db.query(func.sum(CommissionRecord.commission_amount)).scalar() or 0.0

    # Total platform revenue: sum of successful transactions
    total_revenue = db.query(func.sum(PaymentTransaction.amount)).filter(PaymentTransaction.status == "Successful").scalar() or 0.0

    total_job_listings = db.query(JobListing).count()
    pending_refunds = db.query(RefundRequest).filter(RefundRequest.status.in_(["Requested", "Under Review", "Approved"])).count()
    open_complaints = db.query(Complaint).filter(Complaint.status.in_(["Submitted", "Under Review"])).count()

    return AdminDashboardStats(
        total_users=total_users,
        total_farmers=total_farmers,
        total_labourers=total_labourers,
        total_buyers=total_buyers,
        total_shops=total_shops,
        total_verified_shops=total_verified_shops,
        total_crop_listings=total_crop_listings,
        total_active_listings=total_active_listings,
        total_deals=total_deals,
        total_deals_value=round(float(total_deals_val), 2),
        total_commission_earned=round(float(total_comm), 2),
        total_revenue=round(float(total_revenue), 2),
        total_job_listings=total_job_listings,
        pending_refund_requests=pending_refunds,
        open_complaints=open_complaints
    )

@router.get("/users")
def get_all_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    q = db.query(User)
    if role and role != "All":
        q = q.filter(User.role == role)
    users = q.order_by(User.created_at.desc()).all()
    
    results = []
    for u in users:
        results.append({
            "id": u.id,
            "full_name": u.full_name,
            "phone": u.phone,
            "email": u.email,
            "role": u.role,
            "district": u.district,
            "state": u.state,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at
        })
    return results

@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself.")

    user.is_active = not user.is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active, "message": "User status updated successfully"}

@router.put("/shops/{shop_id}/verify")
def verify_shop(
    shop_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    prof = db.query(ShopProfile).filter(ShopProfile.user_id == shop_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Shop profile not found")

    prof.is_verified = not prof.is_verified
    user = db.query(User).filter(User.id == shop_id).first()
    if user:
        user.is_verified = prof.is_verified

    audit = AdminAuditLog(
        admin_id=admin.id,
        action="TOGGLE_SHOP_VERIFICATION",
        target_entity="ShopProfile",
        target_id=str(shop_id),
        details=f"Admin {admin.full_name} set shop verification to {prof.is_verified}"
    )
    db.add(audit)
    db.commit()
    return {"shop_id": shop_id, "is_verified": prof.is_verified}

# Admin Refund Management
@router.get("/refunds", response_model=List[RefundRequestOut])
def get_all_refunds(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    q = db.query(RefundRequest)
    if status and status != "All":
        q = q.filter(RefundRequest.status == status)
    refunds = q.order_by(RefundRequest.created_at.desc()).all()

    results = []
    for r in refunds:
        out = RefundRequestOut.from_orm(r)
        if r.user:
            out.user_name = r.user.full_name
            out.user_phone = r.user.phone
        if r.transaction:
            out.transaction_reference = r.transaction.transaction_reference
        results.append(out)
    return results

@router.post("/refunds/{refund_id}/action", response_model=RefundRequestOut)
def admin_refund_action(
    refund_id: int,
    payload: AdminRefundActionRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    refund = handle_admin_refund_action(
        db=db,
        admin=admin,
        refund_id=refund_id,
        action=payload.action,
        admin_notes=payload.admin_notes,
        partial_amount=payload.partial_amount
    )
    out = RefundRequestOut.from_orm(refund)
    if refund.user:
        out.user_name = refund.user.full_name
        out.user_phone = refund.user.phone
    if refund.transaction:
        out.transaction_reference = refund.transaction.transaction_reference
    return out

# Admin Complaints
@router.get("/complaints", response_model=List[ComplaintOut])
def get_all_complaints(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    results = []
    for c in complaints:
        out = ComplaintOut.from_orm(c)
        if c.user:
            out.user_name = c.user.full_name
            out.user_phone = c.user.phone
        results.append(out)
    return results

@router.put("/complaints/{complaint_id}/resolve", response_model=ComplaintOut)
def resolve_complaint(
    complaint_id: int,
    payload: ComplaintResolveRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    comp.status = payload.status
    comp.admin_response = payload.admin_response
    comp.resolved_by_admin_id = admin.id
    db.commit()
    db.refresh(comp)

    out = ComplaintOut.from_orm(comp)
    if comp.user:
        out.user_name = comp.user.full_name
        out.user_phone = comp.user.phone
    return out

# Admin Audit Logs
@router.get("/audit-logs", response_model=List[AdminAuditLogOut])
def get_audit_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    logs = db.query(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).limit(100).all()
    results = []
    for l in logs:
        out = AdminAuditLogOut.from_orm(l)
        if l.admin:
            out.admin_name = l.admin.full_name
        results.append(out)
    return results

# Admin Add Verified Market Price
@router.post("/market-prices")
def add_market_price(
    payload: MarketPriceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    mp = MarketPrice(
        state=payload.state,
        district=payload.district,
        market_name=payload.market_name,
        crop_name=payload.crop_name,
        crop_name_te=payload.crop_name_te,
        variety=payload.variety,
        min_price=payload.min_price,
        max_price=payload.max_price,
        modal_price=payload.modal_price,
        unit=payload.unit,
        arrival_date=payload.arrival_date,
        data_source=payload.data_source,
        is_verified=True
    )
    db.add(mp)
    db.commit()
    db.refresh(mp)
    return mp

# Admin Add Scheme
@router.post("/schemes")
def add_scheme(
    payload: GovernmentSchemeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    sc = GovernmentScheme(
        name_en=payload.name_en,
        name_te=payload.name_te,
        category=payload.category,
        target_states=payload.target_states,
        description_en=payload.description_en,
        description_te=payload.description_te,
        benefits_en=payload.benefits_en,
        benefits_te=payload.benefits_te,
        eligibility_conditions_en=payload.eligibility_conditions_en,
        eligibility_conditions_te=payload.eligibility_conditions_te,
        required_documents_en=payload.required_documents_en,
        required_documents_te=payload.required_documents_te,
        application_procedure_en=payload.application_procedure_en,
        application_procedure_te=payload.application_procedure_te,
        official_portal_url=payload.official_portal_url,
        last_verified_date=payload.last_verified_date or "2026-10-15",
        is_active=True
    )
    db.add(sc)
    db.commit()
    db.refresh(sc)
    return sc
