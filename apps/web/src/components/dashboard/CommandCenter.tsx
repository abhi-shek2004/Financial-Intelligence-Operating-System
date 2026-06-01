"use client";

import React, { useState } from 'react';
import GlassPanel from '@/components/ui/GlassPanel';
import { Terminal, ShieldAlert, Cpu } from 'lucide-react';

export default function CommandCenter() {
  const [ticker, setTicker] = useState("AAPL");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleTrigger = async (action: 'research' | 'stress_test') => {
    setLoadingAction(action);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/trigger/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker })
      });
      if (res.ok) {
        console.log(`Triggered ${action} for ${ticker}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <GlassPanel className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-200">Execution Command Center</h2>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Target Asset Ticker</label>
          <input 
            type="text" 
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full bg-black/40 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:border-primary transition-colors"
            placeholder="e.g. AAPL, MSFT"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={() => handleTrigger('research')}
            disabled={loadingAction !== null}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all group"
          >
            <Cpu className={`w-6 h-6 mb-2 text-blue-400 group-hover:text-blue-300 ${loadingAction === 'research' ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-medium text-blue-200 text-center">Execute<br/>Deep Research</span>
          </button>
          
          <button 
            onClick={() => handleTrigger('stress_test')}
            disabled={loadingAction !== null}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all group"
          >
            <ShieldAlert className={`w-6 h-6 mb-2 text-red-400 group-hover:text-red-300 ${loadingAction === 'stress_test' ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-medium text-red-200 text-center">Run Macro<br/>Stress Test</span>
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-500 text-center">
        System Status: <span className="text-emerald-400">All Agents Idle</span>
      </div>
    </GlassPanel>
  );
}
