import asyncio
import logging
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from packages.messaging.kafka_client import KafkaConsumerClient
from packages.database.session import async_session_maker
from packages.database.models import Document, Company
from sqlalchemy import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_sec_filing(data: dict):
    logger.info(f"Processing SEC filing: {data.get('metadata', {}).get('ticker')}")
    # Here we would parse data using SECFilingEvent and write to DB
    async with async_session_maker() as session:
        # Example DB interaction logic
        pass

async def run_worker():
    logger.info("Starting FIOS Ingestion Worker...")
    consumer = KafkaConsumerClient(
        group_id="fios-ingestion-group",
        topics=["sec.filings.new.v1", "market.data.quotes.v1", "market.options.flow.v1"]
    )
    
    try:
        while True:
            msg = consumer.consume(timeout=1.0)
            if msg:
                # Based on topic, process accordingly. 
                # For simplicity, just log it.
                logger.debug(f"Consumed message: {msg}")
                if 'metadata' in msg and 'filing_type' in msg['metadata']:
                    await process_sec_filing(msg)
            await asyncio.sleep(0.01)
    except KeyboardInterrupt:
        logger.info("Shutting down worker...")
    finally:
        consumer.close()

if __name__ == "__main__":
    asyncio.run(run_worker())
