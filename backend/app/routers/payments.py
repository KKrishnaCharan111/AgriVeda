from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.payment import PaymentOrder, PaymentTransaction, Subscription
from app.models.user import User
from app.schemas.payment import (
    PaymentOrderCreate, PaymentOrderOut,
    MockPaymentCheckoutRequest, PaymentTransactionOut,
    SubscriptionOut
)
from app.services.payment_service import (
    create_payment_order, process_checkout_transaction
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments & Transactions"])

@router.post("/orders", response_model=PaymentOrderOut)
def create_order(
    payload: PaymentOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = create_payment_order(
        db=db,
        user_id=current_user.id,
        purpose=payload.purpose,
        amount=payload.amount,
        reference_id=payload.reference_id,
        description=payload.description or "",
        idempotency_key=payload.idempotency_key
    )
    return order

@router.post("/checkout")
def checkout_order(
    payload: MockPaymentCheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = process_checkout_transaction(
        db=db,
        user=current_user,
        order_id=payload.order_id,
        payment_method=payload.payment_method,
        simulate_failure=payload.simulate_failure or False
    )
    return result

@router.get("/transactions", response_model=List[PaymentTransactionOut])
def get_user_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txns = db.query(PaymentTransaction).filter(
        PaymentTransaction.user_id == current_user.id
    ).order_by(PaymentTransaction.created_at.desc()).all()
    return txns

@router.get("/subscriptions", response_model=List[SubscriptionOut])
def get_user_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subs = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).order_by(Subscription.created_at.desc()).all()
    return subs
