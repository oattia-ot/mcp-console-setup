import React from 'react';

interface LedProps {
  tone?: 'on' | 'warn' | 'off' | 'danger';
  pulse?: boolean;
}

export function Led({ tone = 'off', pulse = false }: LedProps) {
  const clsMap: Record<string, string> = {
    on: 'mcp-led-on',
    warn: 'mcp-led-warn',
    off: 'mcp-led-off',
    danger: 'mcp-led-danger',
  };

  const cls = clsMap[tone] || 'mcp-led-off';
  return <span className={`mcp-led ${cls} ${pulse ? 'mcp-led-pulse' : ''}`} />;
}