"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { duplicateMasterSection, deleteMasterSection } from "@/lib/actions/master-sections";

type Props = {
  id: number;
  name: string;
  type: string;
  title: string;
};

export function MasterSectionCard(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDuplicate() {
    setError(null);
    startTransition(async () => {
      const result = await duplicateMasterSection(props.id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${props.name}"? Los newsletters que ya la usan mantendrán su copia.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteMasterSection(props.id);
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
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: "var(--color-accent)" }}
      />

      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          {props.type}
        </p>
        <h3 className="text-lg font-semibold tracking-tight">{props.name}</h3>
        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
          {props.title}
        </p>
      </header>

      {error && (
        <p className="rounded-md bg-[var(--color-danger-soft)] px-3 py-2 text-xs text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <footer className="flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
        <Link
          href={`/master-sections/${props.id}`}
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
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-[var(--color-danger-soft)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)]"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar
        </button>
      </footer>
    </article>
  );
}
