import React from 'react';

interface SwitchProps {
  on: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Switch({ on, onChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`mcp-switch ${on ? 'on' : ''}`}
    >
      <span className="mcp-switch-thumb" />
    </button>
  );
}