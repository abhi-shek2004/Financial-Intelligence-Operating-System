"use client";

import React, { useState } from 'react';
import GlassPanel from '@/components/ui/GlassPanel';
import { Search, Database, Bot, Send, Loader2, FileText } from 'lucide-react';

export default function ResearchPage() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [investigations, setInvestigations] = useState([
    { asset: "AAPL", topic: "Supply Chain Risk Assessment", status: "In Progress", progress: 65 },
    { asset: "NVDA", topic: "Data Center Revenue Projections", status: "Drafting Report", progress: 90 },
    { asset: "TSLA", topic: "Macro Sensitivity Analysis", status: "Gathering Data", progress: 30 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/v1/trigger/research', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.toUpperCase() })
      });
      
      if (res.ok) {
        setInvestigations(prev => [
          { asset: ticker.toUpperCase(), topic: "Deep Multi-Agent Analysis", status: "Initializing", progress: 5 },
          ...prev
        ]);
        setTicker("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-4">
      <div className="flex items-center space-x-3 text-purple-400">
        <Search className="w-8 h-8" />
        <h1 className="text-2xl font-bold text-white">Autonomous Research Desk</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <GlassPanel className="p-6">
            <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              Launch New Investigation
            </h3>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Enter Asset Ticker (e.g. MSFT)"
                className="flex-1 bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500/50"
              />
              <button 
                type="submit"
                disabled={loading || !ticker.trim()}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Analyze
              </button>
            </form>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h3 className="font-semibold text-gray-200 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Active Investigations
            </h3>
            <div className="space-y-4">
              {investigations.map((item, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between mb-2 relative z-10">
                    <span className="font-medium text-gray-200">{item.asset} <span className="text-gray-500 mx-2">|</span> <span className="text-sm font-normal text-gray-300">{item.topic}</span></span>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">{item.status}</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-1.5 relative z-10">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        <GlassPanel className="p-6 flex flex-col items-center justify-center text-center">
          <Database className="w-12 h-12 text-purple-500/50 mb-4" />
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Knowledge Graph</h3>
          <p className="text-sm text-gray-400 mb-6">
            Connecting semantic relationships across 10-K filings, earnings calls, and news.
          </p>
          <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors text-sm w-full font-medium">
            Explore Graph (Coming Soon)
          </button>
        </GlassPanel>
      </div>
    </div>
  );
}
