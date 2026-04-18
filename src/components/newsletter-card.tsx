"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Copy, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { duplicateNewsletter, deleteNewsletter } from "@/lib/actions/newsletters";

type Props = {
  id: number;
  name: string;
  description: string | null;
  status: "draft" | "published";
  sectionsCount: number;
  updatedAt: string;
};

const statusStyles: Record<Props["status"], { stripe: string; badgeBg: string; badgeText: string; label: string }> = {
  draft: {
    stripe: "var(--color-warning)",
    badgeBg: "var(--color-warning-soft)",
    badgeText: "var(--color-warning)",
    label: "borrador",
  },
  published: {
    stripe: "var(--color-success)",
    badgeBg: "var(--color-success-soft)",
    badgeText: "var(--color-success)",
    label: "publicado",
  },
};

export function NewsletterCard(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const styles = statusStyles[props.status] ?? statusStyles.draft;

  function handleDuplicate() {
    setError(null);
    startTransition(async () => {
      const result = await duplicateNewsletter(props.id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${props.name}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteNewsletter(props.id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <article
      className={cn(
        "relative flex flex-col gap-4 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 pl-[calc(1.25rem+4px)] shadow-xs",
        "transition hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-md",
        pending && "pointer-events-none opacity-60"
      )}
    >
      {/* Stripe de estado */}
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: styles.stripe }}
      />

      <header className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">{props.name}</h3>
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold lowercase"
            style={{ background: styles.badgeBg, color: styles.badgeText }}
          >
            {styles.label}
          </span>
        </div>
        {props.description && (
          <p className="line-clamp-2 text-sm text-[var(--color-text-muted)]">
            {props.description}
          </p>
        )}
      </header>

      <dl className="flex items-center gap-3 text-xs text-[var(--color-text-subtle)]">
        <span className="inline-flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          {props.sectionsCount} {props.sectionsCount === 1 ? "bloque" : "bloques"}
        </span>
        <span>·</span>
        <span>Actualizado {formatDate(props.updatedAt)}</span>
      </dl>

      {error && (
        <p className="rounded-md bg-[var(--color-danger-soft)] px-3 py-2 text-xs text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <footer className="flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
        <Link
          href={`/newsletters/${props.id}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-info-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-info)] transition hover:bg-[var(--color-info)] hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Link>
        <button
          type="button"
          onClick={handleDuplicate}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-warning-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-warning)] transition hover:bg-[var(--color-warning)] hover:text-white"
        >
          <Copy className="h-3.5 w-3.5" /> Duplicar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-danger-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)]"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar
        </button>
      </footer>
    </article>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}
