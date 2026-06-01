import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 w-full glass-panel flex items-center justify-between px-6 mb-4">
      <div className="flex items-center w-1/3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search equities, models, or prompt an agent..." 
            className="w-full bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6 text-gray-300">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SYSTEM: ONLINE</span>
        </div>
        <Bell className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border border-white/20">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
}
