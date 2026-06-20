import React from 'react';
import {
  Users, Wrench, Plug, BarChart3, ArrowUpRight, ArrowDownRight, ChevronRight, Wand2
} from 'lucide-react';
import type { User, Tool, Integration } from '../types';
import { ACTIVITY_LOG } from '../data/constants';
import { CornerTicks, Led, Badge } from '../components/common';

interface OverviewPageProps {
  users: User[];
  tools: Tool[];
  integrations: Integration[];
  connectedCount: number;
  enabledToolsCount: number;
  setPage: (page: any) => void;
  setKdOpen: (open: boolean) => void;
}

export function OverviewPage({
  users,
  tools,
  integrations,
  connectedCount,
  enabledToolsCount,
  setPage,
  setKdOpen,
}: OverviewPageProps) {
  const stats = [
    {
      label: 'Active users',
      value: users.filter((u) => u.status === 'active').length,
      delta: '+2 this week',
      up: true,
      icon: Users,
    },
    {
      label: 'Tools enabled',
      value: `${enabledToolsCount}/${tools.length}`,
      delta: 'stable',
      up: true,
      icon: Wrench,
    },
    {
      label: 'Integrations live',
      value: `${connectedCount}/${integrations.length}`,
      delta: '1 syncing',
      up: true,
      icon: Plug,
    },
    {
      label: 'API calls today',
      value: '24,591',
      delta: '+8.2%',
      up: true,
      icon: BarChart3,
    },
  ];

  const quickActions = [
    { label: 'Invite a user', icon: Users, action: () => setPage('admin') },
    { label: 'Add a tool', icon: Wrench, action: () => setPage('tools') },
    { label: 'Connect an integration', icon: Plug, action: () => setPage('integrations') },
    { label: 'Open Customization Studio', icon: Wand2, action: () => setPage('studio') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.9rem' }}>
        {stats.map((s, i) => (
          <div key={i} className="mcp-panel" style={{ padding: '1rem 1.1rem' }}>
            <CornerTicks />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="mcp-mono" style={{ fontSize: '0.66rem', color: 'var(--text-faint)', letterSpacing: '.04em' }}>
                {s.label.toUpperCase()}
              </span>
              <s.icon size={14} color="var(--accent)" />
            </div>
            <div className="mcp-display" style={{ fontSize: '1.7rem', fontWeight: 700, marginTop: '0.5rem' }}>
              {s.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.3rem', color: s.up ? 'var(--success)' : 'var(--danger)', fontSize: '0.72rem' }}>
              {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mcp-mono" style={{ fontSize: '0.7rem', color: 'var(--text-faint)', letterSpacing: '.06em', marginBottom: '0.7rem' }}>
          QUICK ACTIONS
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.8rem' }}>
          {quickActions.map((a, i) => (
            <div
              key={i}
              className="mcp-card"
              style={{ padding: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.7rem' }}
              onClick={a.action}
            >
              <div className="mcp-icon-tile">
                <a.icon size={16} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{a.label}</span>
              <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-faint)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mcp-panel" style={{ padding: '1.1rem 1.2rem' }}>
        <h3 className="mcp-mono" style={{ fontSize: '0.7rem', color: 'var(--text-faint)', letterSpacing: '.06em', marginBottom: '0.8rem' }}>
          RECENT ACTIVITY
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {ACTIVITY_LOG.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.7rem', alignItems: 'baseline' }}>
              <span className="mcp-mono" style={{ fontSize: '0.68rem', color: 'var(--text-faint)', flexShrink: 0 }}>
                {a.time}
              </span>
              <Led tone={a.tone === 'success' ? 'on' : a.tone === 'danger' ? 'danger' : a.tone === 'muted' ? 'off' : 'warn'} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
