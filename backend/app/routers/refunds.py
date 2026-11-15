from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.payment import RefundRequest, PaymentTransaction
from app.models.user import User
from app.schemas.payment import RefundRequestCreate, RefundRequestOut
from app.services.payment_service import submit_refund_request
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/refunds", tags=["Refund Requests"])

@router.post("/request", response_model=RefundRequestOut)
def request_refund(
    payload: RefundRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    refund = submit_refund_request(
        db=db,
        user_id=current_user.id,
        transaction_id=payload.transaction_id,
        amount_requested=payload.amount_requested,
        reason=payload.reason,
        explanation=payload.explanation,
        evidence_url=payload.evidence_url
    )
    
    out = RefundRequestOut.from_orm(refund)
    out.user_name = current_user.full_name
    out.user_phone = current_user.phone
    if refund.transaction:
        out.transaction_reference = refund.transaction.transaction_reference
    return out

@router.get("/my", response_model=List[RefundRequestOut])
def get_my_refund_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    refunds = db.query(RefundRequest).filter(
        RefundRequest.user_id == current_user.id
    ).order_by(RefundRequest.created_at.desc()).all()

    results = []
    for r in refunds:
        out = RefundRequestOut.from_orm(r)
        out.user_name = current_user.full_name
        out.user_phone = current_user.phone
        if r.transaction:
            out.transaction_reference = r.transaction.transaction_reference
        results.append(out)
    return results
