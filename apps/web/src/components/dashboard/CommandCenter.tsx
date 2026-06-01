"use client";

import React, { useState } from 'react';
import GlassPanel from '@/components/ui/GlassPanel';
import { Terminal, ShieldAlert, Cpu, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function CommandCenter() {
  const [ticker, setTicker] = useState("AAPL");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTrigger = async (action: 'research' | 'stress_test') => {
    setLoadingAction(action);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/trigger/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker })
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback({ type: 'success', text: data.message });
      } else {
        setFeedback({ type: 'error', text: `API returned ${res.status}` });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Backend unreachable' });
    } finally {
      setLoadingAction(null);
      // Auto-clear feedback after 5 seconds
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <GlassPanel className="p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-5 h-5 text-primary" />
        <h2 className="text-base font-semibold text-gray-200">Command Center</h2>
      </div>

      <div className="flex-1 flex flex-col space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Target Asset</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full bg-black/40 border border-white/10 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="e.g. AAPL, MSFT"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleTrigger('research')}
            disabled={loadingAction !== null}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all group disabled:opacity-50"
          >
            {loadingAction === 'research'
              ? <Loader2 className="w-6 h-6 mb-1 text-blue-400 animate-spin" />
              : <Cpu className="w-6 h-6 mb-1 text-blue-400 group-hover:text-blue-300" />
            }
            <span className="text-xs font-medium text-blue-200 text-center">Deep Research</span>
          </button>

          <button
            onClick={() => handleTrigger('stress_test')}
            disabled={loadingAction !== null}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all group disabled:opacity-50"
          >
            {loadingAction === 'stress_test'
              ? <Loader2 className="w-6 h-6 mb-1 text-red-400 animate-spin" />
              : <ShieldAlert className="w-6 h-6 mb-1 text-red-400 group-hover:text-red-300" />
            }
            <span className="text-xs font-medium text-red-200 text-center">Stress Test</span>
          </button>
        </div>

        {/* Toast Feedback */}
        {feedback && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium animate-pulse ${
            feedback.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/30'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-500 text-center">
        Status: <span className="text-emerald-400">Agents Idle</span>
      </div>
    </GlassPanel>
  );
}
