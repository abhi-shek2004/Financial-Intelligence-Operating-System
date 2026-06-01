"use client";

import React, { useState } from 'react';
import GlassPanel from '@/components/ui/GlassPanel';
import { Settings, Sliders, Shield, Bell, Network, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsEditingKey(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center space-x-3 text-gray-300">
        <Settings className="w-8 h-8" />
        <h1 className="text-2xl font-bold text-white">System Preferences</h1>
      </div>

      <div className="space-y-4 flex-1">
        
        <GlassPanel className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Network className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-gray-200 text-lg">Agent Network Configuration</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <label className="text-xs text-gray-400 mb-1 block">LLM Backend</label>
              <select className="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-white outline-none">
                <option>Anthropic Claude 3.5 Sonnet</option>
                <option>OpenAI GPT-4o</option>
                <option>Local Llama 3 (Quantized)</option>
              </select>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <label className="text-xs text-gray-400 mb-1 block">Agent Autonomy Level</label>
              <select className="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-white outline-none">
                <option>Copilot (Require Approval)</option>
                <option>Autonomous (Execute Trades)</option>
              </select>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-gray-200 text-lg">Security & API Keys</h3>
            </div>
            {saved && (
              <span className="text-emerald-400 text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Preferences Saved
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="text-sm font-medium text-gray-200 mb-1">OpenAI API Key</div>
                {isEditingKey ? (
                  <input 
                    type="text" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                ) : (
                  <div className="text-xs text-gray-500 font-mono">
                    {apiKey ? "sk-proj-**********************" : "No key provided"}
                  </div>
                )}
              </div>
              {isEditingKey ? (
                <button onClick={handleSave} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 text-xs hover:bg-emerald-500/30 flex items-center gap-1 transition-colors">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              ) : (
                <button onClick={() => setIsEditingKey(true)} className="px-4 py-1.5 bg-white/10 rounded border border-white/20 text-xs hover:bg-white/20 transition-colors">
                  Edit
                </button>
              )}
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-200">Alpaca Brokerage API</div>
                <div className="text-xs text-emerald-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Connected</div>
              </div>
              <button className="px-4 py-1.5 bg-white/10 rounded border border-white/20 text-xs hover:bg-white/20 transition-colors">Manage</button>
            </div>
          </div>
        </GlassPanel>
        
      </div>
    </div>
  );
}
