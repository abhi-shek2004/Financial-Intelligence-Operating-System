from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from apps.intelligence_api.graph import fios_agent_graph
from apps.intelligence_api.digital_twin import router as quant_router

app = FastAPI(title="FIOS Intelligence API", version="1.0.0")

app.include_router(quant_router)

class HealthCheck(BaseModel):
    status: str

class ResearchRequest(BaseModel):
    query: str

@app.get("/health", response_model=HealthCheck)
async def health_check():
    return HealthCheck(status="ok")

@app.post("/api/v1/agent/invoke")
async def invoke_agent(request: ResearchRequest):
    """Synchronous invocation of the LangGraph multi-agent system."""
    initial_state = {"user_query": request.query, "messages": []}
    final_state = await fios_agent_graph.ainvoke(initial_state)
    return final_state

@app.post("/api/v1/agent/stream")
async def stream_agent(request: ResearchRequest):
    """Streams the agent execution steps for real-time UI updates."""
    initial_state = {"user_query": request.query, "messages": []}
    
    async def event_generator():
        async for event in fios_agent_graph.astream_events(initial_state, version="v2"):
            # Stream the events as Server-Sent Events (SSE)
            yield f"data: {json.dumps({'event': event['event'], 'name': event['name']})}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
