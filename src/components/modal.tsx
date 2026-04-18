"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" } as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-[2px] p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`my-8 w-full ${widths[size]} overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl`}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-subtle)] transition hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="p-6">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
