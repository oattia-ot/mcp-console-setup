import React from 'react';
import { Settings, CheckCircle2, Circle } from 'lucide-react';
import type { Tool } from '../types';
import { Badge, Switch, Btn } from '../components/common';

interface ToolsPageProps {
  tools: Tool[];
  toolFilter: string;
  setToolFilter: (filter: string) => void;
  toggleTool: (id: string) => void;
  setConfigTool: (tool: Tool | null) => void;
}

export function ToolsPage({
  tools,
  toolFilter,
  setToolFilter,
  toggleTool,
  setConfigTool,
}: ToolsPageProps) {
  const categories = ['All', ...Array.from(new Set(tools.map((t) => t.category)))] as string[];
  const filtered = toolFilter === 'All' ? tools : tools.filter((t) => t.category === toolFilter);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {categories.map((c) => (
          <span
            key={c}
            className="mcp-chip"
            style={toolFilter === c ? { background: 'var(--accent-dim)', borderColor: 'var(--accent)' } : {}}
            onClick={() => setToolFilter(c)}
          >
            {c}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.9rem' }}>
        {filtered.map((t) => (
          <div key={t.id} className="mcp-panel" style={{ padding: '1.05rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
              <div className="mcp-icon-tile">
                <t.icon size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{t.name}</div>
                <Badge tone="muted">{t.category}</Badge>
              </div>
              <Switch on={t.enabled} onChange={() => toggleTool(t.id)} />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: 1 }}>{t.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge tone={t.enabled ? 'success' : 'muted'} icon={t.enabled ? CheckCircle2 : Circle}>
                {t.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Btn variant="ghost" size="sm" icon={Settings} onClick={() => setConfigTool(t)}>
                Configure
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
