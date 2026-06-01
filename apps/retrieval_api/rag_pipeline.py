import logging
from typing import List, Dict, Any
from apps.retrieval_api.query_planner import QueryPlanner
from apps.retrieval_api.hybrid_retriever import HybridRetriever
from apps.retrieval_api.graph_retriever import GraphRetriever
from apps.retrieval_api.semantic_cache import SemanticCache

logger = logging.getLogger(__name__)

class RAGPipeline:
    def __init__(self):
        self.planner = QueryPlanner()
        self.hybrid_retriever = HybridRetriever()
        self.graph_retriever = GraphRetriever()
        self.semantic_cache = SemanticCache()

    async def cross_encoder_rerank(self, query: str, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Mock cross-encoder reranking (e.g., using Cohere or sentence-transformers)."""
        logger.info(f"Reranking {len(documents)} documents for query: {query}")
        # Normally we'd run the cross encoder model to generate a relevance score
        # For simulation, we just sort them (they're already mocked)
        return sorted(documents, key=lambda x: x.get("score", 0), reverse=True)

    async def compress_context(self, query: str, documents: List[Dict[str, Any]]) -> str:
        """Mock context compression (e.g., LLMLingua) to remove noise and reduce token count."""
        logger.info("Compressing context")
        compressed_text = []
        for doc in documents:
            payload = doc.get("payload", {}).get("text", "")
            if payload:
                compressed_text.append(payload)
        return "\n".join(compressed_text)

    async def execute(self, user_query: str) -> Dict[str, Any]:
        logger.info(f"Executing RAG pipeline for query: {user_query}")
        
        # 0. Check Semantic Cache
        cached_response = await self.semantic_cache.get(user_query)
        if cached_response:
            logger.info("Semantic cache HIT! Bypassing retrieval.")
            return cached_response
            
        # 1. Intent Detection & Query Planning
        plan = await self.planner.detect_intent_and_plan(user_query)
        
        # 2. Parallel Retrieval
        retrieved_docs = []
        for sub_query in plan.sub_queries:
            docs = await self.hybrid_retriever.search(sub_query)
            retrieved_docs.extend(docs)
            
        graph_context = ""
        if plan.intent.requires_graph:
            graph_context = await self.graph_retriever.answer_multi_hop_query(user_query)
            
        # 3. Cross-Encoder Reranking
        reranked_docs = await self.cross_encoder_rerank(user_query, retrieved_docs)
        
        # 4. Context Compression
        compressed_context = await self.compress_context(user_query, reranked_docs)
        
        # 5. Final Generation Setup (Mocked output)
        final_context = f"Graph Context:\n{graph_context}\n\nDocument Context:\n{compressed_context}"
        
        response = {
            "query": user_query,
            "plan": plan.model_dump(),
            "context": final_context,
            "status": "success",
            "cache_hit": False
        }
        
        # Asynchronously store in semantic cache for future
        await self.semantic_cache.set(user_query, response)
        
        return response
