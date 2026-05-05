import time
import functools
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)

def universal_retry(max_retries: int = 3, delay: float = 1.0, backoff: float = 2.0):
    """
    Decorator for automated retries on cloud adapter operations.
    Handles transient network errors or Cloud API rate limits.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            current_delay = delay
            
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    retries += 1
                    if retries == max_retries:
                        logger.error(f"Critical failure in {func.__name__} after {max_retries} attempts: {e}")
                        raise e
                    
                    logger.warning(f"Transient failure in {func.__name__} (Attempt {retries}/{max_retries}). Retrying in {current_delay}s... Error: {e}")
                    time.sleep(current_delay)
                    current_delay *= backoff
            return None
        return wrapper
    return decorator
