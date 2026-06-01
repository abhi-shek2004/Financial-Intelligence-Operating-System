from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import asyncio
import json
import uuid
from confluent_kafka import Producer
from aiokafka import AIOKafkaConsumer

# Initialize Kafka Producer
kafka_producer = Producer({'bootstrap.servers': 'localhost:9092'})

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from apps.intelligence_api.main import app as intelligence_app
from apps.retrieval_api.main import app as retrieval_app

# Main Gateway Application
gateway_app = FastAPI(title="FIOS API Gateway", version="1.0.0")

# Allow Frontend
gateway_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the sub-applications
gateway_app.mount("/api/v1/intelligence", intelligence_app)
gateway_app.mount("/api/v1/retrieval", retrieval_app)

@gateway_app.get("/health")
async def gateway_health():
    return {"status": "online", "service": "gateway"}

@gateway_app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Initialize aiokafka consumer for this websocket connection
    consumer = AIOKafkaConsumer(
        'fios.logs',
        bootstrap_servers='localhost:9092',
        group_id=f"ui-client-{uuid.uuid4()}",
        auto_offset_reset="latest"
    )
    
    await consumer.start()
    
    try:
        # Acknowledge connection
        await websocket.send_text(json.dumps({"message": "[System] Connected to live Kafka stream.", "timestamp": "now"}))
        
        # Async stream messages from Kafka to the UI
        async for msg in consumer:
            if msg.value:
                payload = msg.value.decode('utf-8')
                # Wrap the raw string in our UI json format
                await websocket.send_text(json.dumps({"message": payload, "timestamp": "now"}))
    except WebSocketDisconnect:
        print("Client disconnected from WebSocket.")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await consumer.stop()

@gateway_app.get("/api/v1/market_data/history")
async def get_historical_market_data(ticker: str = "AAPL", days: int = 100):
    """Generates synthetic historical OHLCV data for charting."""
    import random
    from datetime import datetime, timedelta
    
    data = []
    current_price = 150.0
    # Create dates ending today, moving backwards
    today = datetime.utcnow().date()
    
    # Generate data moving forward from (today - days)
    start_date = today - timedelta(days=days)
    
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        # Skip weekends
        if current_date.weekday() > 4:
            continue
            
        # Random walk for price
        volatility = 0.02
        drift = 0.0005
        
        open_price = current_price
        high_price = open_price * (1 + random.uniform(0, volatility))
        low_price = open_price * (1 - random.uniform(0, volatility))
        close_price = open_price * (1 + random.uniform(-volatility, volatility) + drift)
        
        data.append({
            "time": current_date.strftime("%Y-%m-%d"),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "value": int(random.uniform(1000000, 5000000)) # volume
        })
        
        current_price = close_price
        
    return {"ticker": ticker, "data": data}

from pydantic import BaseModel
class TriggerRequest(BaseModel):
    ticker: str

@gateway_app.post("/api/v1/trigger/research")
async def trigger_research(req: TriggerRequest):
    """Triggers the LangGraph Research Agent by dropping a message on Kafka."""
    payload = json.dumps({"action": "deep_research", "ticker": req.ticker, "job_id": str(uuid.uuid4())})
    kafka_producer.produce('fios.commands', payload.encode('utf-8'))
    kafka_producer.flush()
    return {"status": "success", "message": f"Deep research initiated for {req.ticker} via Kafka", "agent_job_id": "job-123"}

@gateway_app.post("/api/v1/trigger/stress_test")
async def trigger_stress_test(req: TriggerRequest):
    """Triggers the Quantitative Engine Stress Test via Kafka."""
    payload = json.dumps({"action": "stress_test", "ticker": req.ticker, "job_id": str(uuid.uuid4())})
    kafka_producer.produce('fios.commands', payload.encode('utf-8'))
    kafka_producer.flush()
    return {"status": "success", "message": f"Macro stress test initiated for {req.ticker} via Kafka", "agent_job_id": "job-456"}

if __name__ == "__main__":
    import uvicorn
    # The gateway runs on port 8000
    uvicorn.run(gateway_app, host="0.0.0.0", port=8000)
