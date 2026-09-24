import asyncio
import json
import os
import sys
from bs4 import BeautifulSoup
import re

TARGET_URL = "https://in.bookmyshow.com/explore/home/mumbai"

async def scrape_bookmyshow():
    print("================================================================", flush=True)
    print("   BookMyShow Mumbai Home Page Live Data Scraper               ", flush=True)
    print("================================================================", flush=True)
    print(f"Target URL: {TARGET_URL}", flush=True)
    print("----------------------------------------------------------------", flush=True)

    page_title = ""
    extracted_movies = []

    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            print("[+] Launching Chromium browser context...", flush=True)
            browser = await p.chromium.launch(
                headless=False,
                args=["--no-sandbox", "--disable-setuid-sandbox"]
            )
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                viewport={"width": 1366, "height": 768}
            )
            page = await context.new_page()

            print("[+] Navigating to BookMyShow Mumbai home page...", flush=True)
            await page.goto(TARGET_URL, timeout=40000, wait_until="domcontentloaded")
            await asyncio.sleep(5.0)

            page_title = await page.title()
            content = await page.content()
            await browser.close()

            soup = BeautifulSoup(content, "html.parser")

            # Extract Next.js embedded JSON payload (__NEXT_DATA__)
            next_script = soup.find("script", id="__NEXT_DATA__")
            if next_script and next_script.string:
                raw_json = json.loads(next_script.string)
                page_props = raw_json.get("props", {}).get("pageProps", {})
                
                # Extract initial data / widgets
                initial_data = page_props.get("initialData", {})
                
                # Traverse widgets / modules
                for key, val in page_props.items():
                    if isinstance(val, dict):
                        for sub_k, sub_v in val.items():
                            if isinstance(sub_v, list):
                                for item in sub_v:
                                    if isinstance(item, dict) and ("title" in item or "name" in item):
                                        title_name = item.get("title") or item.get("name")
                                        extracted_movies.append({
                                            "title": title_name,
                                            "category": item.get("category", "Entertainment"),
                                            "language": item.get("language", ""),
                                            "url": item.get("url", "")
                                        })

            # Extract image alt texts and title headings from DOM
            img_tags = soup.find_all("img", alt=True)
            for img in img_tags:
                alt = img.get("alt", "").strip()
                if alt and len(alt) > 2 and len(alt) < 60 and not any(kw in alt.lower() for kw in ["logo", "icon", "banner", "poster", "bookmyshow"]):
                    if not any(m["title"] == alt for m in extracted_movies):
                        extracted_movies.append({
                            "title": alt,
                            "type": "Movie / Event / Offer"
                        })

    except Exception as e:
        print(f"[!] Extraction note: {e}", flush=True)

    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "bookmyshow_extracted.json")

    final_payload = {
        "website": "BookMyShow India (Mumbai Region)",
        "url": TARGET_URL,
        "page_title": page_title,
        "total_extracted_items": len(extracted_movies),
        "items": extracted_movies[:30]
    }

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(final_payload, f, indent=2, ensure_ascii=False)

    print("\n================================================================", flush=True)
    print(f" SCRAPING COMPLETE! Extracted {len(extracted_movies)} items to: {out_file}", flush=True)
    print("================================================================\n", flush=True)

    print(json.dumps(final_payload, indent=2, ensure_ascii=False), flush=True)
    return final_payload

if __name__ == "__main__":
    asyncio.run(scrape_bookmyshow())
