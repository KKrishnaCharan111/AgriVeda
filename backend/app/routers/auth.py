from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, FarmerProfile, LabourProfile, BuyerProfile, ShopProfile
from app.schemas.auth import Token, UserRegister, UserLogin
from app.schemas.user import UserOut, UserUpdate
from app.services.auth_service import (
    verify_password, get_password_hash, create_access_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == payload.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this phone number is already registered."
        )
    if payload.email:
        existing_email = db.query(User).filter(User.email == payload.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address is already registered."
            )

    new_user = User(
        phone=payload.phone,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        preferred_language=payload.preferred_language,
        state=payload.state,
        district=payload.district,
        village=payload.village or "",
        is_active=True,
        is_verified=False
    )
    db.add(new_user)
    db.flush()

    # Create role-specific profile
    if payload.role == "farmer":
        db.add(FarmerProfile(user_id=new_user.id))
    elif payload.role == "labour":
        db.add(LabourProfile(user_id=new_user.id))
    elif payload.role == "buyer":
        db.add(BuyerProfile(user_id=new_user.id))
    elif payload.role == "shop":
        db.add(ShopProfile(
            user_id=new_user.id,
            shop_name=f"{payload.full_name}'s Agri Shop",
            owner_name=payload.full_name,
            address=f"{payload.village}, {payload.district}, {payload.state}"
        ))

    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        role=new_user.role,
        full_name=new_user.full_name,
        preferred_language=new_user.preferred_language
    )

@router.post("/login", response_model=Token)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account has been deactivated. Please contact support."
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        preferred_language=user.preferred_language
    )

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.email is not None:
        current_user.email = payload.email
    if payload.preferred_language is not None:
        current_user.preferred_language = payload.preferred_language
    if payload.state is not None:
        current_user.state = payload.state
    if payload.district is not None:
        current_user.district = payload.district
    if payload.village is not None:
        current_user.village = payload.village

    # Role specific updates
    if current_user.role == "farmer" and current_user.farmer_profile:
        if payload.farm_size_acres is not None:
            current_user.farmer_profile.farm_size_acres = payload.farm_size_acres
        if payload.primary_crops is not None:
            current_user.farmer_profile.primary_crops = payload.primary_crops
        if payload.irrigation_type is not None:
            current_user.farmer_profile.irrigation_type = payload.irrigation_type
            
    elif current_user.role == "labour" and current_user.labour_profile:
        if payload.skills is not None:
            current_user.labour_profile.skills = payload.skills
        if payload.daily_wage_expected is not None:
            current_user.labour_profile.daily_wage_expected = payload.daily_wage_expected
        if payload.availability_status is not None:
            current_user.labour_profile.availability_status = payload.availability_status
            
    elif current_user.role == "buyer" and current_user.buyer_profile:
        if payload.company_name is not None:
            current_user.buyer_profile.company_name = payload.company_name
        if payload.business_type is not None:
            current_user.buyer_profile.business_type = payload.business_type
        if payload.gst_number is not None:
            current_user.buyer_profile.gst_number = payload.gst_number

    elif current_user.role == "shop" and current_user.shop_profile:
        if payload.shop_name is not None:
            current_user.shop_profile.shop_name = payload.shop_name
        if payload.owner_name is not None:
            current_user.shop_profile.owner_name = payload.owner_name
        if payload.license_number is not None:
            current_user.shop_profile.license_number = payload.license_number
        if payload.address is not None:
            current_user.shop_profile.address = payload.address
        if payload.delivery_available is not None:
            current_user.shop_profile.delivery_available = payload.delivery_available

    db.commit()
    db.refresh(current_user)
    return current_user
