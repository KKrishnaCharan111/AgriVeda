from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.smart import MarketPrice
from app.schemas.smart import MarketPriceOut

router = APIRouter(prefix="/market-prices", tags=["Market Prices"])

@router.get("", response_model=List[MarketPriceOut])
def get_market_prices(
    state: Optional[str] = None,
    district: Optional[str] = None,
    crop: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(MarketPrice)
    if state and state != "All":
        q = q.filter(MarketPrice.state.ilike(f"%{state.strip()}%"))
    if district and district != "All":
        q = q.filter(MarketPrice.district.ilike(f"%{district.strip()}%"))
    if crop and crop != "All":
        q = q.filter(MarketPrice.crop_name.ilike(f"%{crop.strip()}%"))

    prices = q.order_by(MarketPrice.arrival_date.desc(), MarketPrice.created_at.desc()).all()
    return prices
