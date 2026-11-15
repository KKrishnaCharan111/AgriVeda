from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.smart import GovernmentScheme
from app.schemas.smart import GovernmentSchemeOut

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

@router.get("", response_model=List[GovernmentSchemeOut])
def get_schemes(
    category: Optional[str] = None,
    target_state: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(GovernmentScheme).filter(GovernmentScheme.is_active == True)
    if category and category != "All":
        q = q.filter(GovernmentScheme.category == category)
    if target_state and target_state != "All":
        q = q.filter(
            (GovernmentScheme.target_states == "All India") |
            (GovernmentScheme.target_states.ilike(f"%{target_state.strip()}%"))
        )

    schemes = q.order_by(GovernmentScheme.id.asc()).all()
    return schemes
