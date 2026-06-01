"use client";

import React, { useState, useEffect, useRef } from 'react';
import GlassPanel from '../ui/GlassPanel';
import { Terminal, Activity } from 'lucide-react';

export default function AgentChatStream() {
  const [logs, setLogs] = useState<{ message: string; time: string }[]>([
    { message: "System initialized.", time: new Date().toLocaleTimeString() },
    { message: "Connecting to Agent Network…", time: new Date().toLocaleTimeString() },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reconnectRef = useRef<number>(0);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      ws = new WebSocket(`${protocol}//${host}/ws/stream`);

      ws.onopen = () => {
        reconnectRef.current = 0; // Reset backoff on successful connect
        setLogs(prev => [...prev, { message: "[System] Connected to Agent Network.", time: new Date().toLocaleTimeString() }]);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const time = data.timestamp && data.timestamp !== "now"
            ? new Date(data.timestamp).toLocaleTimeString()
            : new Date().toLocaleTimeString();
          setLogs(prev => {
            const newLogs = [...prev, { message: data.message, time }];
            if (newLogs.length > 100) return newLogs.slice(newLogs.length - 100);
            return newLogs;
          });
        } catch (e) {
          console.error("Failed to parse WebSocket message", e);
        }
      };

      ws.onclose = () => {
        // Exponential backoff: 1s, 2s, 4s, 8s, … capped at 30s
        const delay = Math.min(1000 * Math.pow(2, reconnectRef.current), 30000);
        reconnectRef.current++;
        setLogs(prev => [...prev, { message: `[System] Disconnected. Reconnecting in ${Math.round(delay / 1000)}s…`, time: new Date().toLocaleTimeString() }]);
        reconnectTimeout = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws?.close(); // Will trigger onclose → reconnect
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, []);

  return (
    <GlassPanel className="h-full flex flex-col overflow-hidden">
      <div className="border-b border-white/10 p-4 flex items-center space-x-3 bg-white/5">
        <Terminal className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-gray-200">Agent Execution Stream</h3>
        <Activity className="w-4 h-4 text-emerald-500 animate-pulse ml-auto" />
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-sm">
        {logs.map((log, index) => (
          <div key={index} className="flex items-start space-x-2 text-gray-400 hover:text-gray-200 transition-colors">
            <span className="text-gray-600 text-xs whitespace-nowrap tabular-nums">{log.time}</span>
            <span className="text-blue-500/70">{`>`}</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
