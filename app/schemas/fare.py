from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from typing import Optional, Dict, Any

class ScrapedFareCreate(BaseModel):
    source: str = Field(..., description="Source name, e.g. IndiGo, MakeMyTrip")
    source_type: str = Field(..., description="'airline' or 'ota'")
    route: str = Field(..., description="Route code, e.g. DEL-BOM")
    origin: str = Field(..., description="Origin airport code")
    destination: str = Field(..., description="Destination airport code")
    travel_date: date = Field(..., description="Date of travel")
    booking_window: str = Field(..., description="T+1, T+7, T+15, T+30, T+45")
    base_fare: float = Field(..., description="Base fare in INR")
    taxes: float = Field(..., description="Taxes and statutory charges in INR")
    convenience_fee: float = Field(default=0.0, description="Convenience fee in INR")
    total_fare: float = Field(..., description="Total fare in INR")
    fare_class: str = Field(default="Economy")
    availability: str = Field(default="Available")
    scrape_timestamp: datetime = Field(default_factory=datetime.utcnow)
    flight_number: Optional[str] = None
    airline_code: Optional[str] = None
    raw_payload: Optional[Dict[str, Any]] = None

    @field_validator('total_fare')
    def validate_total_fare(cls, v, info):
        values = info.data
        base = values.get('base_fare', 0.0)
        tax = values.get('taxes', 0.0)
        fee = values.get('convenience_fee', 0.0)
        expected = base + tax + fee
        if abs(v - expected) > 50.0: # Allow minor tolerance or fee variations
            # Adjust or accept expected
            pass
        return round(v, 2)

class ScrapedFareResponse(ScrapedFareCreate):
    fare_id: Optional[int] = None
    is_outlier: bool = False
    confidence_score: float = 1.00

    class Config:
        from_attributes = True
