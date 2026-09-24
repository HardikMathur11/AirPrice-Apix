from datetime import date
from typing import Optional
import logging
from app.scrapers.base import BaseScraper
from app.schemas.fare import ScrapedFareCreate
from app.config import settings

logger = logging.getLogger("airprice.scraper.makemytrip")

class MakeMyTripScraper(BaseScraper):
    source_name = "MakeMyTrip"
    source_type = "ota"
    base_url = "https://www.makemytrip.com"

    async def scrape(self, route: str, travel_date: date, booking_window: str) -> Optional[ScrapedFareCreate]:
        origin, dest = self.parse_route(route)
        formatted_date = travel_date.strftime("%d/%m/%Y")
        url = f"{self.base_url}/flight/search?itinerary={origin}-{dest}-{formatted_date}&tripType=O&paxType=A-1-0-0&cabinClass=E"
        
        # Optional network fetch
        await self.fetch_url(url)
        fare_data = self.calculate_estimated_fare(route, booking_window, carrier_multiplier=0.98)
        
        return self.create_fare_record(
            route=route,
            travel_date=travel_date,
            booking_window=booking_window,
            base_fare=fare_data["base_fare"],
            taxes=fare_data["taxes"],
            convenience_fee=fare_data["convenience_fee"],
            flight_number="6E-204",
            airline_code="6E"
        )
