from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime, date

class SECFilingMetadata(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol")
    cik: str = Field(..., description="SEC CIK number")
    filing_type: str = Field(..., description="E.g., 10-K, 10-Q, 8-K")
    filing_date: date = Field(..., description="Date of the filing")
    url: HttpUrl = Field(..., description="URL to the filing on Edgar")

class SECFilingEvent(BaseModel):
    event_id: str = Field(..., description="Unique ID for deduplication")
    metadata: SECFilingMetadata
    content: str = Field(..., description="Full text or HTML content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class OptionsFlowEvent(BaseModel):
    event_id: str
    ticker: str
    strike: float
    expiration: date
    option_type: str = Field(..., description="CALL or PUT")
    premium: float
    volume: int
    open_interest: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MarketDataQuote(BaseModel):
    ticker: str
    price: float
    volume: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
