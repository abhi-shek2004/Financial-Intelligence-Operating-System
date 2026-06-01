import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from apps.intelligence_api.graph import fios_agent_graph
from packages.database.session import async_session_maker
from packages.database.models import ResearchReport

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def generate_investment_memo(ticker: str):
    """Proactively invokes the LangGraph to generate an investment memo."""
    logger.info(f"Autonomously generating Investment Memo for {ticker}...")
    
    query = f"Generate a comprehensive investment memo for {ticker} including valuation and market sentiment."
    initial_state = {"user_query": query, "messages": []}
    
    # 1. Invoke the Multi-Agent ecosystem
    try:
        final_state = await fios_agent_graph.ainvoke(initial_state)
        # Extract the final output from the verification agent or messages
        output_content = "Mocked Autonomous Memo Output..."
        if "messages" in final_state and len(final_state["messages"]) > 0:
            output_content = final_state["messages"][-1].content

        # 2. Persist to Postgres
        async with async_session_maker() as session:
            report = ResearchReport(
                ticker=ticker,
                report_type="investment_memo",
                content=output_content,
                metadata_json={"source_agents": ["valuation", "market", "equity_research"]}
            )
            session.add(report)
            await session.commit()
            
        logger.info(f"Successfully saved Investment Memo for {ticker}")
    except Exception as e:
        logger.error(f"Failed to generate memo for {ticker}: {e}")

async def run_autonomous_loop():
    """Trigger research tasks on a schedule."""
    logger.info("Starting Autonomous Research Worker...")
    
    # We use APScheduler to run background tasks like cron
    scheduler = AsyncIOScheduler()
    
    # Example: Run AAPL memo generation every hour
    scheduler.add_job(generate_investment_memo, 'interval', hours=1, args=["AAPL"])
    
    # Example: Run MSFT memo generation every hour, offset by 30 mins
    scheduler.add_job(generate_investment_memo, 'cron', minute='30', args=["MSFT"])
    
    scheduler.start()
    
    # Keep the event loop running
    while True:
        await asyncio.sleep(3600)

if __name__ == "__main__":
    asyncio.run(run_autonomous_loop())
