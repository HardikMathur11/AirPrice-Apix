import asyncio
import os
import sys
import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler

# Add root directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.run_scraper import run_all_scrapers

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("airprice.scheduler_daemon")

async def scheduled_scrape_task():
    logger.info("=========================================================")
    logger.info(" [AUTOMATED SCHEDULER] Triggering 2-Hour Scraping Cycle ")
    logger.info("=========================================================")
    try:
        results = await run_all_scrapers()
        logger.info(f" [OK] Completed 2-Hour Scraping Cycle: Extracted {len(results)} Records.")
    except Exception as e:
        logger.error(f" [!] Automated Scraping Error: {e}")

async def main():
    scheduler = AsyncIOScheduler()
    
    # Schedule automated scraping every 2 hours
    scheduler.add_job(
        scheduled_scrape_task,
        'interval',
        hours=2,
        next_run_time=datetime.now(), # Run immediately on startup, then every 2 hours
        id='automated_2h_scraping_job'
    )
    
    logger.info("=========================================================")
    logger.info("   AirPrice APIx 24/7 Scraping Daemon Started           ")
    logger.info("=========================================================")
    logger.info("   -> Schedule: Runs automatically every 2 hours        ")
    logger.info("   -> Monitored Sources: 11 (5 Airlines + 6 OTAs)       ")
    logger.info("   -> Monitored Routes: 50 DGCA Weighted Routes         ")
    logger.info("=========================================================\n")
    
    scheduler.start()
    
    try:
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("Scheduler Daemon Shutdown Gracefully.")

if __name__ == "__main__":
    asyncio.run(main())
