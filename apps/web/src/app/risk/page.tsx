"use client";

import React, { useState } from 'react';
import GlassPanel from '@/components/ui/GlassPanel';
import { ShieldAlert, AlertTriangle, CheckCircle, Flame, Loader2 } from 'lucide-react';

export default function RiskPage() {
  const [running, setRunning] = useState<string | null>(null);

  const handleRunStressTest = async (scenario: string) => {
    setRunning(scenario);
    try {
      await fetch('/api/v1/trigger/stress_test', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: scenario })
      });
      // Simulate run delay
      setTimeout(() => setRunning(null), 3000);
    } catch (err) {
      setRunning(null);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-4">
      <div className="flex items-center space-x-3 text-red-400">
        <ShieldAlert className="w-8 h-8" />
        <h1 className="text-2xl font-bold text-white">Live Risk Metrics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassPanel className="p-5 flex flex-col items-center justify-center border-t-2 border-t-red-500">
          <span className="text-gray-400 text-sm mb-1">Portfolio VaR (99%)</span>
          <span className="text-2xl font-bold text-red-400">$245,100</span>
          <span className="text-xs mt-2 text-gray-500">Exceeds threshold by 12%</span>
        </GlassPanel>
        
        <GlassPanel className="p-5 flex flex-col items-center justify-center border-t-2 border-t-emerald-500">
          <span className="text-gray-400 text-sm mb-1">Beta (vs S&P 500)</span>
          <span className="text-2xl font-bold text-emerald-400">0.85</span>
          <span className="text-xs mt-2 text-gray-500">Market Neutral</span>
        </GlassPanel>

        <GlassPanel className="p-5 flex flex-col items-center justify-center border-t-2 border-t-yellow-500">
          <span className="text-gray-400 text-sm mb-1">Sharpe Ratio</span>
          <span className="text-2xl font-bold text-yellow-400">1.4</span>
          <span className="text-xs mt-2 text-gray-500">Last 30 Days</span>
        </GlassPanel>

        <GlassPanel className="p-5 flex flex-col items-center justify-center border-t-2 border-t-red-500">
          <span className="text-gray-400 text-sm mb-1">Max Drawdown</span>
          <span className="text-2xl font-bold text-red-400">-14.2%</span>
          <span className="text-xs mt-2 text-gray-500">Simulated Flash Crash</span>
        </GlassPanel>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="p-6">
          <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500"/> Stress Test Scenarios</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <div>
                <div className="font-medium text-sm text-gray-200">2008 Financial Crisis Replay</div>
                <div className="text-xs text-gray-500">Simulates liquidity shock & credit freeze</div>
              </div>
              <button 
                onClick={() => handleRunStressTest('2008_CRISIS')}
                disabled={running === '2008_CRISIS'}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md text-xs font-medium border border-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {running === '2008_CRISIS' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Run"}
              </button>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <div>
                <div className="font-medium text-sm text-gray-200">Tech Sector -30% Correction</div>
                <div className="text-xs text-gray-500">Sector specific beta shock</div>
              </div>
              <button 
                onClick={() => handleRunStressTest('TECH_CRASH')}
                disabled={running === 'TECH_CRASH'}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md text-xs font-medium border border-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {running === 'TECH_CRASH' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Run"}
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Custom Portfolio Shock</h4>
              <div className="flex gap-3">
                <input type="text" placeholder="Asset (e.g. BTC)" className="w-1/3 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-red-500/50 outline-none" />
                <input type="text" placeholder="Price Drop % (e.g. -50)" className="w-1/3 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-red-500/50 outline-none" />
                <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded text-sm font-medium transition-colors">Simulate</button>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500"/> Compliance & Guardrails</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-gray-300">Max Position Size: 15%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-gray-300">Sector Exposure Limit: &lt;30%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm text-red-400">Leverage Ratio: 2.1x (Limit: 2.0x)</span>
            </div>
          </div>
        </GlassPanel>
      </div>

    </div>
  );
}
