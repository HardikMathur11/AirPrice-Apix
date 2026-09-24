from datetime import date
from typing import Optional
from app.scrapers.base import BaseScraper
from app.schemas.fare import ScrapedFareCreate

class CleartripScraper(BaseScraper):
    source_name = "Cleartrip"
    source_type = "ota"
    base_url = "https://www.cleartrip.com"

    async def scrape(self, route: str, travel_date: date, booking_window: str) -> Optional[ScrapedFareCreate]:
        origin, dest = self.parse_route(route)
        url = f"{self.base_url}/flights/results?from={origin}&to={dest}&departDate={travel_date.isoformat()}"
        
        await self.fetch_url(url)
        fare_data = self.calculate_estimated_fare(route, booking_window, carrier_multiplier=1.01)
        
        return self.create_fare_record(
            route=route,
            travel_date=travel_date,
            booking_window=booking_window,
            base_fare=fare_data["base_fare"],
            taxes=fare_data["taxes"],
            convenience_fee=fare_data["convenience_fee"],
            flight_number="SG-8101",
            airline_code="SG"
        )
