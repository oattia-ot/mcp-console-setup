import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}

export function Modal({ open, onClose, width = 660, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="mcp-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mcp-modal" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}