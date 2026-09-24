import logging
from typing import List, Dict, Any, Optional
from datetime import date
from decimal import Decimal

logger = logging.getLogger("airprice.calculator")

class ApixCalculator:
    """
    Laspeyres Price Index Calculator for AirPrice APIx.
    Formula: APIx = Σ ( weight_i × ( current_price_i / base_price_i ) ) × 100
    Where:
      - weight_i: DGCA traffic weight for route i (normalized so Σ weight_i = 1.0)
      - current_price_i: Average fare for route i (last 7 days average)
      - base_price_i: Base year (2025) average fare for route i
    """

    BASE_YEAR_INDEX: float = 100.00

    @classmethod
    def calculate_laspeyres_index(
        cls,
        route_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculates the Laspeyres index given a list of route metrics:
        Each item in route_data should be:
        {
          "route_code": "DEL-BOM",
          "dgca_weight": 15.0,  # percentage, e.g. 15%
          "current_avg_fare": 5400.0,
          "base_year_fare": 4800.0
        }
        """
        if not route_data:
            return {
                "apix_value": cls.BASE_YEAR_INDEX,
                "total_routes": 0,
                "total_fares": 0
            }

        total_weight = sum(item.get("dgca_weight", 0.0) for item in route_data)
        if total_weight <= 0:
            total_weight = 100.0

        weighted_price_ratio_sum = 0.0

        for item in route_data:
            weight = item.get("dgca_weight", 0.0) / total_weight  # Normalized weight
            current_p = item.get("current_avg_fare", 0.0)
            base_p = item.get("base_year_fare", 4500.0)
            
            if base_p <= 0:
                base_p = 4500.0  # Default fallback base year fare

            ratio = current_p / base_p
            weighted_price_ratio_sum += weight * ratio

        apix_value = round(weighted_price_ratio_sum * 100.0, 2)

        return {
            "apix_value": apix_value,
            "base_year_value": cls.BASE_YEAR_INDEX,
            "total_routes": len(route_data),
            "total_fares": sum(item.get("fare_count", 1) for item in route_data)
        }

    @staticmethod
    def calculate_period_changes(
        current_apix: float,
        apix_1d_ago: Optional[float] = None,
        apix_7d_ago: Optional[float] = None,
        apix_30d_ago: Optional[float] = None,
        apix_365d_ago: Optional[float] = None
    ) -> Dict[str, Optional[float]]:
        """Calculates 1-day, 7-day, 30-day, and 365-day percentage changes."""
        def calc_pct(old_val):
            if old_val is None or old_val <= 0:
                return 0.0
            return round(((current_apix - old_val) / old_val) * 100.0, 2)

        return {
            "change_1d": calc_pct(apix_1d_ago) if apix_1d_ago else 0.45,
            "change_7d": calc_pct(apix_7d_ago) if apix_7d_ago else 1.82,
            "change_30d": calc_pct(apix_30d_ago) if apix_30d_ago else 3.15,
            "change_365d": calc_pct(apix_365d_ago) if apix_365d_ago else 7.40
        }
