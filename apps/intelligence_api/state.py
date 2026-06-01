from typing import TypedDict, Annotated, List, Dict, Any
from langchain_core.messages import BaseMessage
import operator

# Reducer function to append new messages instead of overwriting
def add_messages(left: List[BaseMessage], right: List[BaseMessage]) -> List[BaseMessage]:
    return left + right

def dict_update(left: Dict[str, Any], right: Dict[str, Any]) -> Dict[str, Any]:
    return {**left, **right}

class AgentState(TypedDict):
    """
    The state shared across all agents in the Financial Intelligence ecosystem.
    """
    # Chat history and context
    messages: Annotated[List[BaseMessage], add_messages]
    
    # Original user request
    user_query: str
    
    # Current active sub-task or plan
    plan: List[str]
    
    # Research data accumulated by the agents (e.g. SEC filings, prices)
    research_data: Annotated[Dict[str, Any], dict_update]
    
    # Errors or validation failures to handle
    errors: List[str]
    
    # The next agent to route to
    next_agent: str
