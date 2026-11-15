# AgriVeda REST API Documentation

This document describes all REST API endpoints provided by the **AgriVeda** backend platform.

- **Base URL:** `http://127.0.0.1:8000/api`
- **Interactive OpenAPI Docs:** `http://127.0.0.1:8000/docs`
- **Alternative ReDoc:** `http://127.0.0.1:8000/redoc`

---

## 1. Authentication & Security

All protected endpoints require a JWT Bearer token in the `Authorization` header:
```http
Authorization: Bearer <jwt_access_token>
```

Tokens are valid for 24 hours (`1440` minutes) and encode user ID, phone number, and primary role.

### 1.1 Register New User
- **POST** `/api/auth/register`
- **Request Body:**
  ```json
  {
    "phone": "9123456789",
    "password": "securepassword123",
    "full_name": "Ramesh Reddy",
    "role": "farmer",
    "village": "Choutuppal",
    "district": "Yadadri Bhuvanagiri",
    "state": "Telangana",
    "language_preference": "te",
    "skills": ["Harvesting", "Spraying"],
    "business_name": "Reddy Agro",
    "business_type": "Retail"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "phone": "9123456789",
    "full_name": "Ramesh Reddy",
    "role": "farmer",
    "language_preference": "te",
    "is_active": true,
    "is_verified": false
  }
  ```

### 1.2 User Login
- **POST** `/api/auth/login`
- **Request Body:**
  ```json
  {
    "phone": "9123456780",
    "password": "farmer123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": {
      "id": 2,
      "phone": "9123456780",
      "full_name": "Ramesh Reddy",
      "role": "farmer",
      "language_preference": "te",
      "farmer_profile": {
        "id": 1,
        "village": "Gannavaram",
        "district": "Krishna",
        "state": "Andhra Pradesh"
      }
    }
  }
  ```

### 1.3 Get Current User Profile
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Full profile with role-specific details.

---

## 2. Crop Marketplace (`/api/crops`)

### 2.1 List / Search Crops
- **GET** `/api/crops?search=Chilli&district=Guntur&state=Andhra+Pradesh&category=Spices&is_organic=true&page=1&limit=20`
- **Query Params:**
  - `search` (string): Search query in crop name or variety
  - `district` (string): Mandi / district filter
  - `state` (string): State filter
  - `category` (string): Grain, Pulses, Commercial, Vegetables, Fruits, Spices
  - `is_organic` (boolean): Organic farming filter
  - `min_price` / `max_price` (numeric)
- **Response (200 OK):**
  ```json
  {
    "items": [
      {
        "id": 1,
        "crop_name": "Guntur Teja Red Chilli",
        "category": "Spices",
        "variety": "Teja Hot",
        "quantity": 50.0,
        "unit": "Quintal",
        "expected_price": 18500.0,
        "is_organic": true,
        "village": "Tenali",
        "district": "Guntur",
        "state": "Andhra Pradesh",
        "status": "available",
        "farmer_name": "Ramesh Reddy",
        "farmer_phone": "9123456780",
        "images": []
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
  ```

### 2.2 Create Crop Listing (Farmers only)
- **POST** `/api/crops`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "crop_name": "Sona Masoori Paddy",
    "category": "Grain",
    "variety": "BPT 5204",
    "quantity": 120.0,
    "unit": "Bags (75kg)",
    "expected_price": 2200.0,
    "quality_grade": "A-Grade",
    "moisture_percentage": 13.5,
    "is_organic": false,
    "harvest_date": "2026-10-25",
    "village": "Gannavaram",
    "district": "Krishna",
    "state": "Andhra Pradesh",
    "images": []
  }
  ```

### 2.3 Send Buyer Purchase Offer
- **POST** `/api/crops/{crop_id}/offers`
- **Headers:** `Authorization: Bearer <token>` (Buyer role)
- **Request Body:**
  ```json
  {
    "offered_price": 2150.0,
    "offered_quantity": 100.0,
    "message": "Can lift stock directly from your farm gate this week."
  }
  ```

### 2.4 Update Deal Status / Negotiate
- **PUT** `/api/crops/deals/{deal_id}/status`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "status": "Accepted", // "New Enquiry", "Offer Sent", "Negotiation", "Accepted", "Completed", "Cancelled", "Disputed"
    "notes": "Price agreed at ₹2,150. Delivery scheduled for Friday."
  }
  ```

---

## 3. Agricultural Labour Hub (`/api/labour`)

### 3.1 List Open Farm Jobs
- **GET** `/api/labour/jobs?district=Krishna&work_type=Harvesting`
- **Response (200 OK):** Array of job listings with daily wages, workers required, dates, and farmer contacts.

### 3.2 Post Farm Job Requirement (Farmers only)
- **POST** `/api/labour/jobs`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "title": "Need 6 Workers for Chilli Picking",
    "work_type": "Harvesting",
    "description": "Daily harvest picking in Tenali farm. Tea and snacks provided.",
    "workers_needed": 6,
    "daily_wage": 450.0,
    "start_date": "2026-11-20",
    "end_date": "2026-11-24",
    "village": "Tenali",
    "district": "Guntur",
    "state": "Andhra Pradesh"
  }
  ```

### 3.3 Apply for Job (Labourers only)
- **POST** `/api/labour/jobs/{job_id}/apply`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "message": "Experienced in chilli harvesting, group of 4 available."
  }
  ```

---

## 4. Agricultural Shops & Equipment Rentals (`/api/shops`)

### 4.1 Search Shop Catalog & Equipment
- **GET** `/api/shops/products?category=Fertilizers&district=Guntur`
- **GET** `/api/shops/rentals?district=Guntur` (e.g. 50HP John Deere Tractor, Paddy Harvester)

### 4.2 Submit Shop Customer Enquiry
- **POST** `/api/shops/{shop_id}/enquiries`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "message": "Do you have stock of Neem coated Urea 45kg bags?"
  }
  ```

---

## 5. Smart Features

### 5.1 Crop Doctor AI (`/api/crop-doctor`)
- **POST** `/api/crop-doctor/diagnose`
- **Headers:** `Authorization: Bearer <token>`
- **Request (Multipart Form Data):**
  - `image`: Image file (JPG/PNG/WEBP, max 10MB)
  - `crop_name`: "Chilli"
  - `symptoms`: "Leaves are curling upwards, stunted growth with yellowing margins"
  - `preferred_language`: "te"
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "crop_name": "Chilli",
    "possible_diseases": ["Chilli Leaf Curl Virus (Gemini Virus) & Thrips"],
    "confidence_score": 0.88,
    "severity": "Moderate to High",
    "organic_treatment": "Spray neem oil 10,000 ppm @ 3ml/L; install blue/yellow sticky traps.",
    "chemical_treatment": "Fipronil 5% SC @ 2ml/L or Diafenthiuron 50% WP @ 1.25g/L.",
    "prevention_guidance": "Control whitefly and thrips vectors early in the nursery stage.",
    "safety_warnings": "Do not spray in bright afternoon sunlight. Wear gloves and mask. Avoid harvesting within 7 days of chemical spray.",
    "recommended_expert": "Consult your local Mandal Agricultural Officer (MAO) or KVK scientist if infestation exceeds 20% of field."
  }
  ```

### 5.2 Request Expert Callback
- **POST** `/api/crop-doctor/expert-contact`
- **Request Body:**
  ```json
  {
    "farmer_name": "Ramesh Reddy",
    "phone": "9123456780",
    "district": "Guntur",
    "issue_summary": "Leaf curl virus spreading to adjacent acre.",
    "crop_doctor_request_id": 1
  }
  ```

### 5.3 Weather Telemetry & Advisory (`/api/weather`)
- **GET** `/api/weather?district=Guntur&state=Andhra+Pradesh`
- **Response (200 OK):**
  ```json
  {
    "district": "Guntur",
    "state": "Andhra Pradesh",
    "latitude": 16.3067,
    "longitude": 80.4365,
    "temperature": 31.5,
    "humidity": 68.0,
    "wind_speed": 14.2,
    "rainfall": 0.0,
    "rain_forecast": "Dry weather expected for the next 48 hours.",
    "weather_condition": "Partly Cloudy",
    "weather_warnings": "Moderate wind gusts expected during late evening.",
    "agricultural_advisory": "Ideal window for harvesting chilli and drying on threshing floors. Postpone nitrogen top-dressing.",
    "data_source": "Open-Meteo & IMD Agromet Advisory",
    "last_updated": "2026-11-15T10:00:00Z"
  }
  ```

### 5.4 Verified Market Prices (`/api/market-prices`)
- **GET** `/api/market-prices?commodity=Chilli&district=Guntur`
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "commodity": "Chilli (Dry Red)",
      "variety": "Guntur Teja",
      "market_name": "Guntur Mandi (Asia's Largest Chilli Market)",
      "district": "Guntur",
      "state": "Andhra Pradesh",
      "min_price": 16500.0,
      "max_price": 20200.0,
      "modal_price": 18400.0,
      "unit": "Quintal",
      "reported_date": "2026-11-15",
      "data_source": "Agmarknet / AP Marketing Dept"
    }
  ]
  ```

### 5.5 Government Agriculture Schemes (`/api/schemes`)
- **GET** `/api/schemes?state=Telangana&category=Subsidy`
- **Response (200 OK):** Schemes with full eligibility, benefits, required documents, application process, and official portal URL (e.g. PM-KISAN, Rythu Bharosa, PM Fasal Bima Yojana).

### 5.6 Farmer Problem Solver (Bilingual Voice/Text) (`/api/problem-solver`)
- **POST** `/api/problem-solver/ask`
- **Request Body:**
  ```json
  {
    "query_text": "Tomato pantalo aakulu pasupu rangulo maruthunnayi em cheyyali?",
    "input_language": "te",
    "category": "disease"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "query_text": "Tomato pantalo aakulu pasupu rangulo maruthunnayi em cheyyali?",
    "detected_language": "te",
    "answer_te": "టొమాటోలో ఆకులు పసుపు రంగులోకి మారడం నైట్రోజన్ లోపం లేదా ఎల్లో లీఫ్ కర్ల్ వైరస్ వల్ల కావచ్చు...",
    "answer_en": "Yellowing leaves in tomato typically indicate nitrogen deficiency or yellow leaf curl virus...",
    "suggested_actions": [
      "యూరియా లేదా 19-19-19 ఎరువును పిచికారీ చేయండి",
      "తెల్లదోమ నివారణకు వేప నూనెను వాడండి"
    ],
    "relevant_crops": ["Tomato"],
    "created_at": "2026-11-15T10:15:00Z"
  }
  ```

---

## 6. Payment System & Refunds (`/api/payments`, `/api/refunds`)

### 6.1 Create Idempotent Payment Order
- **POST** `/api/payments/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "service_type": "buyer_pro", // "buyer_pro", "shop_listing", "featured_shop"
    "amount": 199.0,
    "currency": "INR",
    "idempotency_key": "user2_buyerpro_20261115",
    "notes": "Monthly Buyer Pro Subscription"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 101,
    "order_number": "ORD-20261115-4B9E21",
    "amount": 199.0,
    "currency": "INR",
    "status": "Pending",
    "created_at": "2026-11-15T10:20:00Z"
  }
  ```

### 6.2 Process Checkout (Sandbox Simulator / Gateway Verify)
- **POST** `/api/payments/checkout`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "order_number": "ORD-20261115-4B9E21",
    "payment_method": "PhonePe", // "PhonePe", "Google Pay", "Paytm", "UPI ID", "UPI QR", "Debit Card", "Credit Card", "Net Banking"
    "simulate_failure": false
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "transaction_id": "TXN-20261115-99DFB1A2",
    "order_number": "ORD-20261115-4B9E21",
    "amount": 199.0,
    "payment_method": "PhonePe",
    "status": "Successful",
    "message": "Payment verified successfully. Subscription activated.",
    "created_at": "2026-11-15T10:20:05Z"
  }
  ```

### 6.3 Submit Refund Request
- **POST** `/api/refunds/request`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "transaction_ref": "TXN-20261115-99DFB1A2",
    "reason": "Accidental double subscription purchase."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "refund_number": "REF-20261115-28A14E",
    "transaction_ref": "TXN-20261115-99DFB1A2",
    "amount": 199.0,
    "status": "Requested",
    "reason": "Accidental double subscription purchase."
  }
  ```

---

## 7. Protected Administrator Endpoints (`/api/admin`)

*All admin endpoints require an active user account with role `admin`.*

### 7.1 Platform Analytics & Stats
- **GET** `/api/admin/stats`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:**
  ```json
  {
    "total_users": 15,
    "users_by_role": { "farmer": 8, "labour": 3, "buyer": 2, "shop": 1, "admin": 1 },
    "total_crops_listed": 12,
    "total_deals": 5,
    "deals_by_status": { "Accepted": 3, "New Enquiry": 2 },
    "total_jobs": 4,
    "total_revenue": 347.0,
    "total_commission": 3.47,
    "pending_refunds": 1,
    "open_complaints": 2
  }
  ```

### 7.2 Review and Approve/Reject Refund
- **POST** `/api/admin/refunds/{refund_id}/action`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
  ```json
  {
    "action": "approve", // or "reject"
    "admin_notes": "Verified duplicate payment. Refund approved."
  }
  ```

### 7.3 Grievance Resolution & Shop Verification
- **POST** `/api/admin/complaints/{complaint_id}/resolve`
- **POST** `/api/admin/shops/{shop_id}/verify` (toggle verified badge)
