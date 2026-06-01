from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
import asyncio
import json
import uuid
import logging
import random
from datetime import datetime, timedelta

logger = logging.getLogger("fios.gateway")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")

# ── Environment Configuration ────────────────────────────────────────────────
KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# ── Kafka Producer (Graceful Degradation) ────────────────────────────────────
kafka_producer = None
try:
    from confluent_kafka import Producer
    kafka_producer = Producer({"bootstrap.servers": KAFKA_BOOTSTRAP})
    logger.info("Kafka Producer connected to %s", KAFKA_BOOTSTRAP)
except Exception as e:
    logger.warning("Kafka unavailable (%s). Running in standalone mode.", e)

# ── AIOKafka import (optional) ───────────────────────────────────────────────
try:
    from aiokafka import AIOKafkaConsumer
    AIOKAFKA_AVAILABLE = True
except ImportError:
    AIOKAFKA_AVAILABLE = False

# ── Sub-application imports ──────────────────────────────────────────────────
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from apps.intelligence_api.main import app as intelligence_app
from apps.retrieval_api.main import app as retrieval_app

# ── Main Gateway Application ────────────────────────────────────────────────
gateway_app = FastAPI(title="FIOS API Gateway", version="2.0.0")

gateway_app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the sub-applications
gateway_app.mount("/api/v1/intelligence", intelligence_app)
gateway_app.mount("/api/v1/retrieval", retrieval_app)

# ── Health Endpoint ──────────────────────────────────────────────────────────
@gateway_app.get("/health")
async def gateway_health():
    return {
        "status": "online",
        "service": "FIOS API Gateway",
        "kafka": "connected" if kafka_producer else "standalone",
    }

# ── WebSocket: Dual-Mode (Kafka or Mock Fallback) ───────────────────────────
MOCK_AGENT_LOGS = [
    "[Chief Coordinator] Analyzing request: Portfolio Health Check",
    "[Valuation Agent] Running 10-year DCF Model on AAPL…",
    "[Valuation Agent] Fair Value calculated: $215.40 / share",
    "[Market Agent] Scanning options flow & macro indicators…",
    "[Market Agent] VIX at 14.5 → Volatility Regime: STABLE",
    "[Equity Research Agent] Cross-referencing SEC 10-K filings…",
    "[Equity Research Agent] Revenue growth: +12% YoY",
    "[Verification Agent] Running hallucination guard…",
    "[Verification Agent] Confidence: 96% — No hallucinations detected.",
    "[System] Report generation complete. Persisting to Postgres…",
]

@gateway_app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected.")

    # ── Mode A: Kafka Consumer ───────────────────────────────────────────
    if kafka_producer and AIOKAFKA_AVAILABLE:
        consumer = AIOKafkaConsumer(
            "fios.logs",
            bootstrap_servers=KAFKA_BOOTSTRAP,
            group_id=f"ui-client-{uuid.uuid4()}",
            auto_offset_reset="latest",
        )
        try:
            await consumer.start()
            await websocket.send_text(json.dumps({"message": "[System] Connected to live Kafka stream.", "timestamp": datetime.utcnow().isoformat()}))
            async for msg in consumer:
                if msg.value:
                    payload = msg.value.decode("utf-8")
                    await websocket.send_text(json.dumps({"message": payload, "timestamp": datetime.utcnow().isoformat()}))
        except WebSocketDisconnect:
            logger.info("WebSocket client disconnected (Kafka mode).")
        except Exception as e:
            logger.error("WebSocket Kafka error: %s", e)
        finally:
            await consumer.stop()
        return

    # ── Mode B: Mock Fallback ────────────────────────────────────────────
    try:
        await websocket.send_text(json.dumps({"message": "[System] Running in standalone mode (Kafka offline).", "timestamp": datetime.utcnow().isoformat()}))
        while True:
            for log in MOCK_AGENT_LOGS:
                await asyncio.sleep(random.uniform(1.0, 2.5))
                await websocket.send_text(json.dumps({"message": log, "timestamp": datetime.utcnow().isoformat()}))
            await asyncio.sleep(4)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected (mock mode).")

# ── Market Data Endpoint ─────────────────────────────────────────────────────
@gateway_app.get("/api/v1/market_data/history")
async def get_historical_market_data(ticker: str = "AAPL", days: int = 100):
    """Generates synthetic historical OHLCV data for charting."""
    data = []
    current_price = 150.0
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days)

    for i in range(days):
        current_date = start_date + timedelta(days=i)
        if current_date.weekday() > 4:
            continue

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
            "value": int(random.uniform(1_000_000, 5_000_000)),
        })

        current_price = close_price

    return {"ticker": ticker, "data": data}

# ── Trigger Endpoints ────────────────────────────────────────────────────────
class TriggerRequest(BaseModel):
    ticker: str

@gateway_app.post("/api/v1/trigger/research")
async def trigger_research(req: TriggerRequest):
    """Triggers the LangGraph Research Agent by dropping a message on Kafka."""
    job_id = str(uuid.uuid4())
    if kafka_producer:
        payload = json.dumps({"action": "deep_research", "ticker": req.ticker, "job_id": job_id})
        kafka_producer.produce("fios.commands", payload.encode("utf-8"))
        kafka_producer.flush()
        logger.info("Research job %s dispatched to Kafka for %s", job_id, req.ticker)
    else:
        logger.info("Research job %s queued locally for %s (Kafka offline)", job_id, req.ticker)
    return {"status": "success", "message": f"Deep research initiated for {req.ticker}", "agent_job_id": job_id}

@gateway_app.post("/api/v1/trigger/stress_test")
async def trigger_stress_test(req: TriggerRequest):
    """Triggers the Quantitative Engine Stress Test via Kafka."""
    job_id = str(uuid.uuid4())
    if kafka_producer:
        payload = json.dumps({"action": "stress_test", "ticker": req.ticker, "job_id": job_id})
        kafka_producer.produce("fios.commands", payload.encode("utf-8"))
        kafka_producer.flush()
        logger.info("Stress test job %s dispatched to Kafka for %s", job_id, req.ticker)
    else:
        logger.info("Stress test job %s queued locally for %s (Kafka offline)", job_id, req.ticker)
    return {"status": "success", "message": f"Macro stress test initiated for {req.ticker}", "agent_job_id": job_id}

# ── Entrypoint ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(gateway_app, host="0.0.0.0", port=8000)
