from fastapi import Request
from functools import wraps
import logging
from packages.database.session import async_session_maker
from packages.database.models import AuditLog

logger = logging.getLogger(__name__)

def audit_log(action: str):
    """
    Decorator to log sensitive operations to the AuditLog database.
    Assumes the decorated endpoint has 'request' and 'user' kwargs injected.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = kwargs.get('user', {})
            request: Request = kwargs.get('request')
            
            user_id = user.get("sub", None) # Assuming sub is the UUID
            
            # Record the audit attempt
            try:
                async with async_session_maker() as session:
                    log_entry = AuditLog(
                        user_id=user_id,
                        action=action,
                        resource=str(request.url) if request else "Unknown",
                        details={"method": request.method if request else ""}
                    )
                    session.add(log_entry)
                    await session.commit()
            except Exception as e:
                logger.error(f"Failed to record audit log: {e}")
                
            # Execute actual function
            return await func(*args, **kwargs)
        return wrapper
    return decorator
