from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AirPrice APIx Backend"
    VERSION: str = "1.0.0"
    
    # Scraping Config
    USER_AGENT: str = "AirPrice APIx Bot / Contact: admin@airprice.in"
    RATE_LIMIT_SECONDS: int = 5
    PROXY_ENABLED: bool = False
    PROXY_URL: Optional[str] = None
    HEADLESS_BROWSER: bool = True
    
    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/airprice"
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "airprice_raw"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Auth & Logging
    SECRET_KEY: str = "airprice_secret_key_change_in_production"
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
