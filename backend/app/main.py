import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.seed.seed_data import seed_database
from app.routers import (
    auth, crops, labour, shops, crop_doctor, weather,
    market_prices, schemes, problem_solver, farming_assistant,
    payments, refunds, admin, feedback
)

# Ensure upload folders exist
os.makedirs("uploads/crops", exist_ok=True)
os.makedirs("uploads/crop_doctor", exist_ok=True)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AgriVeda – Smart Agriculture Marketplace and Farmer Problem-Solving Platform REST API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload directory
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(crops.router, prefix=settings.API_V1_STR)
app.include_router(labour.router, prefix=settings.API_V1_STR)
app.include_router(shops.router, prefix=settings.API_V1_STR)
app.include_router(crop_doctor.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(market_prices.router, prefix=settings.API_V1_STR)
app.include_router(schemes.router, prefix=settings.API_V1_STR)
app.include_router(problem_solver.router, prefix=settings.API_V1_STR)
app.include_router(farming_assistant.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(refunds.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seed notice: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "AgriVeda API",
        "version": "1.0.0",
        "zero_budget_mode": True,
        "mock_payments_enabled": settings.ENABLE_MOCK_PAYMENTS
    }
