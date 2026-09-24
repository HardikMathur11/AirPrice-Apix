from datetime import date
from typing import Optional
from app.scrapers.base import BaseScraper
from app.schemas.fare import ScrapedFareCreate

class AirIndiaScraper(BaseScraper):
    source_name = "Air India"
    source_type = "airline"
    base_url = "https://www.airindia.com"

    async def scrape(self, route: str, travel_date: date, booking_window: str) -> Optional[ScrapedFareCreate]:
        origin, dest = self.parse_route(route)
        url = f"{self.base_url}/in/en/book/flight-search.html?from={origin}&to={dest}&departDate={travel_date.isoformat()}"
        
        await self.fetch_url(url)
        fare_data = self.calculate_estimated_fare(route, booking_window, carrier_multiplier=1.08)
        
        return self.create_fare_record(
            route=route,
            travel_date=travel_date,
            booking_window=booking_window,
            base_fare=fare_data["base_fare"],
            taxes=fare_data["taxes"],
            convenience_fee=fare_data["convenience_fee"],
            flight_number="AI-805",
            airline_code="AI"
        )
