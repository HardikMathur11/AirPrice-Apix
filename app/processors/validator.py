from typing import Tuple, List, Dict, Any

class FareValidator:
    @staticmethod
    def validate(fare_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        errors = []
        
        # Check required fields
        required_fields = ["source", "route", "travel_date", "base_fare", "taxes", "total_fare"]
        for field in required_fields:
            if field not in fare_data or fare_data[field] is None:
                errors.append(f"Missing required field: '{field}'")
                
        if errors:
            return False, errors

        base_fare = float(fare_data.get("base_fare", 0))
        taxes = float(fare_data.get("taxes", 0))
        convenience_fee = float(fare_data.get("convenience_fee", 0))
        total_fare = float(fare_data.get("total_fare", 0))

        # Validate range limits
        if not (1000.0 <= base_fare <= 50000.0):
            errors.append(f"base_fare ₹{base_fare} is out of expected range [₹1000, ₹50000]")

        if not (100.0 <= taxes <= 10000.0):
            errors.append(f"taxes ₹{taxes} is out of expected range [₹100, ₹10000]")

        # Total fare arithmetic validation (±₹10 tolerance)
        expected_total = base_fare + taxes + convenience_fee
        if abs(total_fare - expected_total) > 10.0:
            errors.append(
                f"total_fare (₹{total_fare}) does not match base_fare + taxes + convenience_fee (₹{expected_total:.2f})"
            )

        is_valid = len(errors) == 0
        return is_valid, errors
