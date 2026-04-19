"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Copy, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { duplicateNewsletter, deleteNewsletter } from "@/lib/actions/newsletters";
import { ConfirmDialog } from "./confirm-dialog";

type Props = {
  id: number;
  name: string;
  description: string | null;
  sectionsCount: number;
  updatedAt: string;
};

export function NewsletterCard(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDuplicate() {
    setError(null);
    startTransition(async () => {
      const result = await duplicateNewsletter(props.id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleConfirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteNewsletter(props.id);
      if (!result.ok) {
        setError(result.error);
        setConfirmOpen(false);
      } else {
        setConfirmOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <article
      className={cn(
        "card-surface relative flex flex-col gap-4 overflow-hidden rounded-xl border border-[var(--color-border)] p-5",
        "hover:-translate-y-0.5 hover:border-[var(--color-accent-soft)]",
        pending && "pointer-events-none opacity-60"
      )}
    >
      <header className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">{props.name}</h3>
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
          onClick={() => setConfirmOpen(true)}
          disabled={pending}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-danger-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)]"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar
        </button>
      </footer>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar newsletter"
        description={
          <>
            ¿Seguro que quieres eliminar <strong>&quot;{props.name}&quot;</strong>? Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        pending={pending}
      />
    </article>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}
