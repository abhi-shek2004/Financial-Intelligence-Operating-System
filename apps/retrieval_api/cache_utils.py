import functools
import json
import hashlib
from fastapi import Request, Response
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from packages.database.redis_client import get_redis_client

def cache_response(expire: int = 60):
    """
    L3 Exact Match Cache decorator for FastAPI endpoints.
    Hashes the request body/query and returns cached JSON if available.
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request object to hash body
            request: Request = kwargs.get('request')
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            cache_key = f"api_cache:{func.__name__}"
            
            # If there's a Pydantic model in kwargs (like our QueryRequest)
            # we'll hash it to form a unique cache key
            if 'request' in kwargs and not isinstance(kwargs['request'], Request):
                # It's likely a Pydantic model
                body_str = kwargs['request'].model_dump_json()
                body_hash = hashlib.sha256(body_str.encode()).hexdigest()
                cache_key = f"{cache_key}:{body_hash}"

            redis = get_redis_client()
            cached_val = await redis.get(cache_key)
            
            if cached_val:
                return json.loads(cached_val)
                
            # Execute actual function
            response = await func(*args, **kwargs)
            
            # Cache the response
            if response:
                await redis.setex(cache_key, expire, json.dumps(response))
                
            return response
        return wrapper
    return decorator
