import logging
from typing import Dict, Any
from langchain_core.messages import AIMessage, HumanMessage
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from apps.intelligence_api.state import AgentState

from apps.intelligence_api.xai import AttributionEngine, HallucinationGuard

logger = logging.getLogger(__name__)

attribution_engine = AttributionEngine()
hallucination_guard = HallucinationGuard()

# --- Coordinator Layer ---

def chief_coordinator_node(state: AgentState) -> Dict[str, Any]:
    """The entry point that routes requests to specific specialist agents."""
    logger.info("Chief Coordinator analyzing query...")
    query = state.get("user_query", "").lower()
    
    # Simple routing logic based on keywords
    if "valuation" in query or "dcf" in query:
        next_agent = "valuation_agent"
    elif "news" in query or "sentiment" in query:
        next_agent = "market_agent"
    else:
        next_agent = "equity_research_agent"
        
    return {"next_agent": next_agent}

def planning_node(state: AgentState) -> Dict[str, Any]:
    """Generates a step-by-step execution plan."""
    logger.info("Planning Agent generating execution steps...")
    plan = ["Step 1: Retrieve Data", "Step 2: Analyze", "Step 3: Verify"]
    return {"plan": plan}

def verification_node(state: AgentState) -> Dict[str, Any]:
    """Verifies the final output against hallucinations and generates citations."""
    logger.info("Verification Agent checking for hallucinations and generating citations...")
    
    # Extract latest message from the previous agent
    messages = state.get("messages", [])
    if not messages:
        return {"errors": ["No messages to verify"]}
        
    last_message = messages[-1].content
    mock_context = [{"id": "doc_1", "payload": {"text": "AAPL Q3 Earnings..."}}]
    
    # 1. Hallucination Check
    is_hallucinating, confidence = hallucination_guard.evaluate(last_message, mock_context)
    
    # 2. Attribution Generation
    citations = attribution_engine.calculate_attribution(last_message, mock_context)
    
    errors = []
    if is_hallucinating:
        errors.append(f"Hallucination detected. Confidence score: {confidence}")
        
    return {
        "errors": errors,
        "research_data": {"citations": citations, "confidence": confidence}
    }

# --- Research Layer ---

def equity_research_node(state: AgentState) -> Dict[str, Any]:
    """Compiles fundamental data, SEC filings, and competitor analysis."""
    logger.info("Equity Research Agent compiling fundamentals...")
    response_msg = AIMessage(content="Equity Research Report: Solid fundamentals, high margin.")
    return {"messages": [response_msg], "next_agent": "verification_agent"}

def valuation_node(state: AgentState) -> Dict[str, Any]:
    """Runs DCF models and calculates multiples."""
    logger.info("Valuation Agent running DCF...")
    response_msg = AIMessage(content="Valuation Output: Intrinsic value $215/share based on 10yr DCF.")
    return {"messages": [response_msg], "next_agent": "verification_agent"}

# --- Market Layer ---

def market_agent_node(state: AgentState) -> Dict[str, Any]:
    """Analyzes news, options flow, and macro sentiment."""
    logger.info("Market Agent analyzing sentiment and news...")
    response_msg = AIMessage(content="Market Sentiment: Highly bullish based on recent OTM call volume.")
    return {"messages": [response_msg], "next_agent": "verification_agent"}
