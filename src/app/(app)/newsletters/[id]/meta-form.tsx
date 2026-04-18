"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2 } from "lucide-react";
import { updateNewsletter } from "@/lib/actions/newsletters";
import { cn } from "@/lib/utils";

type Status = "draft" | "published";

export function NewsletterMetaForm({
  id,
  initialName,
  initialDescription,
  initialStatus,
}: {
  id: number;
  initialName: string;
  initialDescription: string;
  initialStatus: Status;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState<Status>(initialStatus);

  const dirty =
    name !== initialName ||
    description !== initialDescription ||
    status !== initialStatus;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateNewsletter(id, { name, description, status });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Estado</span>
          <div className="inline-flex w-full rounded-lg bg-[var(--color-surface-3)] p-1">
            {(["draft", "published"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition",
                  status === s
                    ? "bg-[var(--color-surface)] text-[var(--color-accent)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                )}
              >
                {s === "draft" ? "Borrador" : "Publicado"}
              </button>
            ))}
          </div>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          Descripción{" "}
          <span className="font-normal text-[var(--color-text-subtle)]">(opcional)</span>
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)] resize-y"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!dirty || pending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {savedAt && !dirty && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-success)]">
            <CheckCircle2 className="h-4 w-4" /> Guardado
          </span>
        )}
      </div>
    </form>
  );
}
