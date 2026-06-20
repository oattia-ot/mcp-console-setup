import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function Btn({
  variant = 'ghost',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  ...rest
}: BtnProps) {
  const vcls = {
    primary: 'mcp-btn-primary',
    ghost: 'mcp-btn-ghost',
    danger: 'mcp-btn-danger',
  }[variant];

  const sizeCls = size === 'sm' ? 'mcp-btn-sm' : '';

  return (
    <button
      className={`mcp-btn ${vcls} ${sizeCls} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}