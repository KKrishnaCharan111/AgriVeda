from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.smart import FarmingReminder
from app.models.user import User
from app.schemas.smart import FarmingReminderCreate, FarmingReminderOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/farming-assistant", tags=["Farming Assistant & Calendar"])

# Default seasonal farming advisory reminders for major Indian crops
DEFAULT_SEASONAL_REMINDERS = [
    {
        "crop_name": "Paddy",
        "crop_name_te": "వరి",
        "stage": "Fertilization",
        "title_en": "Second Top Dressing of Nitrogen for Tillering",
        "title_te": "పిలకల దశలో రెండో విడత యూరియా వేయడం",
        "description_en": "Apply 30 kg Urea and 15 kg MOP per acre 25-30 days after transplanting.",
        "description_te": "నాట్లు వేసిన 25-30 రోజులకు ఎకరాకు 30 కిలోల యూరియా మరియు 15 కిలోల పొటాష్ వేయండి.",
        "due_date": "2026-11-20"
    },
    {
        "crop_name": "Red Chilli",
        "crop_name_te": "ఎర్ర మిరప",
        "stage": "Pest Prevention",
        "title_en": "Sticky Trap Inspection and Preventive Neem Spray",
        "title_te": "జిగురు అట్టల పరిశీలన మరియు వేపనూనె పిచికారీ",
        "description_en": "Inspect yellow sticky traps for thrips/mites. Spray 5ml/L neem oil if adult population increases.",
        "description_te": "తామర పురుగుల ఉధృతిని గమనించి నివారణకు వేపనూనె (5 మి.లీ / లీటరు) పిచికారీ చేయండి.",
        "due_date": "2026-11-22"
    },
    {
        "crop_name": "Bt Cotton",
        "crop_name_te": "పత్తి",
        "stage": "Harvesting",
        "title_en": "First Picking of Open Clean Bolls",
        "title_te": "విచ్చుకున్న పత్తి మొదటి కోత",
        "description_en": "Pick completely opened clean bolls in early morning after dew dries to prevent trash accumulation.",
        "description_te": "మంచు ఆరిన తర్వాత మాత్రమే బాగా విచ్చుకున్న తెల్లటి పత్తిని కోయండి.",
        "due_date": "2026-11-25"
    }
]

@router.get("/reminders", response_model=List[FarmingReminderOut])
def get_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminders = db.query(FarmingReminder).filter(
        FarmingReminder.user_id == current_user.id
    ).order_by(FarmingReminder.due_date.asc()).all()

    # If new user has no reminders, populate with default seasonal guides
    if not reminders:
        for item in DEFAULT_SEASONAL_REMINDERS:
            r = FarmingReminder(
                user_id=current_user.id,
                crop_name=item["crop_name"],
                crop_name_te=item["crop_name_te"],
                stage=item["stage"],
                title_en=item["title_en"],
                title_te=item["title_te"],
                description_en=item["description_en"],
                description_te=item["description_te"],
                due_date=item["due_date"],
                is_completed=False
            )
            db.add(r)
        db.commit()
        reminders = db.query(FarmingReminder).filter(
            FarmingReminder.user_id == current_user.id
        ).order_by(FarmingReminder.due_date.asc()).all()

    return reminders

@router.post("/reminders", response_model=FarmingReminderOut)
def create_reminder(
    payload: FarmingReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rem = FarmingReminder(
        user_id=current_user.id,
        crop_name=payload.crop_name,
        crop_name_te=payload.crop_name_te,
        stage=payload.stage,
        title_en=payload.title_en,
        title_te=payload.title_te,
        description_en=payload.description_en or "",
        description_te=payload.description_te or "",
        due_date=payload.due_date,
        is_completed=False
    )
    db.add(rem)
    db.commit()
    db.refresh(rem)
    return rem

@router.put("/reminders/{reminder_id}/toggle", response_model=FarmingReminderOut)
def toggle_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rem = db.query(FarmingReminder).filter(
        FarmingReminder.id == reminder_id,
        FarmingReminder.user_id == current_user.id
    ).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")

    rem.is_completed = not rem.is_completed
    db.commit()
    db.refresh(rem)
    return rem
