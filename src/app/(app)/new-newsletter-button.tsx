"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Save } from "lucide-react";
import { Modal } from "@/components/modal";
import { createNewsletter } from "@/lib/actions/newsletters";
import { cn } from "@/lib/utils";

export function NewNewsletterButton({
  variant = "primary",
  label = "Nuevo newsletter",
}: {
  variant?: "primary" | "empty";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await createNewsletter(formData);
    if (result && !result.ok) setError(result.error);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "btn-primary inline-flex items-center gap-2 rounded-lg text-sm font-semibold",
          variant === "primary" ? "px-4 py-2" : "mt-4 px-4 py-2"
        )}
      >
        <Plus className="h-4 w-4" /> {label}
      </button>

      {open && (
        <Modal
          open
          onClose={() => {
            setOpen(false);
            setError(null);
          }}
          title="Crear newsletter"
        >
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
                autoFocus
                maxLength={120}
                placeholder="Ej: Newsletter mensual marzo"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">
                Descripción{" "}
                <span className="text-[var(--color-text-subtle)] font-normal">(opcional)</span>
              </span>
              <textarea
                name="description"
                rows={3}
                maxLength={500}
                placeholder="Qué incluirá este newsletter, para quién va, etc."
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)] resize-y"
              />
            </label>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-4">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
              >
                Cancelar
              </button>
              <SubmitButton />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
    >
      <Save className="h-4 w-4" /> {pending ? "Creando…" : "Crear newsletter"}
    </button>
  );
}
