import numpy as np
from typing import List, Dict, Any

class OutlierDetector:
    @staticmethod
    def detect_outlier(total_fare: float, historical_fares: List[float]) -> bool:
        """
        Detects if a fare is an outlier using Interquartile Range (IQR) method.
        Outlier if total_fare < Q1 - 1.5*IQR or total_fare > Q3 + 1.5*IQR.
        """
        if not historical_fares or len(historical_fares) < 4:
            return False

        fares_arr = np.array(historical_fares, dtype=float)
        q1 = np.percentile(fares_arr, 25)
        q3 = np.percentile(fares_arr, 75)
        iqr = q3 - q1

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        return bool((total_fare < lower_bound) or (total_fare > upper_bound))

    @classmethod
    def process_fare_batch(cls, fare_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process a batch of fare records and flag outliers."""
        if not fare_records:
            return fare_records

        # Group fares by route and booking window to calculate localized IQR
        grouped = {}
        for item in fare_records:
            key = (item.get("route"), item.get("booking_window"))
            grouped.setdefault(key, []).append(item.get("total_fare", 0.0))

        processed = []
        for item in fare_records:
            key = (item.get("route"), item.get("booking_window"))
            historical_fares = grouped.get(key, [])
            total_fare = float(item.get("total_fare", 0.0))
            
            is_outlier = cls.detect_outlier(total_fare, historical_fares)
            item["is_outlier"] = is_outlier
            processed.append(item)

        return processed
