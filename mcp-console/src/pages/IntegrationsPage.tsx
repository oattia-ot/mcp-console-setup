import React from 'react';
import { Power, Link2, SlidersHorizontal, CheckCircle2, Circle } from 'lucide-react';
import type { Integration } from '../types';
import { LETTER_COLORS } from '../data/constants';
import { Led, Badge, Btn } from '../components/common';

interface IntegrationsPageProps {
  integrations: Integration[];
  toggleIntegration: (id: string) => void;
  setKdOpen: (open: boolean) => void;
}

export function IntegrationsPage({ integrations, toggleIntegration, setKdOpen }: IntegrationsPageProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '0.9rem' }}>
      {integrations.map((i) => {
        const connected = i.status === 'connected';
        return (
          <div key={i.id} className="mcp-panel" style={{ padding: '1.05rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
              <div
                className="mcp-letter-tile"
                style={{
                  color: LETTER_COLORS[i.id],
                  background: `${LETTER_COLORS[i.id]}1f`,
                  borderColor: LETTER_COLORS[i.id],
                }}
              >
                {i.letter}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{i.name}</div>
                <Badge tone="muted">{i.category}</Badge>
              </div>
              <Led tone={connected ? 'on' : 'off'} pulse={connected} />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: 1 }}>{i.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge tone={connected ? 'success' : 'muted'} icon={connected ? CheckCircle2 : Circle}>
                {connected ? 'Connected' : 'Disconnected'}
              </Badge>
              {i.id === 'opentext' ? (
                <Btn variant="ghost" size="sm" icon={SlidersHorizontal} onClick={() => setKdOpen(true)}>
                  Configure
                </Btn>
              ) : (
                <Btn
                  variant={connected ? 'ghost' : 'primary'}
                  size="sm"
                  icon={connected ? Power : Link2}
                  onClick={() => toggleIntegration(i.id)}
                >
                  {connected ? 'Disconnect' : 'Connect'}
                </Btn>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
