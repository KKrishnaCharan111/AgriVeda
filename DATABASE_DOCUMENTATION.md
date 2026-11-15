# AgriVeda Database Architecture & Schema Documentation

This document describes the relational database structure, entity models, constraints, and migration strategies for the **AgriVeda** platform.

- **Primary ORM:** SQLAlchemy 2.0
- **Default Database:** SQLite 3 (`backend/agriveda.db`) for zero-configuration, zero-budget local evaluation.
- **Production Target:** PostgreSQL 15+ (AWS RDS, Supabase, Neon, or Railway).

---

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o| FARMER_PROFILES : "has"
    USERS ||--o| LABOUR_PROFILES : "has"
    USERS ||--o| BUYER_PROFILES : "has"
    USERS ||--o| SHOP_PROFILES : "has"
    
    USERS ||--o{ CROP_LISTINGS : "farmer lists"
    CROP_LISTINGS ||--o{ CROP_IMAGES : "contains"
    CROP_LISTINGS ||--o{ BUYER_OFFERS : "receives"
    CROP_LISTINGS ||--o{ CROP_DEALS : "tracks"
    
    USERS ||--o{ JOB_LISTINGS : "farmer posts"
    JOB_LISTINGS ||--o{ JOB_APPLICATIONS : "labour applies"
    
    SHOP_PROFILES ||--o{ SHOP_PRODUCTS : "sells"
    SHOP_PROFILES ||--o{ EQUIPMENT_RENTALS : "rents"
    SHOP_PROFILES ||--o{ SHOP_ENQUIRIES : "receives"
    
    USERS ||--o{ PAYMENT_ORDERS : "places"
    PAYMENT_ORDERS ||--o{ PAYMENT_TRANSACTIONS : "settles"
    PAYMENT_TRANSACTIONS ||--o| REFUND_REQUESTS : "claims"
    REFUND_REQUESTS ||--o| REFUND_TRANSACTIONS : "records"
    
    USERS ||--o{ COMPLAINTS : "files"
    USERS ||--o{ ADMIN_AUDIT_LOGS : "logs admin action"
```

---

## 2. Table Specifications

### 2.1 Identity & User Profiles

#### `users`
Core user identity and authentication credentials.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Auto-increment | Internal user ID |
| `phone` | String(15) | Unique, Not Null, Indexed | Primary login identifier (10-digit Indian phone) |
| `hashed_password` | String(255) | Not Null | Direct bcrypt salted hash |
| `full_name` | String(100) | Not Null | Display name |
| `role` | Enum / String(20) | Not Null, Indexed | `farmer`, `labour`, `buyer`, `shop`, `admin` |
| `language_preference` | String(5) | Default: `'te'` | Preferred language code (`te` or `en`) |
| `is_active` | Boolean | Default: `True` | Account state |
| `is_verified` | Boolean | Default: `False` | Identity verification state |
| `created_at` | DateTime | Default: `UTC Now` | Registration timestamp |

#### `farmer_profiles`
Specialized attributes for cultivators.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK | Profile ID |
| `user_id` | Integer | FK(`users.id`), Unique | Link to parent user |
| `village` | String(100) | Indexed | Village / Gram Panchayat |
| `district` | String(100) | Indexed | District name |
| `state` | String(100) | Indexed | State (Andhra Pradesh, Telangana, etc.) |
| `total_land_acres` | Float | Nullable | Farm holding size in acres |
| `primary_crops` | String(255) | Nullable | Comma-separated list of cultivated crops |

#### `labour_profiles`
Specialized attributes for agricultural wage workers.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK | Profile ID |
| `user_id` | Integer | FK(`users.id`), Unique | Link to parent user |
| `skills` | String(255) | Not Null | Comma-separated list (e.g. `Harvesting, Sowing, Tilling`) |
| `daily_wage_rate` | Float | Nullable | Preferred daily wage (₹) |
| `availability_status` | String(20) | Default: `'Available'` | `Available`, `Busy`, `Inactive` |
| `village`, `district`, `state` | String(100) | Indexed | Labour location |

#### `buyer_profiles`
Specialized attributes for traders, millers, and institutional buyers.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK | Profile ID |
| `user_id` | Integer | FK(`users.id`), Unique | Link to parent user |
| `business_name` | String(150) | Not Null | Registered company or trade name |
| `business_type` | String(50) | Not Null | `Wholesaler`, `Miller`, `Exporter`, `Retailer` |
| `gstin` | String(15) | Nullable | Indian GST Identification Number |
| `is_pro_member` | Boolean | Default: `False` | Buyer Pro subscription status (₹199/month) |
| `pro_expiry` | DateTime | Nullable | Subscription expiration timestamp |

#### `shop_profiles`
Specialized attributes for agricultural input dealers and machinery rentals.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK | Profile ID |
| `user_id` | Integer | FK(`users.id`), Unique | Link to parent user |
| `shop_name` | String(150) | Not Null | Name of the agro store |
| `license_number` | String(100) | Nullable | Pesticide/Seed dealer license |
| `is_verified_shop` | Boolean | Default: `False` | Admin-verified physical shop badge |
| `is_featured` | Boolean | Default: `False` | Paid promotion placement status |

---

### 2.2 Marketplace & Deals

#### `crop_listings`
Harvest lots posted for sale by farmers.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK | Listing ID |
| `farmer_id` | Integer | FK(`users.id`), Not Null | Selling farmer |
| `crop_name` | String(100) | Not Null, Indexed | Name of crop (e.g. Chilli, Cotton, Paddy) |
| `category` | String(50) | Indexed | Grain, Pulses, Commercial, Vegetables, Fruits, Spices |
| `variety` | String(100) | Nullable | Specific hybrid or variety (e.g. Teja, BPT 5204) |
| `quantity` | Float | Not Null | Quantity available |
| `unit` | String(20) | Not Null | Quintal, Bag (75kg), Kg, Tonne |
| `expected_price` | Float | Not Null, Indexed | Expected unit price in INR |
| `quality_grade` | String(20) | Default: `'A-Grade'` | Quality tier |
| `moisture_percentage`| Float | Nullable | Grain moisture test result |
| `is_organic` | Boolean | Default: `False` | Chemical-free certification flag |
| `village`, `district`, `state` | String(100) | Indexed | Farm gate location |
| `status` | String(20) | Default: `'available'` | `available`, `negotiating`, `sold`, `closed` |

#### `buyer_offers`
Offers submitted by buyers for a specific crop listing.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK | Offer ID |
| `crop_id` | Integer | FK(`crop_listings.id`) | Target crop listing |
| `buyer_id` | Integer | FK(`users.id`) | Offering buyer |
| `offered_price` | Float | Not Null | Buyer's price offer per unit |
| `offered_quantity` | Float | Not Null | Desired quantity |
| `status` | String(20) | Default: `'pending'` | `pending`, `accepted`, `rejected`, `countered` |

#### `crop_deals`
End-to-end deal lifecycle state machine.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK | Deal ID |
| `crop_id` | Integer | FK(`crop_listings.id`) | Crop being transacted |
| `buyer_id` | Integer | FK(`users.id`) | Purchasing buyer |
| `farmer_id` | Integer | FK(`users.id`) | Selling farmer |
| `final_price` | Float | Not Null | Agreed price |
| `final_quantity` | Float | Not Null | Agreed quantity |
| `status` | String(20) | Indexed | `New Enquiry`, `Offer Sent`, `Negotiation`, `Accepted`, `Completed`, `Cancelled`, `Disputed` |

---

### 2.3 Payments, Subscriptions & Refunds

#### `payment_orders`
Idempotent payment order ledger.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK | Internal order ID |
| `order_number` | String(50) | Unique, Not Null, Indexed | E.g. `ORD-20261115-4B9E21` |
| `user_id` | Integer | FK(`users.id`), Not Null | Ordering customer |
| `service_type` | String(50) | Not Null | `buyer_pro`, `shop_listing`, `featured_shop` |
| `amount` | Float | Not Null | Order value in INR |
| `currency` | String(5) | Default: `'INR'` | Currency code |
| `idempotency_key` | String(100) | Unique, Indexed | Duplicate request barrier |
| `status` | String(20) | Default: `'Pending'` | `Pending`, `Processing`, `Successful`, `Failed`, `Cancelled` |

#### `payment_transactions`
Payment gateway settlement receipts.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK | Transaction ID |
| `transaction_ref` | String(50) | Unique, Not Null, Indexed | E.g. `TXN-20261115-99DFB1A2` |
| `order_id` | Integer | FK(`payment_orders.id`), Not Null | Parent order |
| `payment_method` | String(50) | Not Null | PhonePe, Google Pay, Paytm, UPI QR, Cards |
| `amount` | Float | Not Null | Captured amount |
| `status` | String(20) | Default: `'Successful'` | Settlement status |

#### `refund_requests`
Refund auditing and approval workflow.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK | Request ID |
| `refund_number` | String(50) | Unique, Not Null, Indexed | E.g. `REF-20261115-28A14E` |
| `transaction_id` | Integer | FK(`payment_transactions.id`), Unique | 1:1 refund protection |
| `user_id` | Integer | FK(`users.id`), Not Null | Requesting user |
| `amount` | Float | Not Null | Claim amount |
| `reason` | Text | Not Null | User reason |
| `status` | String(25) | Default: `'Requested'` | `Requested`, `Under Review`, `Approved`, `Refunded`, `Rejected` |
| `admin_notes` | Text | Nullable | Admin review justification |

---

## 3. Migration Guide: SQLite to PostgreSQL

To deploy AgriVeda to production on PostgreSQL:

1. **Install PostgreSQL Client Driver:**
   ```bash
   pip install psycopg2-binary
   ```

2. **Update Environment Variable:**
   In your `.env` or cloud secret manager:
   ```env
   DATABASE_URL=postgresql://agriveda_user:secure_password@postgres.host.com:5432/agriveda_db
   ```

3. **Run Automatic Schema Creation & Seeding:**
   SQLAlchemy automatically handles cross-dialect DDL (converting `Integer` to `SERIAL`, `DateTime` to `TIMESTAMP WITH TIME ZONE`).
   ```bash
   python -m app.seed.seed_data
   ```

4. **Recommended Indexes for Production Scale:**
   - `CREATE INDEX idx_crops_district_status ON crop_listings(district, status);`
   - `CREATE INDEX idx_deals_buyer_status ON crop_deals(buyer_id, status);`
   - `CREATE INDEX idx_jobs_district ON job_listings(district, status);`
   - `CREATE INDEX idx_mandi_commodity ON market_prices(commodity, district);`
