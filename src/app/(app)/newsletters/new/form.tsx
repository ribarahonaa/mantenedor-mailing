"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Save, ArrowLeft } from "lucide-react";
import { createNewsletter } from "@/lib/actions/newsletters";
import { cn } from "@/lib/utils";

export function NewNewsletterForm() {
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    const result = await createNewsletter(formData);
    // Si hubo éxito, createNewsletter redirige (lanza) — no llegamos aquí.
    if (result && !result.ok) setError(result.error);
  }

  return (
    <form action={action} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Nombre</span>
        <input
          name="name"
          required
          maxLength={120}
          placeholder="Ej: Newsletter mensual marzo"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Descripción <span className="text-[var(--color-text-subtle)] font-normal">(opcional)</span></span>
        <textarea
          name="description"
          rows={3}
          maxLength={500}
          placeholder="Qué incluirá este newsletter, para quién va, etc."
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)] resize-y"
        />
      </label>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton />
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="h-4 w-4" /> Cancelar
        </Link>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition",
        "hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      )}
    >
      <Save className="h-4 w-4" /> {pending ? "Creando…" : "Crear newsletter"}
    </button>
  );
}
