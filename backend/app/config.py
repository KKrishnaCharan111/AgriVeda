import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriVeda"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "agriveda_super_secret_jwt_key_2026_dev_mode_secure_random")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agriveda.db")
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    
    # External APIs (Zero-budget default mode uses Open-Meteo & mock/rule-based intelligence)
    WEATHER_API_URL: str = "https://api.open-meteo.com/v1/forecast"
    ENABLE_MOCK_PAYMENTS: bool = os.getenv("ENABLE_MOCK_PAYMENTS", "True").lower() in ("true", "1", "yes")
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_agriveda_mock_id")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "rzp_test_agriveda_mock_secret")
    
    # AI / LLM Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Platform Commissions
    PLATFORM_COMMISSION_PERCENT: float = 1.0  # 1% standard commission
    BUYER_PRO_MONTHLY_PRICE: float = 199.0
    SHOP_LISTING_MONTHLY_PRICE: float = 99.0
    FEATURED_PROMOTION_PRICE: float = 49.0

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
