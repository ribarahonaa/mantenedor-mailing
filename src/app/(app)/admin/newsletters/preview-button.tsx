"use client";

import { useState, useTransition } from "react";
import { Eye, Copy, Check, Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { cn } from "@/lib/utils";
import { buildFullHtml } from "@/lib/newsletter-html";
import { getNewsletterForAdmin } from "@/lib/actions/admin";

export function AdminPreviewButton({ id, name }: { id: number; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleOpen() {
    setError(null);
    setHtml(null);
    setOpen(true);
    startTransition(async () => {
      try {
        const data = await getNewsletterForAdmin(id);
        if (!data) {
          setError("Newsletter no encontrado");
          return;
        }
        setHtml(buildFullHtml(data.name, data.sectionsHtml));
      } catch {
        setError("No se pudo cargar el newsletter");
      }
    });
  }

  async function handleCopy() {
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar al portapapeles");
    }
  }

  function handleClose() {
    setOpen(false);
    setCopied(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-accent-soft)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
      >
        <Eye className="h-3.5 w-3.5" /> Ver
      </button>

      {open && (
        <Modal
          open
          onClose={handleClose}
          title={`Vista previa · ${name}`}
          size="xl"
          footer={
            <>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!html}
                className={cn(
                  "mr-auto inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition disabled:opacity-50",
                  copied
                    ? "border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-soft)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                )}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar HTML"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
              >
                Cerrar
              </button>
            </>
          }
        >
          <div className="flex min-h-[400px] items-center justify-center rounded-md bg-[var(--color-surface-3)] p-6">
            {error ? (
              <p className="text-sm text-[var(--color-danger)]">{error}</p>
            ) : pending || !html ? (
              <div className="inline-flex items-center gap-2 text-sm text-[var(--color-text-subtle)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando…
              </div>
            ) : (
              <iframe
                srcDoc={html}
                title={`Preview de ${name}`}
                sandbox="allow-same-origin"
                className="border-0 bg-white shadow-md"
                style={{ width: 600, maxWidth: "100%", height: "70vh" }}
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
