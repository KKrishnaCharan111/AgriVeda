from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.labour import JobListing, JobApplication
from app.models.user import User, LabourProfile
from app.models.feedback import Notification
from app.schemas.labour import (
    JobListingCreate, JobListingOut,
    JobApplicationCreate, JobApplicationStatusUpdate, JobApplicationOut
)
from app.services.auth_service import get_current_user, require_roles

router = APIRouter(prefix="/labour", tags=["Agricultural Labour Marketplace"])

@router.get("/jobs", response_model=List[JobListingOut])
def list_jobs(
    district: Optional[str] = None,
    work_type: Optional[str] = None,
    crop_type: Optional[str] = None,
    status: Optional[str] = "open",
    db: Session = Depends(get_db)
):
    q = db.query(JobListing)
    if status and status != "All":
        q = q.filter(JobListing.status == status)
    if district and district != "All":
        q = q.filter(JobListing.district.ilike(f"%{district.strip()}%"))
    if work_type and work_type != "All":
        q = q.filter(JobListing.work_type == work_type)
    if crop_type and crop_type != "All":
        q = q.filter(JobListing.crop_type.ilike(f"%{crop_type.strip()}%"))

    jobs = q.order_by(JobListing.created_at.desc()).all()
    results = []
    for j in jobs:
        out = JobListingOut.from_orm(j)
        if j.farmer:
            out.farmer_name = j.farmer.full_name
        out.applications_count = len(j.applications)
        results.append(out)
    return results

@router.post("/jobs", response_model=JobListingOut)
def create_job(
    payload: JobListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["farmer", "admin"]))
):
    job = JobListing(
        farmer_id=current_user.id,
        title=payload.title,
        title_te=payload.title_te,
        crop_type=payload.crop_type or "Paddy",
        work_type=payload.work_type,
        workers_needed=payload.workers_needed,
        daily_wage=payload.daily_wage,
        start_date=payload.start_date,
        duration_days=payload.duration_days,
        village=payload.village or current_user.village,
        district=payload.district or current_user.district,
        state=payload.state or current_user.state,
        description=payload.description or "",
        contact_phone=payload.contact_phone or current_user.phone,
        status="open"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    out = JobListingOut.from_orm(job)
    out.farmer_name = current_user.full_name
    out.applications_count = 0
    return out

@router.get("/jobs/{job_id}", response_model=JobListingOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")
    out = JobListingOut.from_orm(job)
    if job.farmer:
        out.farmer_name = job.farmer.full_name
    out.applications_count = len(job.applications)
    return out

@router.post("/jobs/{job_id}/apply", response_model=JobApplicationOut)
def apply_for_job(
    job_id: int,
    payload: JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["labour", "admin"]))
):
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")

    # Check existing application
    existing = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.worker_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this farm job.")

    app = JobApplication(
        job_id=job_id,
        worker_id=current_user.id,
        proposed_wage=payload.proposed_wage or job.daily_wage,
        message=payload.message or "",
        status="applied"
    )
    db.add(app)

    # Notify farmer
    notif = Notification(
        user_id=job.farmer_id,
        title="New Worker Application",
        title_te="కొత్త వ్యవసాయ కూలీ దరఖాస్తు",
        message=f"{current_user.full_name} applied for your job '{job.title}'. Proposed wage: ₹{app.proposed_wage}/day.",
        message_te=f"{current_user.full_name} మీ పని '{job.title}' కోసం దరఖాస్తు చేసుకున్నారు. ప్రతిపాదిత కూలీ: ₹{app.proposed_wage}/రోజు.",
        notification_type="labour",
        action_url=f"/labour/jobs/{job_id}"
    )
    db.add(notif)
    db.commit()
    db.refresh(app)

    out = JobApplicationOut.from_orm(app)
    out.worker_name = current_user.full_name
    out.worker_phone = current_user.phone
    out.job_title = job.title
    out.daily_wage = job.daily_wage
    out.district = job.district
    return out

@router.get("/applications/my", response_model=List[JobApplicationOut])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "labour":
        apps = db.query(JobApplication).filter(JobApplication.worker_id == current_user.id).all()
    elif current_user.role == "farmer":
        apps = db.query(JobApplication).join(JobListing).filter(JobListing.farmer_id == current_user.id).all()
    else:
        apps = db.query(JobApplication).all()

    results = []
    for a in apps:
        out = JobApplicationOut.from_orm(a)
        if a.worker:
            out.worker_name = a.worker.full_name
            out.worker_phone = a.worker.phone
            if a.worker.labour_profile:
                out.worker_skills = a.worker.labour_profile.skills
        if a.job:
            out.job_title = a.job.title
            out.daily_wage = a.job.daily_wage
            out.district = a.job.district
        results.append(out)
    return results

@router.put("/applications/{app_id}/status", response_model=JobApplicationOut)
def update_application_status(
    app_id: int,
    payload: JobApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = payload.status
    db.commit()
    db.refresh(app)

    out = JobApplicationOut.from_orm(app)
    if app.worker:
        out.worker_name = app.worker.full_name
        out.worker_phone = app.worker.phone
    if app.job:
        out.job_title = app.job.title
    return out

@router.get("/workers")
def list_available_workers(
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(User).filter(User.role == "labour", User.is_active == True)
    if district and district != "All":
        q = q.filter(User.district.ilike(f"%{district.strip()}%"))

    workers = q.all()
    results = []
    for w in workers:
        skills = w.labour_profile.skills if w.labour_profile else "General Farm Work"
        wage = w.labour_profile.daily_wage_expected if w.labour_profile else 600.0
        avail = w.labour_profile.availability_status if w.labour_profile else "available"
        results.append({
            "id": w.id,
            "full_name": w.full_name,
            "phone": w.phone,
            "village": w.village,
            "district": w.district,
            "state": w.state,
            "skills": skills,
            "daily_wage_expected": wage,
            "availability_status": avail
        })
    return results
