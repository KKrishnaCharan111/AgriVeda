# AgriVeda (అగ్రివేద) – Smart Agriculture Marketplace & Farmer Problem-Solving Platform

> **"One Platform. Complete Agriculture."**  
> An enterprise-grade, zero-budget agritech platform designed for Indian farmers, agricultural labourers, crop buyers, and agricultural input shops.

![AgriVeda Architecture](https://img.shields.io/badge/Architecture-FastAPI%20%2B%20React%2018%20%2B%20TypeScript-15803d?style=for-the-badge)
![Zero Budget Ready](https://img.shields.io/badge/Zero--Budget-100%25%20Local%20Operation-166534?style=for-the-badge)
![Telugu & English](https://img.shields.io/badge/Languages-Telugu%20%26%20English-amber?style=for-the-badge)
![Tests](https://img.shields.io/badge/Automated%20Tests-8%2F8%20Passed-brightgreen?style=for-the-badge)

---

## 🌟 Executive Summary

**AgriVeda** eliminates middlemen and fragmentation in Indian agriculture by providing an integrated digital ecosystem:

1. **Direct Farm-to-Buyer Marketplace:** Farmers list crops with real photos, grades, and prices; buyers send purchase offers with transparent deal status tracking (`New Enquiry` → `Offer Sent` → `Negotiation` → `Accepted` → `Completed`).
2. **Agricultural Labour Hub:** Farmers post farm work with daily wages; local wage workers discover jobs and apply.
3. **Smart Agri-Input & Machinery Rental Stores:** Local dealers showcase seeds, fertilizers, pesticides, and heavy farm equipment (tractors, combine harvesters) with admin-verified badges.
4. **Voice-First Farmer Problem Solver:** Voice-activated microphone assistant answering farming queries in **Telugu** and English with real-time text-to-speech voice playback.
5. **AI-Assisted Crop Doctor:** Upload leaf/crop photographs with symptom descriptions to identify pests/diseases, get organic and chemical treatment advice, safety warnings, and request callbacks from agricultural extension officers.
6. **Live Weather & Mandi Rates:** Real-time Open-Meteo district weather telemetry with IMD agricultural advisories, alongside verified Agmarknet market rates.
7. **Government Schemes Library:** Central & State schemes (PM-KISAN, Rythu Bharosa, PMFBY) with eligibility criteria, required documents, and verified application deep-links.
8. **Secure Payment & Refund Architecture:** Idempotent order generator, PhonePe / Google Pay / Paytm / UPI QR / Card sandbox checkout, Buyer Pro subscription (₹199/mo), Shop listing (₹99/mo), and a complete refund audit lifecycle.

---

## 🏗️ Technical Architecture

```
AgriVeda/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint & middleware
│   │   ├── config.py                # Environment configuration (zero-budget defaults)
│   │   ├── database.py              # SQLAlchemy engine & session manager
│   │   ├── models/                  # Relational DB models
│   │   │   ├── user.py              # User, FarmerProfile, LabourProfile, BuyerProfile, ShopProfile
│   │   │   ├── crop.py              # CropListing, CropImage, BuyerOffer, CropDeal
│   │   │   ├── labour.py            # JobListing, JobApplication
│   │   │   ├── shop.py              # ShopProduct, EquipmentRental, ShopEnquiry
│   │   │   ├── smart.py             # CropDoctor, Weather, MarketPrices, Schemes, FarmingReminders
│   │   │   ├── payment.py           # Orders, Transactions, Subscriptions, Refunds, Commissions
│   │   │   └── feedback.py          # Complaints, AdminAuditLogs, Notifications
│   │   ├── routers/                 # Modular REST API endpoints
│   │   ├── services/                # Business logic & agronomy engines
│   │   │   ├── auth_service.py      # Direct bcrypt hashing + JWT + RBAC guard
│   │   │   ├── crop_doctor_service.py # Indian crops disease knowledge engine
│   │   │   ├── weather_service.py   # Open-Meteo live API + IMD advisories
│   │   │   ├── problem_solver_service.py # Voice/text agro query solver
│   │   │   └── payment_service.py   # Idempotent payments, UPI sandbox, refunds
│   │   └── seed/                    # Comprehensive realistic Indian farm data seed
│   ├── tests/                       # Automated pytest test suites (8 suites, 100% pass)
│   └── agriveda.db                  # Local SQLite database (pre-seeded)
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI components & modals
│   │   │   ├── Navbar.tsx           # Bilingual navigation + notifications + role indicator
│   │   │   ├── Footer.tsx           # Quick links & disclaimers
│   │   │   ├── VoiceMicButton.tsx   # Web Speech API recognition & speech synthesis
│   │   │   ├── WeatherWidget.tsx    # Compact telemetry widget
│   │   │   ├── AuthModal.tsx        # Login & Registration modal with 1-click test pills
│   │   │   ├── CropDetailsModal.tsx # Crop view, farmer contact & buyer offer modal
│   │   │   ├── SellCropModal.tsx    # Crop listing form
│   │   │   └── PaymentCheckoutModal.tsx # PhonePe, GPay, Paytm, UPI QR checkout
│   │   ├── context/                 # AuthContext & LanguageContext (Telugu/English)
│   │   ├── pages/                   # All 18 application views & 5 role dashboards
│   │   ├── services/api.ts          # Typed API client with token management
│   │   ├── types/index.ts           # Clean TypeScript interfaces
│   │   ├── i18n/translations.ts     # Complete Telugu/English translation matrix
│   │   └── index.css                # Custom green-and-white responsive CSS design system
│   ├── vite.config.ts               # Proxy configuration to backend
│   └── package.json                 # React 18, TypeScript, Lucide Icons
│
├── API_DOCUMENTATION.md             # Complete REST API specification
├── DATABASE_DOCUMENTATION.md        # Relational schema, ERD, and PostgreSQL migration guide
└── .env.example                     # Environment variables template
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** (Node.js 20 recommended)

---

### Step 1: Start the Backend Server

```bash
# Navigate to the backend directory
cd backend

# On Windows:
.\venv\Scripts\activate
# (Or create a new venv: python -m venv venv && .\venv\Scripts\activate)

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Run the backend server with auto-reload
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend Health Check:** `http://127.0.0.1:8000/api/health`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

---

### Step 2: Start the Frontend Application

```bash
# In a separate terminal, navigate to the frontend directory
cd frontend

# Run the development server
npm run dev
```

- **Frontend Application URL:** `http://localhost:5173`

---

## 🔑 Pre-Configured Test Accounts

The platform is pre-loaded with realistic sample data and ready-to-test role accounts. You can type the credentials manually or click the **1-Click Test Login Pills** directly inside the Login modal:

| Role | Name / Organization | Phone Number | Password | Capabilities |
|---|---|---|---|---|
| **Farmer** | Ramesh Reddy (Gannavaram) | `9123456780` | `farmer123` | Sell crops, post farm jobs, view offers, Crop Doctor, Voice assistant |
| **Labour** | Suresh Kumar (Tenali) | `9123456781` | `labour123` | View farm jobs, daily wages, apply for harvest/irrigation jobs |
| **Buyer** | Venkatesh Traders (Guntur) | `9123456782` | `buyer123` | Search crops, send offers, negotiate prices, Buyer Pro subscription |
| **Shop** | Sri Lakshmi Seeds & Agro | `9123456783` | `shop123` | List fertilizers/seeds, tractor rentals, handle customer enquiries |
| **Admin** | AgriVeda Administrator | `9876543210` | `admin123` | Platform analytics, verify shops, approve/reject refunds, resolve complaints |

---

## 💡 Zero-Budget Mode Explanation

AgriVeda was engineered to run out-of-the-box with **zero external subscription costs**:

1. **Weather Telemetry:** Uses the free, open **Open-Meteo** API without requiring API keys or credit card registration.
2. **Crop Doctor & Disease Diagnostics:** Built with an internal agronomy rule engine covering major Indian crops (Chilli leaf curl, Tomato early/late blight, Cotton bollworm, Paddy blast, Sugarcane red rot). It optionally connects to Google Gemini API when `GEMINI_API_KEY` is provided, but operates smoothly without it.
3. **Voice Recognition & Audio Synthesis:** Built with the browser's native **Web Speech API** (`webkitSpeechRecognition` & `speechSynthesis`), enabling instant voice input and audio answers in Telugu and English without paying for cloud STT/TTS APIs.
4. **Payment Gateway Sandbox:** Built-in UPI and card simulator simulating the exact workflow of PhonePe, Google Pay, Paytm, and Razorpay with order creation, signature verification, and refund auditing.

---

## 🧪 Automated Testing

AgriVeda includes an automated test suite verifying every critical business pathway:

```bash
cd backend
$env:PYTHONPATH="."
python -m pytest -v tests/
```

### Verified Test Cases:
1. `test_health_check`: API heartbeat and database connection.
2. `test_user_registration_and_login`: Direct bcrypt password verification and JWT token generation.
3. `test_crop_listing_and_buyer_search`: Multi-parameter crop filtering by district and organic status.
4. `test_buyer_offer_and_crop_deal`: End-to-end deal lifecycle state machine.
5. `test_labour_job_posting_and_application`: Farm labour job posting and application workflow.
6. `test_crop_doctor_and_problem_solver`: Agronomy disease diagnosis and voice problem solver responses.
7. `test_payment_checkout_duplicate_prevention_and_refunds`: Idempotency key protection and refund approval state changes.
8. `test_admin_permissions_protection`: RBAC guard ensuring unauthorized users cannot access admin endpoints.

---

## 📱 Mobile App Packaging (Capacitor / Android)

AgriVeda is built mobile-first and can be packaged into an Android APK using Capacitor:

```bash
cd frontend

# Install Capacitor CLI & Android platform
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
npx cap init AgriVeda com.agriveda.app --web-dir dist

# Build the production bundle
npm run build

# Add Android project
npx cap add android

# Open in Android Studio
npx cap open android
```

---

## 🛡️ Security & Compliance

- **No Stored Banking Credentials:** AgriVeda never collects or stores UPI PINs, CVVs, or bank passwords.
- **Idempotency Protection:** Double-clicks on payment buttons reuse the same order number, preventing accidental duplicate debits.
- **Role-Based Access Control (RBAC):** Admin endpoints are protected server-side with token claims verification.
- **Disclaimers:** Clearly informs farmers that AgriVeda is an independent platform and does not guarantee government scheme disbursements.

---

## 📄 License
This project is licensed under the MIT License - feel free to use and expand for Indian agriculture technology development.
