import React from 'react';
import GlassPanel from '../ui/GlassPanel';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export default function MetricCard({ title, value, change, trend = 'neutral', icon }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';
  
  return (
    <GlassPanel interactive className="p-5 flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-400 text-sm font-medium tracking-wide">{title}</span>
        {icon && <div className="text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity">{icon}</div>}
      </div>
      
      <div className="flex items-baseline space-x-3">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {change && (
          <span className={`text-sm font-semibold ${trendColor}`}>
            {trend === 'up' ? '+' : ''}{change}
          </span>
        )}
      </div>
    </GlassPanel>
  );
}
