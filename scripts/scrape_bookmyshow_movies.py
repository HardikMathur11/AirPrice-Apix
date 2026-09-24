import asyncio
import json
import os
import sys
from bs4 import BeautifulSoup
import re

TARGET_URL = "https://in.bookmyshow.com/explore/movies-mumbai"

async def scrape_bookmyshow_movies():
    print("================================================================", flush=True)
    print("   BookMyShow Live Movies & Events Scraper                     ", flush=True)
    print("================================================================", flush=True)
    print(f"Target URL: {TARGET_URL}", flush=True)
    print("----------------------------------------------------------------", flush=True)

    extracted_movies = []

    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            print("[+] Launching Chromium browser...", flush=True)
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                viewport={"width": 1366, "height": 768}
            )
            page = await context.new_page()

            print("[+] Navigating to BookMyShow Movies page...", flush=True)
            await page.goto(TARGET_URL, timeout=40000, wait_until="domcontentloaded")
            await asyncio.sleep(5.0)

            # Scroll down to ensure images and titles render
            await page.evaluate("window.scrollBy(0, 1000)")
            await asyncio.sleep(2.0)

            content = await page.content()
            await browser.close()

            soup = BeautifulSoup(content, "html.parser")

            # Extract movie poster image alt texts & links
            images = soup.find_all("img", alt=True)
            for img in images:
                alt = img.get("alt", "").strip()
                if alt and len(alt) > 2 and len(alt) < 70:
                    if not any(k in alt.lower() for k in ["logo", "icon", "banner", "bms", "bookmyshow", "poster", "payment"]):
                        if not any(m["title"] == alt for m in extracted_movies):
                            extracted_movies.append({
                                "title": alt,
                                "category": "Movie / Cinema Show",
                                "location": "Mumbai",
                                "source": "BookMyShow"
                            })

            # Extract anchor links for movies
            anchors = soup.find_all("a", href=True)
            for a in anchors:
                href = a.get("href", "")
                txt = a.get_text().strip()
                if "/movies/" in href or "/buytickets/" in href:
                    if txt and len(txt) > 2 and len(txt) < 70:
                        if not any(m["title"] == txt for m in extracted_movies):
                            extracted_movies.append({
                                "title": txt,
                                "category": "Movie Ticket Listing",
                                "bookmyshow_link": f"https://in.bookmyshow.com{href}" if href.startswith("/") else href,
                                "source": "BookMyShow"
                            })

    except Exception as e:
        print(f"[!] Scraper Note: {e}", flush=True)

    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "bookmyshow_movies.json")

    payload = {
        "website": "BookMyShow India",
        "url": TARGET_URL,
        "total_extracted": len(extracted_movies),
        "movies_and_events": extracted_movies
    }

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print("\n================================================================", flush=True)
    print(f" EXTRACTED {len(extracted_movies)} MOVIES SUCCESSFULLY! Saved to: {out_file}", flush=True)
    print("================================================================\n", flush=True)

    print(json.dumps(payload, indent=2, ensure_ascii=False), flush=True)
    return payload

if __name__ == "__main__":
    asyncio.run(scrape_bookmyshow_movies())
