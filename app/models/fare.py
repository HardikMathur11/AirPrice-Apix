from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, Boolean, ForeignKey, func
from app.database import Base

class ScrapedFare(Base):
    __tablename__ = "scraped_fares"

    fare_id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.route_id"), nullable=True)
    source = Column(String(50), nullable=False)
    source_type = Column(String(10), nullable=False)  # "airline" or "ota"
    travel_date = Column(Date, nullable=False)
    booking_window = Column(String(10), nullable=False)  # "T+1", "T+7", etc.
    base_fare = Column(Numeric(10, 2), nullable=False)
    taxes = Column(Numeric(10, 2), nullable=False)
    convenience_fee = Column(Numeric(10, 2), default=0.0)
    total_fare = Column(Numeric(10, 2), nullable=False)
    fare_class = Column(String(20), default="Economy")
    availability = Column(String(20), default="Available")
    scrape_timestamp = Column(DateTime, server_default=func.now(), index=True)
    is_outlier = Column(Boolean, default=False)
    confidence_score = Column(Numeric(3, 2), default=1.00)
