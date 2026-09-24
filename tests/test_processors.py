import pytest
from app.processors.validator import FareValidator
from app.processors.deduplicator import FareDeduplicator
from app.processors.normalizer import FareNormalizer
from app.processors.outlier import OutlierDetector

def test_fare_validator_valid():
    valid_data = {
        "source": "IndiGo",
        "route": "DEL-BOM",
        "travel_date": "2026-09-10",
        "base_fare": 4500.0,
        "taxes": 900.0,
        "convenience_fee": 0.0,
        "total_fare": 5400.0
    }
    is_valid, errors = FareValidator.validate(valid_data)
    assert is_valid is True
    assert len(errors) == 0

def test_fare_validator_invalid_range():
    invalid_data = {
        "source": "IndiGo",
        "route": "DEL-BOM",
        "travel_date": "2026-09-10",
        "base_fare": 500.0,  # Below ₹1000 minimum limit
        "taxes": 50.0,      # Below ₹100 minimum limit
        "convenience_fee": 0.0,
        "total_fare": 550.0
    }
    is_valid, errors = FareValidator.validate(invalid_data)
    assert is_valid is False
    assert len(errors) > 0

@pytest.mark.asyncio
async def test_fare_deduplicator():
    dedup = FareDeduplicator()
    fare = {
        "source": "MakeMyTrip",
        "route": "DEL-BLR",
        "travel_date": "2026-09-15",
        "booking_window": "T+7",
        "total_fare": 6200.00
    }
    
    # First check: not duplicate
    is_dup1 = await dedup.is_duplicate(fare)
    assert is_dup1 is False

    # Second check: is duplicate
    is_dup2 = await dedup.is_duplicate(fare)
    assert is_dup2 is True

def test_outlier_detector():
    historical = [4500.0, 4600.0, 4700.0, 4800.0, 4900.0, 5000.0, 5100.0]
    normal_fare = 4800.0
    extreme_outlier = 25000.0  # Excessive spike

    assert OutlierDetector.detect_outlier(normal_fare, historical) is False
    assert OutlierDetector.detect_outlier(extreme_outlier, historical) is True
