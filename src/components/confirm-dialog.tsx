"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";

type Tone = "danger" | "warning";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  pending = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  pending?: boolean;
}) {
  const toneBtn =
    tone === "danger"
      ? "bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover,var(--color-danger))]"
      : "bg-[var(--color-warning)] hover:bg-[var(--color-warning-hover,var(--color-warning))]";
  const toneIconBg =
    tone === "danger" ? "bg-[var(--color-danger-soft)] text-[var(--color-danger)]" : "bg-[var(--color-warning-soft)] text-[var(--color-warning)]";

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50",
              toneBtn
            )}
          >
            {pending ? "Procesando…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            toneIconBg
          )}
        >
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="text-sm text-[var(--color-text-muted)]">{description}</div>
      </div>
    </Modal>
  );
}
