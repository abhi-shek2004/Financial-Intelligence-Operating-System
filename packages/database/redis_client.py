import redis.asyncio as redis
import os
import logging

logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "redis_password")

# Create a connection pool
pool = redis.ConnectionPool(
    host=REDIS_HOST, 
    port=REDIS_PORT, 
    password=REDIS_PASSWORD,
    decode_responses=True,
    max_connections=100
)

def get_redis_client() -> redis.Redis:
    """Get an async Redis client from the connection pool."""
    return redis.Redis(connection_pool=pool)
