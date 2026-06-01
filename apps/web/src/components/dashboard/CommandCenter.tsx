"use client";

import React, { useState } from 'react';
import GlassPanel from '@/components/ui/GlassPanel';
import { Terminal, ShieldAlert, Cpu, CheckCircle, XCircle, Loader2, Send } from 'lucide-react';

export default function CommandCenter() {
  const [query, setQuery] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);

  const handleQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoadingAction('query');
    setFeedback(null);
    setAgentResponse(null);
    
    try {
      // Hit the LangGraph agent endpoint mounted on the API Gateway
      const res = await fetch(`/api/v1/intelligence/api/v1/agent/invoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Assuming LangGraph returns {"messages": [{"content": "...", "type": "ai"}]}
        // Fallback to raw string if it's a direct response
        const answer = data.messages && data.messages.length > 0 
            ? data.messages[data.messages.length - 1].content 
            : JSON.stringify(data);
            
        setAgentResponse(answer);
        setFeedback({ type: 'success', text: 'Agent executed successfully' });
      } else {
        setFeedback({ type: 'error', text: `API returned ${res.status}` });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Backend unreachable' });
    } finally {
      setLoadingAction(null);
      setTimeout(() => setFeedback(null), 5000);
      setQuery("");
    }
  };

  const handleTrigger = async (action: 'stress_test') => {
    setLoadingAction(action);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/trigger/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: "PORTFOLIO" })
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
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <GlassPanel className="p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-5 h-5 text-primary" />
        <h2 className="text-base font-semibold text-gray-200">Command Center</h2>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        
        {/* Agent Response Area */}
        {agentResponse && (
          <div className="flex-1 bg-black/40 border border-emerald-500/20 rounded-md p-3 overflow-y-auto text-sm text-emerald-100 font-mono">
            <span className="text-emerald-500 mr-2">&gt;</span>
            {agentResponse}
          </div>
        )}

        <form onSubmit={handleQuery} className="relative">
          <label className="block text-xs font-medium text-gray-400 mb-1">Natural Language Instruction</label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loadingAction !== null}
              className="w-full bg-black/40 border border-white/10 rounded-md py-3 px-3 pr-10 text-white text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              placeholder="e.g. What is the fair value of AAPL?"
            />
            <button 
              type="submit"
              disabled={loadingAction !== null || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-400 disabled:opacity-50"
            >
              {loadingAction === 'query' ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => handleTrigger('stress_test')}
            disabled={loadingAction !== null}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all group disabled:opacity-50"
          >
            {loadingAction === 'stress_test'
              ? <Loader2 className="w-6 h-6 mb-1 text-red-400 animate-spin" />
              : <ShieldAlert className="w-6 h-6 mb-1 text-red-400 group-hover:text-red-300" />
            }
            <span className="text-xs font-medium text-red-200 text-center">Simulate Portfolio Stress Test</span>
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
    </GlassPanel>
  );
}
