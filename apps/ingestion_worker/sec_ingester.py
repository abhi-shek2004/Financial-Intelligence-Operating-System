import asyncio
import httpx
import logging
from datetime import datetime, date
from uuid import uuid4
import sys
import os

# Add the project root to sys.path to import from packages
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from packages.core_models.schemas import SECFilingEvent, SECFilingMetadata
from packages.messaging.kafka_client import KafkaProducerClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SECIngester:
    def __init__(self):
        self.producer = KafkaProducerClient()
        self.topic = "sec.filings.new.v1"
        self.user_agent = "FIOS-Agent contact@fios.ai" # SEC EDGAR requires a User-Agent

    async def fetch_recent_filings(self, ticker: str, cik: str):
        """Simulate fetching recent filings from SEC EDGAR."""
        logger.info(f"Fetching SEC filings for {ticker} (CIK: {cik})")
        # In a real app, we would query the EDGAR API (e.g., https://data.sec.gov/submissions/CIK{cik}.json)
        # Here we simulate the response
        await asyncio.sleep(1)
        
        simulated_filings = [
            SECFilingEvent(
                event_id=str(uuid4()),
                metadata=SECFilingMetadata(
                    ticker=ticker,
                    cik=cik,
                    filing_type="10-K",
                    filing_date=date.today(),
                    url=f"https://www.sec.gov/Archives/edgar/data/{cik}/000123/10k.htm"
                ),
                content="Simulated 10-K HTML content...",
                timestamp=datetime.utcnow()
            )
        ]
        return simulated_filings

    async def run_pipeline(self):
        companies = [
            ("AAPL", "0000320193"),
            ("MSFT", "0000789019")
        ]
        
        for ticker, cik in companies:
            filings = await self.fetch_recent_filings(ticker, cik)
            for filing in filings:
                logger.info(f"Publishing {filing.metadata.filing_type} for {ticker}")
                self.producer.publish_event(self.topic, filing)
        
        self.producer.flush()
        logger.info("SEC Ingestion Pipeline completed.")

if __name__ == "__main__":
    ingester = SECIngester()
    asyncio.run(ingester.run_pipeline())
