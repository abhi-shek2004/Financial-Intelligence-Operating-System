import logging
from langgraph.graph import StateGraph, END
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from apps.intelligence_api.state import AgentState
from apps.intelligence_api.agents import (
    chief_coordinator_node,
    planning_node,
    verification_node,
    equity_research_node,
    valuation_node,
    market_agent_node
)

logger = logging.getLogger(__name__)

def route_from_coordinator(state: AgentState):
    """Router based on the coordinator's decision."""
    next_agent = state.get("next_agent")
    if next_agent == "valuation_agent":
        return "valuation"
    elif next_agent == "market_agent":
        return "market"
    else:
        return "equity_research"

def build_fios_graph() -> StateGraph:
    """Builds the 20+ agent ecosystem DAG (subset mocked for architecture validation)."""
    
    workflow = StateGraph(AgentState)
    
    # 1. Add Nodes
    workflow.add_node("coordinator", chief_coordinator_node)
    workflow.add_node("planner", planning_node)
    
    # Research Layer
    workflow.add_node("equity_research", equity_research_node)
    workflow.add_node("valuation", valuation_node)
    
    # Market Layer
    workflow.add_node("market", market_agent_node)
    
    # Verification Layer
    workflow.add_node("verifier", verification_node)

    # 2. Define Edges and Routing
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "coordinator")
    
    # Conditional routing from Coordinator to specialist agents
    workflow.add_conditional_edges(
        "coordinator",
        route_from_coordinator,
        {
            "valuation": "valuation",
            "market": "market",
            "equity_research": "equity_research"
        }
    )
    
    # All specialist agents flow into verification
    workflow.add_edge("valuation", "verifier")
    workflow.add_edge("market", "verifier")
    workflow.add_edge("equity_research", "verifier")
    
    # After verification, the graph ends (for now)
    workflow.add_edge("verifier", END)
    
    # Compile the graph
    app = workflow.compile()
    return app

fios_agent_graph = build_fios_graph()
