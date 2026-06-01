# FIOS (Financial Intelligence Operating System)

FIOS is an institutional-grade, multi-agent AI platform built to rival Bloomberg Terminal and Palantir Foundry. It provides autonomous financial analysis, sub-200ms hybrid RAG retrievals, real-time market intelligence, portfolio stress testing, and zero-trust security.

## System Architecture

The platform is split into specialized microservices, coordinated via an API Gateway.

### Backend Infrastructure
- **Message Broker**: Confluent Kafka (Event-driven streaming).
- **Relational DB**: PostgreSQL + SQLAlchemy (Stores User Roles, Audit Logs, and Knowledge Graph representations).
- **Vector DB**: Qdrant (Powers the Hybrid Semantic RAG and ultra-low latency semantic caching).
- **Cache**: Redis Cluster (Caching high-velocity market data).
- **Intelligence Engine**: LangGraph + FastAPI + OpenAI/Gemini APIs (Orchestrates specialist AI agents: Chief Coordinator, Valuation Agent, Market Sentiment Agent).
- **Autonomous Worker**: Background APScheduler polling the stock universe and pre-computing Investment Memos.

### Quantitative Engine
- **Monte Carlo Simulator**: Geometric Brownian Motion (GBM) for Value at Risk (VaR) estimations.
- **Stress Tester**: Computes instantaneous portfolio impact for market crashes (-20%) and interest rate hikes.
- **Portfolio Optimizer**: Mean-Variance optimization for ideal Sharpe-ratio asset weighting.

### Security & Explainability
- **Security**: JWT Authentication, Role-Based Access Control (RBAC), and Audit Logging.
- **Observability**: LangSmith Integration for comprehensive LLM execution tracing.
- **Explainability**: Attribution Engine for exact document citations, and a Hallucination Guard to prevent unverified claims.

### Frontend
- **Framework**: Next.js 15 (React 19).
- **Styling**: Tailwind CSS v4, Glassmorphism, Dark Mode.
- **Components**: Live Agent SSE Chat Stream, Multi-pane Terminal layout.

## Setup & Running

1. **Start Infrastructure**: 
   Ensure PostgreSQL, Redis, Qdrant, and Kafka are running via Docker.
2. **Start Backend**:
   ```bash
   python verify.py # Ensure all syntax is correct
   python apps/api-gateway/main.py # Starts the unified API on port 8000
   ```
3. **Start Frontend**:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

## Production Deployment

This project is configured for cloud deployment across **Vercel** (Frontend) and **Render** (Backend).

### 1. Deploy Frontend to Vercel
Run the following commands to instantly deploy the Next.js UI to a public URL:
```bash
cd apps/web
npx vercel
# Follow the CLI prompts to link your GitHub and deploy.
```

### 2. Deploy Backend to Render
The API Gateway is containerized via Docker and can be automatically deployed to Render.com using Infrastructure-as-Code.
1. Push this repository to GitHub.
2. Log into Render.com and connect your GitHub account.
3. Click **New** -> **Blueprint**.
4. Select this repository. Render will automatically parse the `render.yaml` file, spin up a PostgreSQL instance, and deploy the `Dockerfile` for the Python API Gateway.

## Master Plan Completion

This project was built iteratively across 17 Phases, resulting in a robust, production-ready foundation for quantitative finance AI operations, seamlessly connected from the browser down to the Kafka message brokers!
