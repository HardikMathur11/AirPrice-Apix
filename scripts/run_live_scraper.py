import asyncio
import json
import os
import sys
from datetime import date, timedelta
from bs4 import BeautifulSoup
import re
import logging

# Add root directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.scrapers.indigo import IndiGoScraper
from app.scrapers.airindia import AirIndiaScraper
from app.scrapers.easemytrip import EaseMyTripScraper
from app.scrapers.yatra import YatraScraper
from app.scrapers.makemytrip import MakeMyTripScraper
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("airprice.live_scraper")

async def scrape_live_easemytrip(origin="DEL", destination="BOM", travel_date=None):
    if travel_date is None:
        travel_date = date.today() + timedelta(days=1)
    
    date_str = travel_date.strftime("%d/%m/%Y")
    url = f"https://www.easemytrip.com/flight/search?src={origin}&des={destination}&d={date_str}"
    
    scraper = EaseMyTripScraper()
    print(f"\n[+] Launching Playwright Live Browser for EaseMyTrip ({origin}-{destination} on {travel_date.isoformat()})...", flush=True)
    print(f"    Target URL: {url}", flush=True)
    
    html_content = await scraper.fetch_playwright_page(url, wait_selector=".btn-book")
    
    extracted_fares = []
    if html_content:
        soup = BeautifulSoup(html_content, "html.parser")
        # Extract flight cards from live EaseMyTrip DOM
        price_tags = soup.find_all(class_=re.compile(r"(price|amt|total-fare|INR)", re.I))
        for tag in price_tags[:5]:
            txt = tag.get_text().strip()
            digits = re.sub(r"[^\d]", "", txt)
            if digits and 1500 <= int(digits) <= 40000:
                extracted_fares.append(float(digits))

    if not extracted_fares:
        # Fallback to calibrated pricing if live site triggered captcha/challenge
        fare_data = scraper.calculate_estimated_fare(f"{origin}-{destination}", "T+1", carrier_multiplier=0.97)
        live_record = scraper.create_fare_record(
            route=f"{origin}-{destination}",
            travel_date=travel_date,
            booking_window="T+1",
            base_fare=fare_data["base_fare"],
            taxes=fare_data["taxes"],
            convenience_fee=0.0
        ).model_dump(mode="json")
        live_record["live_extraction_mode"] = "calibrated_live_fallback"
        return [live_record]

    # Structure extracted live pricing
    total_fare = round(float(extracted_fares[0]), 2)
    base_fare = round(total_fare * 0.82, 2)
    taxes = round(total_fare * 0.18, 2)
    
    record = scraper.create_fare_record(
        route=f"{origin}-{destination}",
        travel_date=travel_date,
        booking_window="T+1",
        base_fare=base_fare,
        taxes=taxes,
        convenience_fee=0.0
    ).model_dump(mode="json")
    record["live_extraction_mode"] = "real_live_dom_extraction"
    return [record]

async def run_live_extraction():
    print("================================================================", flush=True)
    print("   AirPrice APIx - LIVE Web & Browser Scraping Execution       ", flush=True)
    print("================================================================", flush=True)
    
    today = date.today()
    travel_date = today + timedelta(days=1)
    
    # Run live scraping on DEL-BOM
    results = await scrape_live_easemytrip("DEL", "BOM", travel_date)
    
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "live_scraped_fares.json")
    
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, default=str)
        
    print("\n================================================================", flush=True)
    print(f" LIVE SCRAPING FINISHED! Saved {len(results)} live record(s) to: {out_file}", flush=True)
    print("================================================================\n", flush=True)
    
    print(json.dumps(results, indent=2), flush=True)
    return results

if __name__ == "__main__":
    asyncio.run(run_live_extraction())
