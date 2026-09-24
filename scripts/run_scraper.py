import asyncio
import json
import os
import sys
from datetime import date, datetime, timedelta
import pandas as pd

# Add root directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.scrapers.indigo import IndiGoScraper
from app.scrapers.airindia import AirIndiaScraper
from app.scrapers.akasa import AkasaAirScraper
from app.scrapers.spicejet import SpiceJetScraper
from app.scrapers.aiexpress import AirIndiaExpressScraper
from app.scrapers.makemytrip import MakeMyTripScraper
from app.scrapers.yatra import YatraScraper
from app.scrapers.easemytrip import EaseMyTripScraper
from app.scrapers.cleartrip import CleartripScraper
from app.scrapers.ixigo import IxigoScraper
from app.scrapers.goibibo import GoibiboScraper

SCRAPERS = [
    # 5 Airlines
    IndiGoScraper(),
    AirIndiaScraper(),
    AkasaAirScraper(),
    SpiceJetScraper(),
    AirIndiaExpressScraper(),
    # 6 OTAs
    MakeMyTripScraper(),
    YatraScraper(),
    EaseMyTripScraper(),
    CleartripScraper(),
    IxigoScraper(),
    GoibiboScraper()
]

# Sample Routes across Tier-1 & Tier-2
TEST_ROUTES = [
    "DEL-BOM",
    "DEL-BLR",
    "BOM-BLR",
    "DEL-CCU",
    "MAA-DEL",
    "BOM-GOI",
    "BLR-HYD",
    "DEL-HYD"
]

BOOKING_WINDOWS = {
    "T+1": 1,
    "T+7": 7,
    "T+15": 15,
    "T+30": 30,
    "T+45": 45
}

async def scrape_single_item(scraper, route, travel_date, window_name):
    try:
        fare_record = await scraper.scrape(route, travel_date, window_name)
        if fare_record:
            return fare_record.model_dump(mode="json")
    except Exception as e:
        print(f"   [!] Failed {scraper.source_name} on {route} ({window_name}): {e}", flush=True)
    return None

async def run_all_scrapers():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print("================================================================", flush=True)
    print(f"   AirPrice APIx - Scraping Run Initiated at {timestamp}    ", flush=True)
    print("================================================================", flush=True)
    print(f"Total Sources  : {len(SCRAPERS)} (5 Airlines + 6 OTAs)", flush=True)
    print(f"Total Routes   : {len(TEST_ROUTES)}", flush=True)
    print(f"Booking Windows: {list(BOOKING_WINDOWS.keys())}", flush=True)
    print("----------------------------------------------------------------", flush=True)

    today = date.today()
    tasks = []

    for route in TEST_ROUTES:
        for window_name, days_ahead in BOOKING_WINDOWS.items():
            travel_date = today + timedelta(days=days_ahead)
            for scraper in SCRAPERS:
                tasks.append(scrape_single_item(scraper, route, travel_date, window_name))

    print(f"[+] Launching {len(tasks)} parallel scraping tasks...", flush=True)
    raw_results = await asyncio.gather(*tasks)
    results = [r for r in raw_results if r is not None]

    # Output directory setup
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    
    json_path = os.path.join(out_dir, "scraped_fares_output.json")
    csv_path = os.path.join(out_dir, "scraped_fares_output.csv")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, default=str)

    if results:
        df = pd.DataFrame(results)
        df.to_csv(csv_path, index=False)

        print("\n================================================================", flush=True)
        print(f" SCRAPING COMPLETE! Successfully extracted {len(results)} fare records.", flush=True)
        print(f" Exported JSON to: {json_path}", flush=True)
        print(f" Exported CSV to : {csv_path}", flush=True)
        print("================================================================\n", flush=True)

        # Summary table by source
        if "source" in df.columns and "source_type" in df.columns:
            summary = df.groupby(["source", "source_type"]).agg(
                records_scraped=("total_fare", "count"),
                min_fare=("total_fare", "min"),
                avg_fare=("total_fare", "mean"),
                max_fare=("total_fare", "max")
            ).round(2).reset_index()

            print("Source Summary:", flush=True)
            print(summary.to_string(index=False), flush=True)

    return results

if __name__ == "__main__":
    asyncio.run(run_all_scrapers())
