from sqlalchemy.orm import Session
from datetime import datetime
from app.database import SessionLocal, engine, Base
from app.models import (
    User, FarmerProfile, LabourProfile, BuyerProfile, ShopProfile,
    CropListing, CropImage, JobListing, ShopProduct, EquipmentRental,
    MarketPrice, GovernmentScheme
)
from app.services.auth_service import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    # Check if already seeded
    if db.query(User).filter(User.phone == "9876543210").first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding AgriVeda database with initial demo data...")

    # 1. Users & Profiles
    admin_user = User(
        phone="9876543210",
        email="admin@agriveda.in",
        full_name="AgriVeda Administrator",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        preferred_language="en",
        state="Andhra Pradesh",
        district="Guntur",
        village="Headquarters",
        is_active=True,
        is_verified=True
    )
    db.add(admin_user)

    farmer_user = User(
        phone="9123456780",
        email="ramesh.farmer@agriveda.in",
        full_name="Ramesh Reddy",
        hashed_password=get_password_hash("farmer123"),
        role="farmer",
        preferred_language="te",
        state="Andhra Pradesh",
        district="Guntur",
        village="Tenali",
        is_active=True,
        is_verified=True
    )
    db.add(farmer_user)
    db.flush()
    db.add(FarmerProfile(
        user_id=farmer_user.id,
        farm_size_acres=5.5,
        primary_crops="Paddy, Chilli, Cotton",
        irrigation_type="Canal & Borewell",
        experience_years=12
    ))

    labour_user = User(
        phone="9123456781",
        email="suresh.labour@agriveda.in",
        full_name="Suresh Kumar",
        hashed_password=get_password_hash("labour123"),
        role="labour",
        preferred_language="te",
        state="Andhra Pradesh",
        district="Guntur",
        village="Chebrolu",
        is_active=True,
        is_verified=True
    )
    db.add(labour_user)
    db.flush()
    db.add(LabourProfile(
        user_id=labour_user.id,
        skills="Harvesting, Planting, Tractor Driving, Spraying",
        daily_wage_expected=650.0,
        availability_status="available",
        work_radius_km=20,
        experience_years=6
    ))

    buyer_user = User(
        phone="9123456782",
        email="venkatesh.buyer@agriveda.in",
        full_name="Venkatesh Traders",
        hashed_password=get_password_hash("buyer123"),
        role="buyer",
        preferred_language="en",
        state="Andhra Pradesh",
        district="Guntur",
        village="Guntur Yard",
        is_active=True,
        is_verified=True
    )
    db.add(buyer_user)
    db.flush()
    db.add(BuyerProfile(
        user_id=buyer_user.id,
        company_name="Kisan Agro Exports Pvt Ltd",
        business_type="Wholesaler & Exporter",
        gst_number="37AAACK1234F1Z8",
        is_pro=True
    ))

    shop_user = User(
        phone="9123456783",
        email="lakshmi.shop@agriveda.in",
        full_name="K. Satyanarayana",
        hashed_password=get_password_hash("shop123"),
        role="shop",
        preferred_language="te",
        state="Andhra Pradesh",
        district="Guntur",
        village="Mangalagiri",
        is_active=True,
        is_verified=True
    )
    db.add(shop_user)
    db.flush()
    db.add(ShopProfile(
        user_id=shop_user.id,
        shop_name="Sri Lakshmi Seeds & Fertilizers",
        owner_name="K. Satyanarayana",
        license_number="GTR/FERT/2022/889",
        address="Opp. Market Yard, Mangalagiri, Guntur, AP",
        is_verified=True,
        is_featured=True,
        delivery_available=True
    ))

    db.commit()

    # 2. Crop Listings
    crops = [
        CropListing(
            farmer_id=farmer_user.id,
            crop_name="Red Chilli",
            crop_name_te="ఎర్ర మిరపకాయలు (తేజ రకం)",
            variety="Teja Special S17",
            category="Spices",
            quantity=80.0,
            unit="Quintal",
            expected_price_per_unit=19500.0,
            quality_grade="Premium Grade A",
            organic_certified=False,
            description="Sun-dried, high pungency Guntur Teja red chillies. Moisture level below 10%.",
            harvest_date="2026-10",
            village="Tenali",
            district="Guntur",
            state="Andhra Pradesh",
            pin_code="522201",
            status="available"
        ),
        CropListing(
            farmer_id=farmer_user.id,
            crop_name="Paddy",
            crop_name_te="వరి ధాన్యం (బీపీటీ 5204)",
            variety="BPT 5204 (Samba Mahsuri)",
            category="Cereals",
            quantity=150.0,
            unit="Quintal",
            expected_price_per_unit=2450.0,
            quality_grade="Grade A",
            organic_certified=False,
            description="Fine grain, premium aged paddy with zero discoloration. Stored in dry godown.",
            harvest_date="2026-10",
            village="Tenali",
            district="Guntur",
            state="Andhra Pradesh",
            pin_code="522201",
            status="available"
        ),
        CropListing(
            farmer_id=farmer_user.id,
            crop_name="Cotton",
            crop_name_te="పత్తి (మంచి నాణ్యత)",
            variety="Bt Cotton RCH 659",
            category="Commercial",
            quantity=60.0,
            unit="Quintal",
            expected_price_per_unit=7200.0,
            quality_grade="Grade A",
            organic_certified=False,
            description="First picking raw white cotton, staple length 30mm, low trash content.",
            harvest_date="2026-11",
            village="Tenali",
            district="Guntur",
            state="Andhra Pradesh",
            pin_code="522201",
            status="available"
        ),
        CropListing(
            farmer_id=farmer_user.id,
            crop_name="Tomato",
            crop_name_te="టమాటా",
            variety="Hybrid S-101",
            category="Vegetables",
            quantity=40.0,
            unit="Quintal",
            expected_price_per_unit=1800.0,
            quality_grade="Standard",
            organic_certified=True,
            description="Firm, red ripe tomatoes suitable for long distance transport.",
            harvest_date="2026-11",
            village="Tenali",
            district="Guntur",
            state="Andhra Pradesh",
            pin_code="522201",
            status="available"
        )
    ]
    for c in crops:
        db.add(c)
    db.commit()

    # 3. Farm Jobs
    jobs = [
        JobListing(
            farmer_id=farmer_user.id,
            title="Chilli Harvest & Drying Labourers",
            title_te="మిర్చి కోత మరియు ఎండబెట్టే కూలీలు కావాలి",
            crop_type="Chilli",
            work_type="Harvesting",
            workers_needed=8,
            daily_wage=650.0,
            start_date="2026-11-20",
            duration_days=5,
            village="Tenali",
            district="Guntur",
            state="Andhra Pradesh",
            description="Need experienced farm workers for picking ripe red chillies and sun-drying. Lunch and tea provided.",
            contact_phone="9123456780",
            status="open"
        ),
        JobListing(
            farmer_id=farmer_user.id,
            title="Paddy Field Weeding & Bund Trimming",
            title_te="వరి పొలంలో కలుపు తీత మరియు గట్ల మరమ్మత్తు",
            crop_type="Paddy",
            work_type="Weeding",
            workers_needed=4,
            daily_wage=600.0,
            start_date="2026-11-22",
            duration_days=3,
            village="Tenali",
            district="Guntur",
            state="Andhra Pradesh",
            description="Hand weeding in paddy field and cleaning drainage channels.",
            contact_phone="9123456780",
            status="open"
        )
    ]
    for j in jobs:
        db.add(j)
    db.commit()

    # 4. Shop Products & Equipment Rentals
    products = [
        ShopProduct(
            shop_id=shop_user.id,
            name="Certified BPT 5204 Paddy Seeds",
            name_te="సర్టిఫైడ్ బీపీటీ 5204 వరి విత్తనాలు",
            category="Seeds",
            brand="Andhra Seeds Corp",
            price=980.0,
            unit="Bag (25kg)",
            stock_quantity=120,
            is_available=True,
            description="Certified breeder-tested Samba Mahsuri seed bag with 98% germination guarantee."
        ),
        ShopProduct(
            shop_id=shop_user.id,
            name="Organic Neem Cake Bio-Fertilizer",
            name_te="సేంద్రీయ వేప పిండి ఎరువు",
            category="Fertilizers",
            brand="AgriBio Organics",
            price=650.0,
            unit="Bag (50kg)",
            stock_quantity=80,
            is_available=True,
            description="Natural nitrogen enrichment that prevents subterranean nematodes and improves soil humus."
        ),
        ShopProduct(
            shop_id=shop_user.id,
            name="16-Liter 12V Battery Sprayer",
            name_te="16 లీటర్ల బ్యాటరీ స్ప్రేయర్",
            category="Farming Tools",
            brand="KisanShakti",
            price=2499.0,
            unit="Piece",
            stock_quantity=25,
            is_available=True,
            description="Dual nozzle rechargeable lithium battery pump with 6 hours continuous spraying."
        )
    ]
    for p in products:
        db.add(p)

    rentals = [
        EquipmentRental(
            shop_id=shop_user.id,
            equipment_name="Mahindra 575 DI Tractor with Rotavator",
            equipment_name_te="మహీంద్రా 575 DI ట్రాక్టర్ రోటవేటర్‌తో సహా",
            category="Tractor",
            daily_rate=2200.0,
            hourly_rate=450.0,
            deposit_amount=1000.0,
            driver_included=True,
            condition="Excellent",
            is_available=True,
            description="45 HP diesel tractor available for field tilling, puddling, and transport across Guntur district."
        ),
        EquipmentRental(
            shop_id=shop_user.id,
            equipment_name="Paddy Combine Harvester (Track Type)",
            equipment_name_te="వరి కంబైన్డ్ హార్వెస్టర్ (ట్రాక్ టైప్)",
            category="Harvester",
            daily_rate=6500.0,
            hourly_rate=1400.0,
            deposit_amount=2000.0,
            driver_included=True,
            condition="Good",
            is_available=True,
            description="High efficiency crawler harvester capable of operating in marshy/wet fields."
        )
    ]
    for r in rentals:
        db.add(r)
    db.commit()

    # 5. Market Prices (Verified Mandi Prices)
    mandi_prices = [
        MarketPrice(
            state="Andhra Pradesh",
            district="Guntur",
            market_name="Guntur Chilli Yard",
            crop_name="Red Chilli",
            crop_name_te="ఎర్ర మిరప",
            variety="Teja",
            min_price=17500.0,
            max_price=21000.0,
            modal_price=19600.0,
            unit="Quintal",
            arrival_date="2026-11-14",
            data_source="Agmarknet - AP Agricultural Marketing Dept",
            is_verified=True
        ),
        MarketPrice(
            state="Andhra Pradesh",
            district="Guntur",
            market_name="Tenali AMC",
            crop_name="Paddy",
            crop_name_te="వరి",
            variety="Common",
            min_price=2300.0,
            max_price=2500.0,
            modal_price=2420.0,
            unit="Quintal",
            arrival_date="2026-11-14",
            data_source="Agmarknet - AP Agricultural Marketing Dept",
            is_verified=True
        ),
        MarketPrice(
            state="Andhra Pradesh",
            district="Krishna",
            market_name="Vijayawada Sub-Yard",
            crop_name="Tomato",
            crop_name_te="టమాటా",
            variety="Hybrid",
            min_price=1400.0,
            max_price=2000.0,
            modal_price=1750.0,
            unit="Quintal",
            arrival_date="2026-11-14",
            data_source="Agmarknet - AP Agricultural Marketing Dept",
            is_verified=True
        ),
        MarketPrice(
            state="Andhra Pradesh",
            district="Kurnool",
            market_name="Adoni Mandi",
            crop_name="Cotton",
            crop_name_te="పత్తి",
            variety="Medium Staple",
            min_price=6800.0,
            max_price=7450.0,
            modal_price=7180.0,
            unit="Quintal",
            arrival_date="2026-11-14",
            data_source="Agmarknet - AP Agricultural Marketing Dept",
            is_verified=True
        ),
        MarketPrice(
            state="Telangana",
            district="Warangal",
            market_name="Warangal Enugula Mandi",
            crop_name="Turmeric",
            crop_name_te="పసుపు",
            variety="Finger",
            min_price=13500.0,
            max_price=16200.0,
            modal_price=14800.0,
            unit="Quintal",
            arrival_date="2026-11-14",
            data_source="Telangana Agricultural Marketing Board",
            is_verified=True
        )
    ]
    for mp in mandi_prices:
        db.add(mp)
    db.commit()

    # 6. Government Schemes
    schemes = [
        GovernmentScheme(
            name_en="Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
            name_te="ప్రధానమంత్రి కిసాన్ సమ్మాన్ నిధి (PM-KISAN)",
            category="Central",
            target_states="All India",
            description_en="Central sector scheme providing income support of ₹6,000 per year in three equal installments to eligible landholding farmer families.",
            description_te="అర్హత కలిగిన భూమి ఉన్న రైతు కుటుంబాలకు సంవత్సరానికి ₹6,000 ఆర్థిక సహాయాన్ని మూడు సమాన వాయిదాలలో నేరుగా బ్యాంక్ ఖాతాల్లో జమ చేసే కేంద్ర పథకం.",
            benefits_en="₹6,000 per year directly transferred to bank account via DBT in 3 installments of ₹2,000 each every 4 months.",
            benefits_te="సంవత్సరానికి ₹6,000 మూడు విడతల్లో (విడతకు ₹2,000) ప్రతి 4 నెలలకు నేరుగా బ్యాంక్ ఖాతాలో జమ అవుతాయి.",
            eligibility_conditions_en="All landholder farmer families having cultivable land in their names. Institutional landholders and high income taxpayers excluded.",
            eligibility_conditions_te="సాగు భూమి పట్టా కలిగిన రైతు కుటుంబాలు. రాజ్యాంగ పదవులు కలిగినవారు, ఆదాయపు పన్ను చెల్లించేవారు అనర్హులు.",
            required_documents_en="Aadhaar Card, Land ownership document (Pattadar Passbook / 1B), Active Bank Passbook linked to Aadhaar.",
            required_documents_te="ఆధార్ కార్డు, పట్టాదార్ పాసుపుస్తకం (1B), ఆధార్‌తో లింక్ అయిన బ్యాంక్ ఖాతా వివరాలు.",
            application_procedure_en="Apply online on PM-KISAN portal (pmkisan.gov.in), nearest CSC centre, or village revenue officer.",
            application_procedure_te="pmkisan.gov.in పోర్టల్ ద్వారా లేదా సమీప సిఎస్‌సి కేంద్రం / గ్రామ సచివాలయంలో దరఖాస్తు చేసుకోవచ్చు.",
            official_portal_url="https://pmkisan.gov.in",
            last_verified_date="2026-10-20"
        ),
        GovernmentScheme(
            name_en="YSR Rythu Bharosa / PM-KISAN (AP)",
            name_te="వైఎస్ఆర్ రైతు భరోసా (ఆంధ్రప్రదేశ్)",
            category="State (AP)",
            target_states="Andhra Pradesh",
            description_en="Andhra Pradesh state scheme combining state assistance with PM-KISAN to provide ₹13,500 financial assistance per year to farmers, including tenant farmers.",
            description_te="ఆంధ్రప్రదేశ్ రైతులు మరియు కౌలు రైతులకు సాగు ఖర్చుల కోసం సంవత్సరానికి మొత్తం ₹13,500 అందించే సమగ్ర పథకం.",
            benefits_en="₹13,500 per year per farmer family provided before Kharif, Rabi, and Sankranti harvest periods.",
            benefits_te="రైతు కుటుంబానికి ఏడాదికి ₹13,500 పెట్టుబడి సాయం ఖరీఫ్, రబీ మరియు సంక్రాంతి సమయంలో అందుతుంది.",
            eligibility_conditions_en="Resident farmers of AP holding agricultural land, registered tenant farmers (CCRC holders), SC/ST/BC/Minority tenant cultivators.",
            eligibility_conditions_te="ఆంధ్రప్రదేశ్ నివాసితులై సాగు భూమి గల రైతులు మరియు గుర్తింపు పొందిన కౌలు రైతులు (CCRC కార్డుదారులు).",
            required_documents_en="Aadhaar Card, Pattadar Passbook, CCRC Card (for tenant farmers), Ration Card, Bank Account.",
            required_documents_te="ఆధార్ కార్డు, పట్టాదారు పాసుపుస్తకం, కౌలు రైతులకు CCRC కార్డు, రేషన్ కార్డు, బ్యాంక్ ఖాతా.",
            application_procedure_en="Registration through Grama Sachivalayam / Rythu Bharosa Kendram (RBK) in each village.",
            application_procedure_te="గ్రామ సచివాలయం లేదా రైతు భరోసా కేంద్రం (RBK) ద్వారా నమోదు చేసుకోవాలి.",
            official_portal_url="https://ysrrythubharosa.ap.gov.in",
            last_verified_date="2026-10-20"
        ),
        GovernmentScheme(
            name_en="Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            name_te="ప్రధానమంత్రి ఫసల్ బీమా యోజన (పంటల బీమా)",
            category="Central",
            target_states="All India",
            description_en="Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss/damage arising out of natural calamities, pests, and diseases.",
            description_te="ప్రకృతి వైపరీత్యాలు, తెగుళ్లు మరియు ప్రతికూల వాతావరణం వల్ల పంట నష్టపోయిన రైతులకు ఆర్థిక రక్షణ కల్పించే పంటల బీమా పథకం.",
            benefits_en="Low premium rates (1.5% for Rabi, 2% for Kharif, 5% for commercial/horticultural crops) with full claim payout on notified yield loss.",
            benefits_te="చాలా తక్కువ ప్రీమియంతో (ఖరీఫ్ 2%, రబీ 1.5%, వాణిజ్య పంటలు 5%) పంట నష్టానికి పూర్తి పరిహారం అందుతుంది.",
            eligibility_conditions_en="All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.",
            eligibility_conditions_te="నోటిఫై చేయబడిన ప్రాంతాల్లో సాగు చేసే రైతులు, కౌలు రైతులు మరియు వాటాదారులు అందరూ అర్హులు.",
            required_documents_en="Land record (ROR), Sowing certificate issued by village agriculture officer, Bank account details, Aadhaar.",
            required_documents_te="భూ రికార్డులు (అడంగల్/పహాణీ), విత్తన ధ్రువీకరణ పత్రం, బ్యాంక్ పాసుపుస్తకం, ఆధార్ కార్డు.",
            application_procedure_en="Apply via PMFBY portal (pmfby.gov.in), authorized banks, or primary agricultural cooperative societies (PACS).",
            application_procedure_te="pmfby.gov.in పోర్టల్ ద్వారా లేదా సంబంధిత బ్యాంకు శాఖలలో నమోదు చేసుకోవాలి.",
            official_portal_url="https://pmfby.gov.in",
            last_verified_date="2026-10-18"
        )
    ]
    for s in schemes:
        db.add(s)
    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
