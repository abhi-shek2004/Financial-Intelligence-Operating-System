import logging
from typing import List, Dict, Any
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from packages.database.session import async_session_maker
from packages.database.models import GraphNodeModel, GraphEdgeModel
from sqlalchemy import select
from sqlalchemy.orm import aliased

logger = logging.getLogger(__name__)

class GraphRetriever:
    def __init__(self):
        # We will use SQLAlchemy session for graph traversal
        pass

    async def get_node_by_id(self, node_id: str) -> Dict[str, Any]:
        async with async_session_maker() as session:
            result = await session.execute(
                select(GraphNodeModel).where(GraphNodeModel.node_id == node_id)
            )
            node = result.scalars().first()
            if node:
                return {"node_id": node.node_id, "label": node.label, "properties": node.properties}
            return None

    async def get_supplier_network(self, company_node_id: str, depth: int = 1) -> List[Dict[str, Any]]:
        """
        Multi-hop reasoning: Find all suppliers of a company up to a certain depth.
        For depth=1, finds direct suppliers.
        For depth=2, finds suppliers of suppliers.
        """
        async with async_session_maker() as session:
            # Simple depth=1 traversal for now (mocked out full recursive CTE for brevity)
            # In PostgreSQL we would normally use a WITH RECURSIVE query here.
            
            SupplierEdge = aliased(GraphEdgeModel)
            SupplierNode = aliased(GraphNodeModel)
            
            query = (
                select(SupplierNode)
                .join(SupplierEdge, SupplierEdge.source_id == SupplierNode.node_id)
                .where(SupplierEdge.target_id == company_node_id)
                .where(SupplierEdge.relationship == "SUPPLIES")
            )
            
            result = await session.execute(query)
            suppliers = result.scalars().all()
            
            return [
                {"node_id": s.node_id, "label": s.label, "properties": s.properties}
                for s in suppliers
            ]

    async def answer_multi_hop_query(self, query: str) -> str:
        """
        Example: "Who supplies the company that competes with Apple?"
        1. Entity Extraction -> Apple (AAPL)
        2. Find Competitors -> MSFT
        3. Find Suppliers of MSFT -> NVIDIA (NVDA)
        """
        logger.info(f"Executing graph reasoning for query: {query}")
        
        # This is a mocked flow of how the LLM agent would interact with this class.
        # In a full implementation, we'd use an LLM to parse the intent into a Cypher or SQL query.
        
        return "Based on the knowledge graph traversal, NVIDIA supplies Microsoft, which competes with Apple."
