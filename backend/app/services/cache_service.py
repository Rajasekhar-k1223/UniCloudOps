import json
import logging
import redis
from typing import Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self.redis_client = None
        if settings.REDIS_URL:
            try:
                self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                self.redis_client.ping()
                logger.info("Intelligence Cache: Secure link to Redis boundary established.")
            except Exception as e:
                logger.error(f"Intelligence Cache Failure: Could not link to Redis: {e}")

    def get(self, key: str) -> Optional[Any]:
        if not self.redis_client:
            return None
        try:
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Cache Retrieve Failure: {e}")
            return None

    def set(self, key: str, value: Any, ttl_seconds: int = 3600):
        if not self.redis_client:
            return
        try:
            self.redis_client.set(key, json.dumps(value), ex=ttl_seconds)
        except Exception as e:
            logger.error(f"Cache Store Failure: {e}")

    def delete(self, key: str):
        if not self.redis_client:
            return
        try:
            self.redis_client.delete(key)
        except Exception as e:
            logger.error(f"Cache Deletion Failure: {e}")

    def delete_pattern(self, pattern: str):
        if not self.redis_client:
            return
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Cache Invalidation: Purged {len(keys)} tactical keys matching '{pattern}'")
        except Exception as e:
            logger.error(f"Cache Invalidation Failure for pattern '{pattern}': {e}")

cache_service = CacheService()
