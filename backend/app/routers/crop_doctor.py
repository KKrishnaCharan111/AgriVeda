import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.smart import CropDoctorRequest, ExpertContactRequest
from app.models.user import User
from app.schemas.smart import (
    CropDoctorRequestCreate, CropDoctorResponse,
    ExpertContactCreate, ExpertContactOut
)
from app.services.crop_doctor_service import analyze_crop_issue
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/crop-doctor", tags=["Crop Doctor AI"])

UPLOAD_DIRECTORY = "uploads/crop_doctor"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@router.post("/upload-image")
async def upload_crop_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Validate image mime type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Supported formats: JPEG, PNG, WEBP."
        )

    # Validate file size (max 8MB)
    contents = await file.read()
    if len(contents) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds the 8MB limit.")

    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"crop_diag_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIRECTORY, filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    return {"image_url": f"/uploads/crop_doctor/{filename}"}

@router.post("/analyze", response_model=CropDoctorResponse)
def analyze_crop(
    payload: CropDoctorRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = analyze_crop_issue(
        crop_type=payload.crop_type,
        symptoms=payload.symptoms,
        image_url=payload.image_url,
        language=payload.language or current_user.preferred_language
    )

    req = CropDoctorRequest(
        farmer_id=current_user.id,
        crop_type=payload.crop_type,
        image_url=payload.image_url,
        symptoms=payload.symptoms,
        voice_note_url=payload.voice_note_url,
        detected_disease=analysis["detected_disease"],
        detected_disease_te=analysis["detected_disease_te"],
        confidence_score=analysis["confidence_score"],
        severity=analysis["severity"],
        possible_causes=analysis["possible_causes"],
        possible_causes_te=analysis["possible_causes_te"],
        treatment_recommendations=analysis["treatment_recommendations"],
        treatment_recommendations_te=analysis["treatment_recommendations_te"],
        prevention_guide=analysis["prevention_guide"],
        prevention_guide_te=analysis["prevention_guide_te"],
        safety_warnings=analysis["safety_warnings"],
        safety_warnings_te=analysis["safety_warnings_te"],
        is_expert_consult_recommended=analysis["is_expert_consult_recommended"],
        language=payload.language or current_user.preferred_language
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.get("/history", response_model=List[CropDoctorResponse])
def get_diagnosis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(CropDoctorRequest).filter(
        CropDoctorRequest.farmer_id == current_user.id
    ).order_by(CropDoctorRequest.created_at.desc()).all()
    return items

@router.post("/expert-request", response_model=ExpertContactOut)
def request_expert_contact(
    payload: ExpertContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = ExpertContactRequest(
        farmer_id=current_user.id,
        crop_doctor_request_id=payload.crop_doctor_request_id,
        farmer_name=payload.farmer_name or current_user.full_name,
        farmer_phone=payload.farmer_phone or current_user.phone,
        crop_name=payload.crop_name,
        issue_summary=payload.issue_summary,
        status="Pending"
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact
