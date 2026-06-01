"use client";

import React, { useState, useEffect } from 'react';
import GlassPanel from '@/components/ui/GlassPanel';
import { TrendingUp, Activity, BarChart3, Globe, Search } from 'lucide-react';
import TradingChart from '@/components/dashboard/TradingChart';

export default function MarketsPage() {
  const [ticker, setTicker] = useState("AAPL");
  const [searchInput, setSearchInput] = useState("");
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/market_data/history?ticker=${ticker}&days=100`);
        const result = await res.json();
        if (result.data) {
          setMarketData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch market data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, [ticker]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTicker(searchInput.toUpperCase());
      setSearchInput("");
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-emerald-400">
          <TrendingUp className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-white">Global Markets Overview</h1>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={`Search Ticker (Current: ${ticker})`}
            className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "S&P 500", value: "5,432.10", change: "+1.2%", up: true },
          { title: "NASDAQ", value: "17,123.45", change: "+1.8%", up: true },
          { title: "VIX", value: "12.45", change: "-5.2%", up: false },
          { title: "US 10Y Yield", value: "4.21%", change: "+0.03", up: true },
        ].map((idx) => (
          <GlassPanel key={idx.title} className="p-5 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-sm mb-1">{idx.title}</span>
            <span className="text-2xl font-bold text-white">{idx.value}</span>
            <span className={`text-sm mt-2 font-medium ${idx.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {idx.change}
            </span>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="flex-1 p-6 flex flex-col relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-gray-200">{ticker} Market Data (Simulation)</h3>
        </div>
        <div className="flex-1 w-full relative">
          <TradingChart data={marketData} />
        </div>
      </GlassPanel>
    </div>
  );
}
