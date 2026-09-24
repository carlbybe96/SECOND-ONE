"use client";

import { X } from "lucide-react";
import { useEffect, useId } from "react";

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
};

export function Modal({ open, onClose, title, description, children, footer, wide = false }: ModalProps) {
  useEscape(open, onClose);
  const titleId = useId();
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? " wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className="icon-btn plain" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        {children && <div className="modal-body">{children}</div>}
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Sheet({ open, onClose, title, actions, children }: { open: boolean; onClose: () => void; title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <aside className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {actions}
            <button type="button" className="icon-btn plain" onClick={onClose} aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="sheet-body">{children}</div>
      </aside>
    </>
  );
}
