from sqlalchemy import Column, Integer, String, Numeric, DateTime, func
from app.database import Base

class Route(Base):
    __tablename__ = "routes"

    route_id = Column(Integer, primary_key=True, index=True)
    route_code = Column(String(10), unique=True, nullable=False, index=True)  # e.g., "DEL-BOM"
    origin = Column(String(10), nullable=False)  # e.g., "DEL"
    destination = Column(String(10), nullable=False)  # e.g., "BOM"
    dgca_weight = Column(Numeric(5, 2), nullable=False)  # e.g., 15.0
    tier = Column(String(10), nullable=False)  # "Tier-1" or "Tier-2"
    created_at = Column(DateTime, server_default=func.now())
