import logging
from typing import List, Dict, Any
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class SearchIntent(BaseModel):
    intent_type: str = Field(..., description="E.g., 'financial_metrics', 'competitive_analysis', 'supply_chain'")
    entities: List[str] = Field(..., description="Tickers, executives, or products identified in query")
    timeframe: str = Field(default="latest", description="Timeframe of the query (e.g., Q3 2023, last year)")
    requires_graph: bool = Field(default=False, description="Whether this query needs multi-hop reasoning")

class QueryPlan(BaseModel):
    original_query: str
    intent: SearchIntent
    sub_queries: List[str]

class QueryPlanner:
    def __init__(self):
        # We would typically use LangChain/OpenAI here to parse the query
        pass

    async def detect_intent_and_plan(self, query: str) -> QueryPlan:
        """
        Analyze user query and break it down into retrieval sub-queries.
        Example: 'How does Apple's AI strategy compare to MSFT's suppliers?'
        """
        logger.info(f"Planning query: {query}")
        
        # MOCKED INTENT DETECTION for demonstration
        if "compet" in query.lower() or "supplier" in query.lower():
            intent = SearchIntent(
                intent_type="competitive_analysis",
                entities=["AAPL", "MSFT"],
                requires_graph=True
            )
            sub_queries = [
                "Apple AI strategy",
                "Microsoft AI strategy"
            ]
        else:
            intent = SearchIntent(
                intent_type="general_financial",
                entities=["UNKNOWN"],
                requires_graph=False
            )
            sub_queries = [query]

        plan = QueryPlan(
            original_query=query,
            intent=intent,
            sub_queries=sub_queries
        )
        logger.info(f"Generated Plan: {plan.model_dump_json()}")
        return plan
