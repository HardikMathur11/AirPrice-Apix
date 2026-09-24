from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging
from contextlib import asynccontextmanager

from app.config import settings
from app.api.routes import router as api_router
from app.database import check_db_health
from scripts.run_scraper import run_all_scrapers

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("airprice.main")

scheduler = AsyncIOScheduler()

# Scheduled task wrappers for APScheduler
async def scheduled_scrape_job():
    logger.info("[Scheduler] Triggering 2-hour automated scraping job...")
    try:
        await run_all_scrapers()
    except Exception as e:
        logger.error(f"[Scheduler] Scraping job error: {e}")

async def scheduled_apix_job():
    logger.info("[Scheduler] Triggering Daily 10 AM APIx Index Calculation...")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for starting and stopping background tasks."""
    logger.info("Initializing AirPrice APIx Backend Application...")
    
    # Configure APScheduler jobs
    scheduler.add_job(scheduled_scrape_job, 'interval', hours=2, id='scrape_all_sources')
    scheduler.add_job(scheduled_apix_job, 'cron', hour=10, minute=0, id='calculate_apix_daily')
    
    scheduler.start()
    logger.info("APScheduler started (Scraping every 2 hours, Daily APIx calculation at 10 AM).")
    
    yield
    
    if scheduler.running:
        scheduler.shutdown()
    logger.info("APScheduler shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real-time Airfare Price Index for India (AirPrice APIx) Backend System",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health", tags=["Monitoring"])
async def health_check():
    """Health check endpoint returning system status and DB health."""
    db_status = await check_db_health()
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_health": db_status
    }
