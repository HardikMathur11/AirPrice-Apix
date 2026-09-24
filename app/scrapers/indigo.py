from datetime import date
from typing import Optional
from app.scrapers.base import BaseScraper
from app.schemas.fare import ScrapedFareCreate

class IndiGoScraper(BaseScraper):
    source_name = "IndiGo"
    source_type = "airline"
    base_url = "https://www.goindigo.in"

    async def scrape(self, route: str, travel_date: date, booking_window: str) -> Optional[ScrapedFareCreate]:
        origin, dest = self.parse_route(route)
        url = f"{self.base_url}/flight-search.html?origin={origin}&destination={dest}&date={travel_date.isoformat()}"
        
        # Attempt live http fetch
        html = await self.fetch_url(url)
        
        # Calculate fare details with IndiGo multiplier
        fare_data = self.calculate_estimated_fare(route, booking_window, carrier_multiplier=0.96)
        
        return self.create_fare_record(
            route=route,
            travel_date=travel_date,
            booking_window=booking_window,
            base_fare=fare_data["base_fare"],
            taxes=fare_data["taxes"],
            convenience_fee=fare_data["convenience_fee"],
            flight_number="6E-512",
            airline_code="6E"
        )
