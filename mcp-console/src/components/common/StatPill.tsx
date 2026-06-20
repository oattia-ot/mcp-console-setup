import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatPillProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: boolean;
}

export function StatPill({ icon: Icon, label, value, accent }: StatPillProps) {
  return (
    <div className="studio-stat-pill">
      <Icon size={12} color={accent ? 'var(--accent)' : 'var(--text-faint)'} />
      <span style={{ color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</span>
    </div>
  );
}