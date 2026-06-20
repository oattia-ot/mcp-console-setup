import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface BadgeProps {
  tone?: 'success' | 'muted' | 'danger' | 'info' | 'accent';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function Badge({ tone = 'muted', icon: Icon, children }: BadgeProps) {
  const cls: Record<string, string> = {
    success: 'mcp-badge-success',
    muted: 'mcp-badge-muted',
    danger: 'mcp-badge-danger',
    info: 'mcp-badge-info',
    accent: 'mcp-badge-accent',
  };

  return (
    <span className={`mcp-badge ${cls[tone] || 'mcp-badge-muted'}`}>
      {Icon && <Icon size={11} />} {children}
    </span>
  );
}