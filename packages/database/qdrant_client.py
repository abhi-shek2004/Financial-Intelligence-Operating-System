import logging
import os
from qdrant_client import AsyncQdrantClient
from qdrant_client.http.models import Distance, VectorParams, OptimizersConfigDiff

logger = logging.getLogger(__name__)

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))

# Initialize the async client
qdrant = AsyncQdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

async def init_qdrant_collections():
    """Ensure the necessary collections exist for hybrid search."""
    collection_name = "financial_documents"
    
    # Dense vector configuration (e.g., BGE-M3 or OpenAI embeddings size)
    vector_size = 1024
    
    try:
        collections = await qdrant.get_collections()
        collection_names = [c.name for c in collections.collections]
        
        if collection_name not in collection_names:
            logger.info(f"Creating Qdrant collection: {collection_name}")
            await qdrant.create_collection(
                collection_name=collection_name,
                vectors_config={
                    "dense": VectorParams(size=vector_size, distance=Distance.COSINE),
                    # sparse vectors don't require size definition in Qdrant 1.7.0+
                },
                sparse_vectors_config={
                    "sparse": {}
                },
                optimizers_config=OptimizersConfigDiff(default_segment_number=2)
            )
            logger.info("Collection created successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Qdrant collections: {e}")

# This could be called during app startup
