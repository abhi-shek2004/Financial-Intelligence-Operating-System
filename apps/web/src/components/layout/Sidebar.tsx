import React from 'react';
import { LayoutDashboard, TrendingUp, Search, ShieldAlert, Cpu, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-16 lg:w-64 h-full border-r border-white/10 glass-panel flex flex-col justify-between py-6">
      <div className="flex flex-col items-center lg:items-start lg:px-6 space-y-8">
        {/* Logo Area */}
        <div className="flex items-center space-x-3 text-blue-400 font-bold text-xl tracking-wider">
          <Cpu className="w-8 h-8" />
          <span className="hidden lg:block">FIOS OS</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4 w-full">
          <NavItem icon={<LayoutDashboard />} label="Terminal" active />
          <NavItem icon={<TrendingUp />} label="Markets" />
          <NavItem icon={<Search />} label="Research" />
          <NavItem icon={<ShieldAlert />} label="Risk" />
        </nav>
      </div>

      <div className="flex flex-col items-center lg:items-start lg:px-6">
        <NavItem icon={<Settings />} label="Settings" />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${active ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="hidden lg:block font-medium">{label}</span>
    </div>
  );
}
