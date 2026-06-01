import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)

class MonteCarloSimulator:
    def __init__(self, num_simulations: int = 10000, time_horizon: int = 252):
        self.num_simulations = num_simulations
        self.time_horizon = time_horizon # days in a trading year

    def simulate_gbm(self, current_price: float, mu: float, sigma: float) -> np.ndarray:
        """
        Simulate Geometric Brownian Motion (GBM) for a single asset.
        """
        logger.info(f"Running {self.num_simulations} Monte Carlo simulations for price {current_price}")
        
        # Calculate daily drift and volatility
        dt = 1 / self.time_horizon
        drift = (mu - 0.5 * sigma**2) * dt
        vol = sigma * np.sqrt(dt)
        
        # Generate random shock matrix
        Z = np.random.normal(0, 1, (self.time_horizon, self.num_simulations))
        
        # Calculate daily returns
        daily_returns = np.exp(drift + vol * Z)
        
        # Calculate price paths
        price_paths = np.zeros_like(daily_returns)
        price_paths[0] = current_price
        
        for t in range(1, self.time_horizon):
            price_paths[t] = price_paths[t-1] * daily_returns[t]
            
        return price_paths

    def calculate_var(self, price_paths: np.ndarray, confidence_level: float = 0.95) -> float:
        """Calculate Value at Risk (VaR) from simulation paths."""
        final_prices = price_paths[-1]
        initial_price = price_paths[0][0]
        returns = (final_prices - initial_price) / initial_price
        var = np.percentile(returns, (1 - confidence_level) * 100)
        return var
