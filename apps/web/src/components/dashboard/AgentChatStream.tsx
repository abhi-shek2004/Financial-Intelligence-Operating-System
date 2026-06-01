"use client";

import React, { useState, useEffect } from 'react';
import GlassPanel from '../ui/GlassPanel';
import { Terminal, Activity } from 'lucide-react';

export default function AgentChatStream() {
  const [logs, setLogs] = useState<string[]>([
    "System initialized.",
    "Connecting to Agent Network...",
    "Coordinator Agent online."
  ]);

  useEffect(() => {
    // Connect to the API Gateway WebSocket
    const ws = new WebSocket("ws://localhost:8000/ws/stream");
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs(prev => {
          // Keep only the last 50 logs so UI doesn't lag
          const newLogs = [...prev, data.message];
          if (newLogs.length > 50) return newLogs.slice(newLogs.length - 50);
          return newLogs;
        });
      } catch (e) {
        console.error("Failed to parse WebSocket message", e);
      }
    };
    
    ws.onclose = () => {
      setLogs(prev => [...prev, "[System] Disconnected from Agent Network."]);
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setLogs(prev => [...prev, "[System] Connection error. Retrying..."]);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <GlassPanel className="h-full flex flex-col overflow-hidden">
      <div className="border-b border-white/10 p-4 flex items-center space-x-3 bg-white/5">
        <Terminal className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-gray-200">Agent Execution Stream</h3>
        <Activity className="w-4 h-4 text-emerald-500 animate-pulse ml-auto" />
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-sm">
        {logs.map((log, index) => (
          <div key={index} className="flex items-start space-x-2 text-gray-400 hover:text-gray-200 transition-colors">
            <span className="text-blue-500/70">{`>`}</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
