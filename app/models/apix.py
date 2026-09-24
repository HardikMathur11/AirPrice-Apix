from sqlalchemy import Column, Integer, Numeric, Date, DateTime, func
from app.database import Base

class DailyApix(Base):
    __tablename__ = "daily_apix"

    apix_id = Column(Integer, primary_key=True, index=True)
    calculation_date = Column(Date, unique=True, nullable=False, index=True)
    apix_value = Column(Numeric(6, 2), nullable=False)
    base_year_value = Column(Numeric(6, 2), default=100.00, nullable=False)
    change_1d = Column(Numeric(6, 2), nullable=True)
    change_7d = Column(Numeric(6, 2), nullable=True)
    change_30d = Column(Numeric(6, 2), nullable=True)
    change_365d = Column(Numeric(6, 2), nullable=True)
    total_routes = Column(Integer, nullable=False)
    total_fares = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
