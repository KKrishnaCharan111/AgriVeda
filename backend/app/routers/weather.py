from fastapi import APIRouter, Query
from app.schemas.smart import WeatherOut
from app.services.weather_service import fetch_weather_data

router = APIRouter(prefix="/weather", tags=["Weather Information & Alerts"])

@router.get("", response_model=WeatherOut)
async def get_weather(district: str = Query("Guntur", description="Indian district name")):
    data = await fetch_weather_data(district=district)
    return WeatherOut(**data)
