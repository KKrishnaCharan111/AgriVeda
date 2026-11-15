import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.config import settings
from app.models.payment import (
    PaymentOrder, PaymentTransaction, Subscription,
    CommissionRecord, RefundRequest, RefundTransaction
)
from app.models.user import User, BuyerProfile, ShopProfile
from app.models.feedback import AdminAuditLog, Notification

def create_payment_order(
    db: Session,
    user_id: int,
    purpose: str,
    amount: float,
    reference_id: Optional[str] = None,
    description: Optional[str] = "",
    idempotency_key: Optional[str] = None
) -> PaymentOrder:
    # Check idempotency to prevent duplicate charges
    if idempotency_key:
        existing = db.query(PaymentOrder).filter(PaymentOrder.idempotency_key == idempotency_key).first()
        if existing:
            return existing

    order_num = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    gateway_order_id = f"rzp_order_{uuid.uuid4().hex[:12]}" if not settings.ENABLE_MOCK_PAYMENTS else f"mock_ord_{uuid.uuid4().hex[:12]}"

    order = PaymentOrder(
        order_number=order_num,
        user_id=user_id,
        purpose=purpose,
        reference_id=reference_id,
        amount=amount,
        currency="INR",
        status="Pending",
        gateway_name="Razorpay Sandbox Simulator" if settings.ENABLE_MOCK_PAYMENTS else "Razorpay Live",
        gateway_order_id=gateway_order_id,
        idempotency_key=idempotency_key,
        description=description
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

def process_checkout_transaction(
    db: Session,
    user: User,
    order_id: int,
    payment_method: str,
    simulate_failure: bool = False
) -> Dict[str, Any]:
    order = db.query(PaymentOrder).filter(PaymentOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Payment order not found")
    if order.status == "Successful":
        raise HTTPException(status_code=400, detail="This order has already been successfully paid.")

    tx_ref = f"TXN-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:10].upper()}"
    gw_payment_id = f"pay_{uuid.uuid4().hex[:14]}"

    if simulate_failure:
        order.status = "Failed"
        transaction = PaymentTransaction(
            order_id=order.id,
            user_id=user.id,
            transaction_reference=tx_ref,
            payment_method=payment_method,
            amount=order.amount,
            currency="INR",
            status="Failed",
            gateway_payment_id=gw_payment_id,
            is_mock=settings.ENABLE_MOCK_PAYMENTS,
            error_message="Simulation: Bank gateway declined payment due to insufficient balance or timeout."
        )
        db.add(transaction)
        db.commit()
        return {
            "success": False,
            "status": "Failed",
            "transaction_reference": tx_ref,
            "order_number": order.order_number,
            "message": "Payment failed. Please try another UPI app or debit card."
        }

    # Successful payment simulation / gateway fulfillment
    order.status = "Successful"
    transaction = PaymentTransaction(
        order_id=order.id,
        user_id=user.id,
        transaction_reference=tx_ref,
        payment_method=payment_method,
        amount=order.amount,
        currency="INR",
        status="Successful",
        gateway_payment_id=gw_payment_id,
        is_mock=settings.ENABLE_MOCK_PAYMENTS
    )
    db.add(transaction)
    
    # Fulfill benefits based on purpose
    if order.purpose == "buyer_pro":
        # Activate Buyer Pro subscription
        sub = Subscription(
            user_id=user.id,
            plan_name="Buyer Pro",
            plan_type="buyer_pro",
            price=order.amount,
            status="active",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30),
            order_id=order.id
        )
        db.add(sub)
        buyer_profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == user.id).first()
        if buyer_profile:
            buyer_profile.is_pro = True
            buyer_profile.pro_expiry = datetime.utcnow() + timedelta(days=30)
            
    elif order.purpose == "shop_listing":
        sub = Subscription(
            user_id=user.id,
            plan_name="Agricultural Shop Monthly",
            plan_type="shop_listing",
            price=order.amount,
            status="active",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30),
            order_id=order.id
        )
        db.add(sub)
        
    elif order.purpose == "featured_promotion":
        shop_profile = db.query(ShopProfile).filter(ShopProfile.user_id == user.id).first()
        if shop_profile:
            shop_profile.is_featured = True
            shop_profile.featured_expiry = datetime.utcnow() + timedelta(days=15)

    elif order.purpose == "deal_commission":
        if order.reference_id:
            try:
                comm_rec = db.query(CommissionRecord).filter(CommissionRecord.deal_id == int(order.reference_id)).first()
                if comm_rec:
                    comm_rec.status = "Paid"
                    comm_rec.payment_order_id = order.id
            except ValueError:
                pass

    # Send in-app notification
    notif = Notification(
        user_id=user.id,
        title="Payment Successful",
        title_te="చెల్లింపు విజయవంతమైంది",
        message=f"Your payment of ₹{order.amount:.2f} for '{order.purpose.replace('_', ' ').title()}' was successful. Ref: {tx_ref}",
        message_te=f"మీ ₹{order.amount:.2f} చెల్లింపు విజయవంతంగా పూర్తయింది. సూచన: {tx_ref}",
        notification_type="payment",
        action_url="/payments/history"
    )
    db.add(notif)
    db.commit()
    db.refresh(transaction)
    
    return {
        "success": True,
        "status": "Successful",
        "transaction_reference": tx_ref,
        "order_number": order.order_number,
        "amount": order.amount,
        "payment_method": payment_method,
        "gateway_payment_id": gw_payment_id,
        "message": "Payment verified and service activated successfully."
    }

def submit_refund_request(
    db: Session,
    user_id: int,
    transaction_id: int,
    amount_requested: float,
    reason: str,
    explanation: str,
    evidence_url: Optional[str] = None
) -> RefundRequest:
    txn = db.query(PaymentTransaction).filter(PaymentTransaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    if txn.user_id != user_id:
        raise HTTPException(status_code=403, detail="You can only request refunds for your own transactions.")
    if txn.status != "Successful":
        raise HTTPException(status_code=400, detail="Only successful transactions are eligible for refund requests.")
    if amount_requested > txn.amount:
        raise HTTPException(status_code=400, detail=f"Requested refund amount cannot exceed original transaction amount (₹{txn.amount}).")

    # Prevent duplicate refund requests
    existing_refund = db.query(RefundRequest).filter(
        RefundRequest.transaction_id == transaction_id,
        RefundRequest.status.in_(["Requested", "Under Review", "Approved", "Processing", "Refunded"])
    ).first()
    if existing_refund:
        raise HTTPException(status_code=400, detail=f"A refund request ({existing_refund.refund_number}) already exists for this transaction.")

    ref_number = f"REF-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    refund = RefundRequest(
        refund_number=ref_number,
        transaction_id=transaction_id,
        user_id=user_id,
        amount_requested=amount_requested,
        amount_refunded=0.0,
        reason=reason,
        explanation=explanation,
        evidence_url=evidence_url,
        status="Requested"
    )
    
    # Update order status to Refund Requested
    if txn.order:
        txn.order.status = "Refund Requested"
        
    db.add(refund)
    db.commit()
    db.refresh(refund)
    return refund

def handle_admin_refund_action(
    db: Session,
    admin: User,
    refund_id: int,
    action: str,  # approve, reject, process_refund
    admin_notes: Optional[str] = "",
    partial_amount: Optional[float] = None
) -> RefundRequest:
    refund = db.query(RefundRequest).filter(RefundRequest.id == refund_id).first()
    if not refund:
        raise HTTPException(status_code=404, detail="Refund request not found.")

    if refund.status in ["Refunded", "Rejected"]:
        raise HTTPException(status_code=400, detail=f"Refund request is already in terminal state: '{refund.status}'.")

    now = datetime.utcnow()
    refund.reviewed_by_admin_id = admin.id
    refund.reviewed_at = now
    refund.admin_notes = admin_notes

    if action == "approve":
        refund.status = "Approved"
    elif action == "reject":
        refund.status = "Rejected"
        if refund.transaction and refund.transaction.order:
            refund.transaction.order.status = "Successful"
    elif action == "process_refund":
        # Process refund via gateway
        refund_amt = partial_amount if (partial_amount and partial_amount > 0 and partial_amount <= refund.amount_requested) else refund.amount_requested
        gw_ref_id = f"rfnd_{uuid.uuid4().hex[:14]}"
        
        refund.amount_refunded = refund_amt
        refund.gateway_refund_id = gw_ref_id
        
        if refund_amt < refund.transaction.amount:
            refund.status = "Partially Refunded"
            if refund.transaction.order:
                refund.transaction.order.status = "Partially Refunded"
        else:
            refund.status = "Refunded"
            if refund.transaction.order:
                refund.transaction.order.status = "Refunded"

        # Record gateway refund transaction
        rf_txn = RefundTransaction(
            refund_request_id=refund.id,
            amount=refund_amt,
            gateway_refund_id=gw_ref_id,
            status="Refunded",
            processed_by_admin_id=admin.id
        )
        db.add(rf_txn)

    # Add audit log
    audit = AdminAuditLog(
        admin_id=admin.id,
        action=f"REFUND_{action.upper()}",
        target_entity="RefundRequest",
        target_id=str(refund.id),
        details=f"Admin {admin.full_name} executed {action} on refund {refund.refund_number}. Notes: {admin_notes}"
    )
    db.add(audit)

    # Notify user
    notif = Notification(
        user_id=refund.user_id,
        title=f"Refund {refund.status}",
        title_te=f"రీఫండ్ స్థితి: {refund.status}",
        message=f"Your refund request #{refund.refund_number} has been updated to: {refund.status}. Notes: {admin_notes or 'Processed.'}",
        message_te=f"మీ రీఫండ్ అభ్యర్థన #{refund.refund_number} స్థితి: {refund.status}.",
        notification_type="payment",
        action_url="/payments/history"
    )
    db.add(notif)
    db.commit()
    db.refresh(refund)
    return refund
