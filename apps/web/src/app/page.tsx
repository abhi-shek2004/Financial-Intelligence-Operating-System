"use client";

import React, { useState, useEffect } from 'react';
import MetricCard from '@/components/dashboard/MetricCard';
import AgentChatStream from '@/components/dashboard/AgentChatStream';
import TradingChart from '@/components/dashboard/TradingChart';
import CommandCenter from '@/components/dashboard/CommandCenter';
import GlassPanel from '@/components/ui/GlassPanel';
import { Activity, DollarSign, BarChart3, TrendingUp } from 'lucide-react';

export default function Home() {
  const [var95, setVar95] = useState<string>("Loading...");
  const [expectedValue, setExpectedValue] = useState<string>("Loading...");
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Fetch Monte Carlo Simulation from Digital Twin Backend
    const fetchQuantData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/intelligence/api/v1/quant/monte_carlo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assets: ["AAPL", "MSFT", "GOOGL"],
            weights: [0.4, 0.4, 0.2],
            total_value: 12400000
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setVar95(`$${(data.var95 * 100).toFixed(2)}%`);
          setExpectedValue(`$${(data.expected_value / 1000000).toFixed(1)}M`);
        } else {
          setVar95("API Error");
          setExpectedValue("API Error");
        }
      } catch (err) {
        console.error("Failed to fetch quant data", err);
        setVar95("Offline");
        setExpectedValue("Offline");
      }
    };

    const fetchMarketData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/market_data/history?ticker=AAPL&days=100");
        if (response.ok) {
          const result = await response.json();
          setChartData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch market data", err);
      }
    };
    
    fetchQuantData();
    fetchMarketData();
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Expected Portfolio Value" value={expectedValue} change="Simulated" trend="up" icon={<DollarSign />} />
        <MetricCard title="Risk Exposure (VaR 95%)" value={var95} change="10,000 paths" trend="down" icon={<Activity />} />
        <MetricCard title="Active Agents" value="14" icon={<Activity />} />
        <MetricCard title="Market Sentiment" value="Bullish" change="High Volatility" trend="up" icon={<TrendingUp />} />
      </div>

      {/* Main Terminal Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        
        {/* Left Column: Charts/Analysis */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          <GlassPanel className="flex-1 p-6 flex flex-col relative overflow-hidden group">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Real-Time Market Data: AAPL (Simulated)</h2>
            <div className="flex-1 flex flex-col mt-2 relative">
              <TradingChart data={chartData} />
            </div>
          </GlassPanel>
        </div>

        {/* Right Column: Agent Stream & Command Center */}
        <div className="h-full flex flex-col space-y-4">
          <div className="h-2/3">
            <AgentChatStream />
          </div>
          <div className="h-1/3">
            <CommandCenter />
          </div>
        </div>
        
      </div>
    </div>
  );
}
