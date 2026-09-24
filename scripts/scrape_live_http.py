import asyncio
import httpx
from bs4 import BeautifulSoup
import re
from datetime import date, timedelta
import json

async def fetch_live_easemytrip_price(origin="DEL", destination="BOM"):
    today = date.today()
    tomorrow = today + timedelta(days=1)
    date_str = tomorrow.strftime("%d/%m/%Y")
    
    url = f"https://www.easemytrip.com/flight/search?src={origin}&des={destination}&d={date_str}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }
    
    print(f"\n[+] Sending Live HTTP Request to EaseMyTrip...")
    print(f"    URL: {url}")
    print(f"    Route: {origin} -> {destination} on {tomorrow.isoformat()} (Tomorrow)")
    
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        res = await client.get(url, headers=headers)
        print(f"    HTTP Status Code: {res.status_code}")
        
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, "html.parser")
            title = soup.title.string if soup.title else "No Title"
            print(f"    Page Title: {title.strip()}")
            
            # Find price values in HTML text
            raw_text = soup.get_text()
            prices = re.findall(r"Rs\.?\s?([0-9]{1,2},[0-9]{3}|[0-9]{4,5})", raw_text)
            
            clean_prices = []
            for p in prices:
                val = int(p.replace(",", ""))
                if 2000 <= val <= 35000:
                    clean_prices.append(val)
                    
            if clean_prices:
                print(f"    LIVE Scraped Prices found in HTML: {clean_prices[:5]}")
                return {
                    "source": "EaseMyTrip",
                    "status": "SUCCESS_LIVE_HTTP",
                    "route": f"{origin}-{destination}",
                    "travel_date": tomorrow.isoformat(),
                    "scraped_fares_inr": clean_prices[:5]
                }
            else:
                print("    (Live HTML fetched successfully; dynamic prices loaded via JS API)")
                return {
                    "source": "EaseMyTrip",
                    "status": "LIVE_PAGE_FETCHED_JS_PENDING",
                    "route": f"{origin}-{destination}",
                    "travel_date": tomorrow.isoformat(),
                    "url_to_verify": url
                }
        else:
            return {"status": "BLOCKED_OR_ERROR", "http_code": res.status_code}

if __name__ == "__main__":
    result = asyncio.run(fetch_live_easemytrip_price("DEL", "BOM"))
    print("\nResult Payload:")
    print(json.dumps(result, indent=2))
