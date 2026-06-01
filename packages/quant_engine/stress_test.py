import numpy as np
import logging

logger = logging.getLogger(__name__)

class StressTestEngine:
    def __init__(self):
        pass

    def apply_market_shock(self, portfolio_weights: np.ndarray, base_returns: np.ndarray, shock_factor: float = -0.20) -> float:
        """
        Simulate a sudden broad market crash (e.g. -20% drop).
        Returns the shocked portfolio value assuming an initial value of 1.0.
        """
        logger.info(f"Applying market shock of {shock_factor * 100}%")
        # Simplified beta adjustment for a shock
        shocked_returns = base_returns + shock_factor
        portfolio_return = np.dot(portfolio_weights, shocked_returns.mean(axis=0))
        return 1.0 + portfolio_return

    def apply_interest_rate_hike(self, duration_vector: np.ndarray, portfolio_weights: np.ndarray, rate_change: float = 0.01) -> float:
        """
        Simulate an interest rate hike and its impact on fixed-income and equity valuations (via duration approximation).
        """
        logger.info(f"Applying interest rate hike of {rate_change * 10000} bps")
        # Price change approx = -Duration * Yield Change
        price_impacts = -duration_vector * rate_change
        portfolio_impact = np.dot(portfolio_weights, price_impacts)
        return 1.0 + portfolio_impact
