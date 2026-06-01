from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from packages.quant_engine.monte_carlo import MonteCarloSimulator
from packages.quant_engine.stress_test import StressTestEngine
from packages.quant_engine.optimization import PortfolioOptimizer

router = APIRouter(prefix="/api/v1/quant", tags=["Digital Twin"])

mc_engine = MonteCarloSimulator()
stress_engine = StressTestEngine()
opt_engine = PortfolioOptimizer()

class PortfolioRequest(BaseModel):
    assets: List[str]
    weights: List[float]
    total_value: float

@router.post("/monte_carlo")
async def run_monte_carlo(req: PortfolioRequest):
    """Run Monte Carlo simulations to estimate VaR."""
    # Mock parameters
    mu = 0.08
    sigma = 0.20
    
    paths = mc_engine.simulate_gbm(req.total_value, mu, sigma)
    var_95 = mc_engine.calculate_var(paths, 0.95)
    
    return {
        "status": "success",
        "var_95": float(var_95),
        "expected_value": float(np.mean(paths[-1]))
    }

@router.post("/stress_test")
async def run_stress_test(req: PortfolioRequest, shock_factor: float = -0.20):
    """Apply an instantaneous shock to the portfolio."""
    weights = np.array(req.weights)
    # Mock base returns
    base_returns = np.random.normal(0.001, 0.02, (100, len(weights)))
    
    shocked_value = stress_engine.apply_market_shock(weights, base_returns, shock_factor)
    
    return {
        "status": "success",
        "shock_factor": shock_factor,
        "shocked_portfolio_multiplier": float(shocked_value),
        "new_value": float(shocked_value * req.total_value)
    }

@router.post("/optimize")
async def optimize_portfolio(req: PortfolioRequest, target_return: float = 0.10):
    """Run Mean-Variance Optimization."""
    num_assets = len(req.assets)
    # Mock expectations
    expected_returns = np.random.uniform(0.05, 0.15, num_assets)
    
    # Generate positive semi-definite mock cov matrix
    random_matrix = np.random.rand(num_assets, num_assets)
    cov_matrix = np.dot(random_matrix, random_matrix.transpose()) * 0.04
    
    optimal_weights = opt_engine.mean_variance_optimization(expected_returns, cov_matrix, target_return)
    
    return {
        "status": "success",
        "optimal_weights": optimal_weights.tolist()
    }
