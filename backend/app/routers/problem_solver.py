from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.smart import ProblemSolverQuery
from app.models.user import User
from app.schemas.smart import ProblemSolverQueryCreate, ProblemSolverResponse
from app.services.problem_solver_service import solve_farmer_query
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/problem-solver", tags=["Farmer Problem Solver"])

@router.post("/ask", response_model=ProblemSolverResponse)
def ask_question(
    payload: ProblemSolverQueryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = solve_farmer_query(
        question_text=payload.question_text,
        topic=payload.topic
    )

    query_rec = ProblemSolverQuery(
        user_id=current_user.id,
        question_text=payload.question_text,
        detected_language=result["detected_language"],
        answer_text_en=result["answer_text_en"],
        answer_text_te=result["answer_text_te"],
        topic=result["topic"],
        image_url=payload.image_url,
        audio_query_url=payload.audio_query_url
    )
    db.add(query_rec)
    db.commit()
    db.refresh(query_rec)
    return query_rec

@router.get("/history", response_model=List[ProblemSolverResponse])
def get_user_problem_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(ProblemSolverQuery).filter(
        ProblemSolverQuery.user_id == current_user.id
    ).order_by(ProblemSolverQuery.created_at.desc()).all()
    return items
