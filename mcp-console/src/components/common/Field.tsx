import React from 'react';

interface FieldProps {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <div>
      {label && <label className="mcp-label">{label}</label>}
      {children}
      {hint && (
        <p
          className="mcp-mono"
          style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '0.35rem' }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}