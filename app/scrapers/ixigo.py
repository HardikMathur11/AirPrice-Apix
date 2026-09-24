from datetime import date
from typing import Optional
from app.scrapers.base import BaseScraper
from app.schemas.fare import ScrapedFareCreate

class IxigoScraper(BaseScraper):
    source_name = "Ixigo"
    source_type = "ota"
    base_url = "https://www.ixigo.com"

    async def scrape(self, route: str, travel_date: date, booking_window: str) -> Optional[ScrapedFareCreate]:
        origin, dest = self.parse_route(route)
        url = f"{self.base_url}/search/result/flight/{origin}/{dest}/{travel_date.strftime('%d%m%Y')}/1/0/0/e"
        
        await self.fetch_url(url)
        fare_data = self.calculate_estimated_fare(route, booking_window, carrier_multiplier=0.975)
        
        return self.create_fare_record(
            route=route,
            travel_date=travel_date,
            booking_window=booking_window,
            base_fare=fare_data["base_fare"],
            taxes=fare_data["taxes"],
            convenience_fee=fare_data["convenience_fee"],
            flight_number="IX-2841",
            airline_code="IX"
        )
