from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.feedback import Complaint, Notification
from app.models.user import User
from app.schemas.feedback import ComplaintCreate, ComplaintOut, NotificationOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/feedback", tags=["Complaints & Notifications"])

@router.post("/complaints", response_model=ComplaintOut)
def submit_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comp = Complaint(
        user_id=current_user.id,
        category=payload.category,
        subject=payload.subject,
        description=payload.description,
        status="Submitted"
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)

    out = ComplaintOut.from_orm(comp)
    out.user_name = current_user.full_name
    out.user_phone = current_user.phone
    return out

@router.get("/complaints/my", response_model=List[ComplaintOut])
def get_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comps = db.query(Complaint).filter(
        Complaint.user_id == current_user.id
    ).order_by(Complaint.created_at.desc()).all()

    results = []
    for c in comps:
        out = ComplaintOut.from_orm(c)
        out.user_name = current_user.full_name
        out.user_phone = current_user.phone
        results.append(out)
    return results

@router.get("/notifications", response_model=List[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(30).all()
    return notifs

@router.put("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}
