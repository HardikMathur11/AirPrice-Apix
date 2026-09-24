from typing import Dict, Any

class FareNormalizer:
    @staticmethod
    def normalize(fare_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize field values (uppercase route codes, round floats)."""
        normalized = dict(fare_data)
        
        if "route" in normalized and isinstance(normalized["route"], str):
            normalized["route"] = normalized["route"].upper().strip()
            
        if "origin" in normalized and isinstance(normalized["origin"], str):
            normalized["origin"] = normalized["origin"].upper().strip()

        if "destination" in normalized and isinstance(normalized["destination"], str):
            normalized["destination"] = normalized["destination"].upper().strip()

        for price_field in ["base_fare", "taxes", "convenience_fee", "total_fare"]:
            if price_field in normalized and normalized[price_field] is not None:
                normalized[price_field] = round(float(normalized[price_field]), 2)
                
        return normalized
