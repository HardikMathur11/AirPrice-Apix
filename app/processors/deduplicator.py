import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("airprice.deduplicator")

class FareDeduplicator:
    def __init__(self, redis_client=None, ttl_seconds: int = 86400):
        self.redis_client = redis_client
        self.ttl_seconds = ttl_seconds
        self._local_cache = set()

    def generate_key(self, fare_data: Dict[str, Any]) -> str:
        source = str(fare_data.get("source", "unknown")).lower()
        route = str(fare_data.get("route", "unknown")).upper()
        travel_date = str(fare_data.get("travel_date", ""))
        booking_window = str(fare_data.get("booking_window", ""))
        total_fare = str(fare_data.get("total_fare", 0.0))
        return f"dedup:{source}:{route}:{travel_date}:{booking_window}:{total_fare}"

    async def is_duplicate(self, fare_data: Dict[str, Any]) -> bool:
        key = self.generate_key(fare_data)
        
        if self.redis_client is not None:
            try:
                exists = await self.redis_client.get(key)
                if exists:
                    return True
                await self.redis_client.set(key, "1", ex=self.ttl_seconds)
                return False
            except Exception as e:
                logger.debug(f"Redis deduplication fallback to local cache: {e}")

        # Local fallback cache check
        if key in self._local_cache:
            return True
        self._local_cache.add(key)
        return False
