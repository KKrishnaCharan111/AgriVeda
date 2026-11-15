import pytest
from app.services.auth_service import create_access_token

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_user_registration_and_login(client):
    # Register Farmer
    reg_payload = {
        "phone": "9998887770",
        "full_name": "Test Farmer",
        "password": "password123",
        "role": "farmer",
        "preferred_language": "te",
        "state": "Andhra Pradesh",
        "district": "Guntur",
        "village": "Narakodur"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "farmer"

    # Login
    login_payload = {
        "phone": "9998887770",
        "password": "password123"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_crop_listing_and_buyer_search(client):
    # Register farmer
    res = client.post("/api/auth/register", json={
        "phone": "9998887771",
        "full_name": "Farmer Venkat",
        "password": "password123",
        "role": "farmer",
        "preferred_language": "te",
        "district": "Krishna"
    })
    farmer_token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {farmer_token}"}

    # Create crop listing
    crop_payload = {
        "crop_name": "Organic Turmeric",
        "crop_name_te": "సేంద్రీయ పసుపు",
        "variety": "Duggirala",
        "category": "Spices",
        "quantity": 50.0,
        "unit": "Quintal",
        "expected_price_per_unit": 14000.0,
        "quality_grade": "Grade A",
        "organic_certified": True,
        "district": "Krishna",
        "state": "Andhra Pradesh"
    }
    crop_res = client.post("/api/crops", json=crop_payload, headers=headers)
    assert crop_res.status_code == 200
    crop_data = crop_res.json()
    assert crop_data["crop_name"] == "Organic Turmeric"
    crop_id = crop_data["id"]

    # Search crops as buyer
    search_res = client.get("/api/crops?query=Turmeric&district=Krishna")
    assert search_res.status_code == 200
    items = search_res.json()
    assert any(c["id"] == crop_id for c in items)

def test_buyer_offer_and_crop_deal(client):
    # Create farmer and crop
    f_res = client.post("/api/auth/register", json={
        "phone": "9998887772",
        "full_name": "Farmer Rao",
        "password": "password123",
        "role": "farmer"
    })
    farmer_id = f_res.json()["user_id"]
    f_token = f_res.json()["access_token"]

    c_res = client.post("/api/crops", json={
        "crop_name": "Chilli S17",
        "quantity": 20.0,
        "unit": "Quintal",
        "expected_price_per_unit": 18000.0,
        "district": "Guntur"
    }, headers={"Authorization": f"Bearer {f_token}"})
    crop_id = c_res.json()["id"]

    # Register Buyer
    b_res = client.post("/api/auth/register", json={
        "phone": "9998887773",
        "full_name": "Apex Spices Buyer",
        "password": "password123",
        "role": "buyer"
    })
    buyer_token = b_res.json()["access_token"]
    buyer_id = b_res.json()["user_id"]

    # Send Offer
    offer_res = client.post(f"/api/crops/{crop_id}/offers", json={
        "listing_id": crop_id,
        "offered_price_per_unit": 17500.0,
        "quantity": 20.0,
        "message": "Ready for direct farm pickup"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    assert offer_res.status_code == 200
    offer_data = offer_res.json()
    assert offer_data["status"] == "Offer Sent"

    # Create Deal
    deal_res = client.post("/api/crops/deals", json={
        "listing_id": crop_id,
        "offer_id": offer_data["id"],
        "buyer_id": buyer_id,
        "agreed_price_per_unit": 17500.0,
        "agreed_quantity": 20.0
    }, headers={"Authorization": f"Bearer {f_token}"})
    assert deal_res.status_code == 200
    deal_id = deal_res.json()["id"]
    assert deal_res.json()["deal_status"] == "Accepted"

    # Update Deal status to Completed
    status_res = client.put(f"/api/crops/deals/{deal_id}/status", json={
        "deal_status": "Completed"
    }, headers={"Authorization": f"Bearer {f_token}"})
    assert status_res.status_code == 200
    assert status_res.json()["deal_status"] == "Completed"

def test_labour_job_posting_and_application(client):
    # Farmer posts job
    f_res = client.post("/api/auth/register", json={
        "phone": "9998887774",
        "full_name": "Farmer Gopal",
        "password": "password123",
        "role": "farmer",
        "district": "Guntur"
    })
    f_token = f_res.json()["access_token"]

    job_res = client.post("/api/labour/jobs", json={
        "title": "Cotton Picking Labourers Needed",
        "work_type": "Harvesting",
        "crop_type": "Cotton",
        "workers_needed": 6,
        "daily_wage": 650.0,
        "start_date": "2026-11-25",
        "duration_days": 4,
        "district": "Guntur"
    }, headers={"Authorization": f"Bearer {f_token}"})
    assert job_res.status_code == 200
    job_id = job_res.json()["id"]

    # Worker registers and applies
    w_res = client.post("/api/auth/register", json={
        "phone": "9998887775",
        "full_name": "Worker Anji",
        "password": "password123",
        "role": "labour",
        "district": "Guntur"
    })
    w_token = w_res.json()["access_token"]

    app_res = client.post(f"/api/labour/jobs/{job_id}/apply", json={
        "job_id": job_id,
        "proposed_wage": 650.0,
        "message": "Available for all 4 days with 2 coworkers"
    }, headers={"Authorization": f"Bearer {w_token}"})
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "applied"

def test_crop_doctor_and_problem_solver(client):
    # User token
    u_res = client.post("/api/auth/register", json={
        "phone": "9998887776",
        "full_name": "Farmer Reddy",
        "password": "password123",
        "role": "farmer"
    })
    token = u_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Crop Doctor request
    doc_res = client.post("/api/crop-doctor/analyze", json={
        "crop_type": "Tomato",
        "symptoms": "Lower leaves are turning pale yellow and dry",
        "language": "te"
    }, headers=headers)
    assert doc_res.status_code == 200
    doc_data = doc_res.json()
    assert "detected_disease" in doc_data
    assert "treatment_recommendations" in doc_data
    assert doc_data["is_expert_consult_recommended"] is True

    # Problem solver question
    ps_res = client.post("/api/problem-solver/ask", json={
        "question_text": "Naaku tomato pantalo aakulu pasupu rangulo maruthunnayi. Em cheyyali?",
        "topic": "Crop Health"
    }, headers=headers)
    assert ps_res.status_code == 200
    ps_data = ps_res.json()
    assert "answer_text_te" in ps_data
    assert "answer_text_en" in ps_data

def test_payment_checkout_duplicate_prevention_and_refunds(client):
    # Register Buyer
    b_res = client.post("/api/auth/register", json={
        "phone": "9998887777",
        "full_name": "Kisan Trader",
        "password": "password123",
        "role": "buyer"
    })
    b_token = b_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {b_token}"}

    # Create Order for Buyer Pro
    order_res = client.post("/api/payments/orders", json={
        "purpose": "buyer_pro",
        "amount": 199.0,
        "description": "Buyer Pro 1-Month Plan",
        "idempotency_key": "idemp-test-buyer-pro-001"
    }, headers=headers)
    assert order_res.status_code == 200
    order_id = order_res.json()["id"]

    # Idempotent retry returns same order
    order_res2 = client.post("/api/payments/orders", json={
        "purpose": "buyer_pro",
        "amount": 199.0,
        "idempotency_key": "idemp-test-buyer-pro-001"
    }, headers=headers)
    assert order_res2.status_code == 200
    assert order_res2.json()["id"] == order_id

    # Checkout
    pay_res = client.post("/api/payments/checkout", json={
        "order_id": order_id,
        "payment_method": "upi_phonepe"
    }, headers=headers)
    assert pay_res.status_code == 200
    assert pay_res.json()["success"] is True

    # Duplicate payment on already successful order is rejected
    pay_dup = client.post("/api/payments/checkout", json={
        "order_id": order_id,
        "payment_method": "upi_phonepe"
    }, headers=headers)
    assert pay_dup.status_code == 400

    # Get transaction
    txns = client.get("/api/payments/transactions", headers=headers).json()
    assert len(txns) >= 1
    txn_id = txns[0]["id"]

    # Submit Refund Request
    ref_res = client.post("/api/refunds/request", json={
        "transaction_id": txn_id,
        "amount_requested": 199.0,
        "reason": "Accidental double subscription payment",
        "explanation": "I made payment twice from phonepe and want one refund."
    }, headers=headers)
    assert ref_res.status_code == 200
    ref_id = ref_res.json()["id"]
    assert ref_res.json()["status"] == "Requested"

    # Duplicate refund request is prevented
    ref_dup = client.post("/api/refunds/request", json={
        "transaction_id": txn_id,
        "amount_requested": 199.0,
        "reason": "Double payment",
        "explanation": "Another refund request"
    }, headers=headers)
    assert ref_dup.status_code == 400

    # Admin approval and refund processing
    admin_res = client.post("/api/auth/register", json={
        "phone": "9998887779",
        "full_name": "Super Admin",
        "password": "password123",
        "role": "admin"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin approves and processes refund
    action_res = client.post(f"/api/admin/refunds/{ref_id}/action", json={
        "action": "process_refund",
        "admin_notes": "Verified transaction and processed bank refund."
    }, headers=admin_headers)
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "Refunded"

def test_admin_permissions_protection(client):
    # Non-admin user cannot access admin stats
    u_res = client.post("/api/auth/register", json={
        "phone": "9998887778",
        "full_name": "Standard Farmer",
        "password": "password123",
        "role": "farmer"
    })
    u_token = u_res.json()["access_token"]
    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {u_token}"})
    assert res.status_code == 403
