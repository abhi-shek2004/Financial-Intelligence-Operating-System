from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from apps.retrieval_api.rag_pipeline import RAGPipeline
from apps.retrieval_api.cache_utils import cache_response

app = FastAPI(title="FIOS Retrieval API", version="1.0.0")
rag_pipeline = RAGPipeline()

class HealthCheck(BaseModel):
    status: str

class QueryRequest(BaseModel):
    query: str

@app.get("/health", response_model=HealthCheck)
async def health_check():
    return HealthCheck(status="ok")

@app.post("/api/v1/research/query")
@cache_response(expire=60)
async def execute_query(request: QueryRequest) -> Dict[str, Any]:
    return await rag_pipeline.execute(request.query)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
