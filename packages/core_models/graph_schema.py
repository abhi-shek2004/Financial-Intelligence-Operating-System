from pydantic import BaseModel, Field
from typing import Literal, Optional, Dict, Any

NodeType = Literal["Company", "Executive", "Industry", "Product", "Fund", "MacroIndicator"]
EdgeType = Literal["COMPETES_WITH", "CEO_OF", "OPERATES_IN", "SUPPLIES", "OWNS_SHARES", "PRODUCES"]

class GraphNode(BaseModel):
    node_id: str = Field(..., description="Unique identifier for the node (e.g. ticker or UUID)")
    label: NodeType = Field(..., description="The type of the node")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Attributes of the node")

class GraphEdge(BaseModel):
    source_id: str = Field(..., description="Node ID of the source")
    target_id: str = Field(..., description="Node ID of the target")
    relationship: EdgeType = Field(..., description="Type of relationship")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Attributes of the relationship (e.g. weight, date)")
