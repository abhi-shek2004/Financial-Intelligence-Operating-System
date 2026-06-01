"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Search, ShieldAlert, Cpu, Settings } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 lg:w-64 h-full border-r border-white/10 glass-panel flex flex-col justify-between py-6">
      <div className="flex flex-col items-center lg:items-start lg:px-6 space-y-8">
        {/* Logo Area */}
        <Link href="/" className="flex items-center space-x-3 text-blue-400 font-bold text-xl tracking-wider hover:opacity-80 transition-opacity">
          <Cpu className="w-8 h-8" />
          <span className="hidden lg:block">FIOS OS</span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4 w-full">
          <NavItem href="/" icon={<LayoutDashboard />} label="Terminal" active={pathname === "/"} />
          <NavItem href="/markets" icon={<TrendingUp />} label="Markets" active={pathname === "/markets"} />
          <NavItem href="/research" icon={<Search />} label="Research" active={pathname === "/research"} />
          <NavItem href="/risk" icon={<ShieldAlert />} label="Risk" active={pathname === "/risk"} />
        </nav>
      </div>

      <div className="flex flex-col items-center lg:items-start lg:px-6">
        <NavItem href="/settings" icon={<Settings />} label="Settings" active={pathname === "/settings"} />
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-300 ${active ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="hidden lg:block font-medium">{label}</span>
    </Link>
  );
}
