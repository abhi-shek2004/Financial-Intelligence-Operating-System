from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, BigInteger, Date, ForeignKey, Text, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

Base = declarative_base()

class Company(Base):
    __tablename__ = 'companies'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(10), unique=True, index=True)
    name = Column(String(255))
    sector = Column(String(100))
    industry = Column(String(100))
    cik = Column(String(20))
    market_cap = Column(BigInteger)

class Document(Base):
    __tablename__ = 'documents'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey('companies.id'))
    doc_type = Column(String(50))
    filing_date = Column(Date)
    url = Column(Text)
    processed_status = Column(String(20))

class DocumentChunk(Base):
    __tablename__ = 'document_chunks'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id'))
    content = Column(Text)
    chunk_index = Column(Integer)
    token_count = Column(Integer)

from sqlalchemy.dialects.postgresql import JSONB

class GraphNodeModel(Base):
    __tablename__ = 'graph_nodes'

    node_id = Column(String(255), primary_key=True)
    label = Column(String(50), index=True)
    properties = Column(JSONB, default={})

class GraphEdgeModel(Base):
    __tablename__ = 'graph_edges'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(String(255), ForeignKey('graph_nodes.node_id'), index=True)
    target_id = Column(String(255), ForeignKey('graph_nodes.node_id'), index=True)
    relationship = Column(String(50), index=True)
    properties = Column(JSONB, default={})

class ResearchReport(Base):
    __tablename__ = 'research_reports'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(10), index=True)
    report_type = Column(String(50)) # 'investment_memo', 'market_summary', 'risk_report', 'equity_research'
    content = Column(Text)
    created_at = Column(Date, default=datetime.utcnow)
    metadata_json = Column(JSONB, default={})

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(50), default="analyst") # e.g. admin, trader, analyst
    is_active = Column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), index=True)
    action = Column(String(255))
    resource = Column(String(255))
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(JSONB, default={})
