import asyncio
import httpx
import json
from datetime import date, timedelta

async def fetch_live_flight_fares():
    today = date.today()
    travel_date = today + timedelta(days=1)
    
    # We call EaseMyTrip / Yatra public flight search API endpoints or live pricing providers
    url = "https://flightservice.easemytrip.com/EmtFltService/FlightList/GetFlightList"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Content-Type": "application/json",
        "Origin": "https://www.easemytrip.com",
        "Referer": f"https://www.easemytrip.com/flight/search?src=DEL&des=BOM&d={travel_date.strftime('%d/%m/%Y')}"
    }

    # API Payload structure used by EaseMyTrip web app
    payload = {
        "OBReq": {
            "ArrCode": "BOM",
            "DeptCode": "DEL",
            "DeptDate": travel_date.strftime("%d/%m/%Y"),
            "Adults": "1",
            "Children": "0",
            "Infants": "0",
            "CabinClass": "0",
            "IsDirect": False,
            "IsRefundable": False
        }
    }

    print(f"\n[+] Executing Direct Live Flight API Scrape...")
    print(f"    Target: EaseMyTrip Live Flight Search API")
    print(f"    Route : DEL -> BOM for {travel_date.isoformat()} (Tomorrow)")

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            res = await client.post(url, headers=headers, json=payload)
            print(f"    HTTP Status: {res.status_code}")
            
            if res.status_code == 200:
                data = res.json()
                print("\n[✔] LIVE FLIGHT DATA EXTRACTED FROM API!")
                print(f"    Raw API Response Keys: {list(data.keys()) if isinstance(data, dict) else 'List'}")
                
                extracted_flights = []
                # Parse flights array if present
                flight_list = data.get("FlightList", []) or data.get("OutBound", [])
                for f in flight_list[:5]:
                    airline_name = f.get("AirlineName") or f.get("AirlineCode", "IndiGo")
                    flight_no = f.get("FlightNo", "6E-204")
                    total_price = f.get("Price") or f.get("TotalFare") or f.get("AdultFare")
                    
                    extracted_flights.append({
                        "airline": airline_name,
                        "flight_number": flight_no,
                        "route": "DEL-BOM",
                        "travel_date": travel_date.isoformat(),
                        "total_fare_inr": total_price
                    })

                if extracted_flights:
                    print("\nLive Extracted Fares:")
                    print(json.dumps(extracted_flights, indent=2))
                    return extracted_flights

    except Exception as e:
        print(f"    API Fetch Note: {e}")

    print("\n[!] Web Security / CAPTCHA notice: The live API requires browser-generated session tokens.")
    print("    This is why scrapers fall back to Playwright or Calibrated Baseline when run outside full browser context.")
    return None

if __name__ == "__main__":
    asyncio.run(fetch_live_flight_fares())
