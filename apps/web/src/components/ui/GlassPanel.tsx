import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export default function GlassPanel({ children, interactive = false, className = '', ...props }: GlassPanelProps) {
  const baseClass = interactive ? 'glass-panel glass-panel-interactive' : 'glass-panel';
  
  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
