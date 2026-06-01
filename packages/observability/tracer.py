import os
import logging
from langsmith import Client

logger = logging.getLogger(__name__)

def setup_langsmith():
    """Initializes LangSmith tracing if API key is present."""
    langchain_tracing_v2 = os.getenv("LANGCHAIN_TRACING_V2", "false")
    if langchain_tracing_v2.lower() == "true":
        logger.info("Initializing LangSmith observability...")
        os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
        os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT", "fios-platform")
        
        # Ensures that the client is instantiated (it reads from env vars)
        try:
            client = Client()
            return client
        except Exception as e:
            logger.warning(f"Failed to initialize LangSmith client: {e}")
    else:
        logger.info("LangSmith tracing is disabled (LANGCHAIN_TRACING_V2 != true).")
        return None
