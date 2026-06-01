import asyncio
import logging
import random
from datetime import datetime, date
from uuid import uuid4
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from packages.core_models.schemas import MarketDataQuote, OptionsFlowEvent
from packages.messaging.kafka_client import KafkaProducerClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketDataIngester:
    def __init__(self):
        self.producer = KafkaProducerClient()
        self.market_topic = "market.data.quotes.v1"
        self.options_topic = "market.options.flow.v1"
        self.tickers = ["AAPL", "MSFT", "NVDA", "TSLA"]

    async def stream_market_data(self):
        """Simulate real-time streaming of market data (ticks and options flow)."""
        logger.info("Starting Market Data Stream...")
        while True:
            for ticker in self.tickers:
                # Simulate a price tick
                quote = MarketDataQuote(
                    ticker=ticker,
                    price=round(random.uniform(100.0, 500.0), 2),
                    volume=random.randint(100, 5000),
                    timestamp=datetime.utcnow()
                )
                self.producer.publish_event(self.market_topic, quote)
                logger.debug(f"Published quote for {ticker}: {quote.price}")

                # Simulate options flow block trade occasionally (20% chance)
                if random.random() < 0.2:
                    option = OptionsFlowEvent(
                        event_id=str(uuid4()),
                        ticker=ticker,
                        strike=round(quote.price + random.choice([-10, 10, -5, 5]), 2),
                        expiration=date(2026, 12, 18),
                        option_type=random.choice(["CALL", "PUT"]),
                        premium=round(random.uniform(1.0, 15.0), 2),
                        volume=random.randint(500, 10000),
                        open_interest=random.randint(1000, 50000),
                        timestamp=datetime.utcnow()
                    )
                    self.producer.publish_event(self.options_topic, option)
                    logger.info(f"Published LARGE options flow block for {ticker}")

            # Stream at roughly 1 tick per second
            await asyncio.sleep(1)

if __name__ == "__main__":
    ingester = MarketDataIngester()
    asyncio.run(ingester.stream_market_data())
