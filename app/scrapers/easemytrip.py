from datetime import date
from typing import Optional
from app.scrapers.base import BaseScraper
from app.schemas.fare import ScrapedFareCreate

class EaseMyTripScraper(BaseScraper):
    source_name = "EaseMyTrip"
    source_type = "ota"
    base_url = "https://www.easemytrip.com"

    async def scrape(self, route: str, travel_date: date, booking_window: str) -> Optional[ScrapedFareCreate]:
        origin, dest = self.parse_route(route)
        formatted_date = travel_date.strftime("%d/%m/%Y")
        url = f"{self.base_url}/flight/search?src={origin}&des={dest}&d={formatted_date}"
        
        await self.fetch_url(url)
        # EaseMyTrip zero convenience fee promo
        fare_data = self.calculate_estimated_fare(route, booking_window, carrier_multiplier=0.97)
        fare_data["convenience_fee"] = 0.0
        fare_data["total_fare"] = round(fare_data["base_fare"] + fare_data["taxes"], 2)
        
        return self.create_fare_record(
            route=route,
            travel_date=travel_date,
            booking_window=booking_window,
            base_fare=fare_data["base_fare"],
            taxes=fare_data["taxes"],
            convenience_fee=fare_data["convenience_fee"],
            flight_number="QP-1102",
            airline_code="QP"
        )
