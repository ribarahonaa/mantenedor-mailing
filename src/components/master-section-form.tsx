"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft } from "lucide-react";
import { HtmlEditor } from "./html-editor";
import {
  createMasterSection,
  updateMasterSection,
} from "@/lib/actions/master-sections";
import { cn } from "@/lib/utils";

const TYPE_SUGGESTIONS = [
  "header",
  "saludo",
  "destacado",
  "articulos",
  "eventos",
  "cta",
  "footer",
  "two-cols-text",
  "two-cols-photo-right",
  "two-cols-photo-left",
  "two-cols-photos",
];

type Props =
  | { mode: "create"; initial?: undefined; id?: undefined }
  | {
      mode: "edit";
      id: number;
      initial: { name: string; type: string; title: string; html: string };
    };

export function MasterSectionForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function action(formData: FormData) {
    setError(null);
    setSaved(false);
    setPending(true);
    try {
      const result =
        props.mode === "create"
          ? await createMasterSection(formData)
          : await updateMasterSection(props.id, formData);

      if (result && !result.ok) {
        setError(result.error);
        return;
      }
      if (props.mode === "edit") {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={action} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nombre" name="name" defaultValue={props.initial?.name} required maxLength={120} placeholder="Ej: Header con logo" />
        <Field
          label="Tipo"
          name="type"
          defaultValue={props.initial?.type}
          required
          maxLength={50}
          list="section-types"
          placeholder="Ej: header, cta, footer"
        />
        <datalist id="section-types">
          {TYPE_SUGGESTIONS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>

      <Field
        label="Título de la sección"
        name="title"
        defaultValue={props.initial?.title}
        required
        maxLength={200}
        placeholder="Ej: Bienvenido a nuestro newsletter"
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Contenido HTML</label>
        <HtmlEditor name="html" defaultValue={props.initial?.html ?? ""} />
        <p className="text-xs text-[var(--color-text-subtle)]">
          Usa HTML válido. Alterna entre código y preview con los botones superiores.
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-[var(--color-border)] pt-5">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition",
            "hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          )}
        >
          <Save className="h-4 w-4" />{" "}
          {pending ? "Guardando…" : props.mode === "create" ? "Crear sección" : "Guardar cambios"}
        </button>
        <Link
          href="/master-sections"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        {saved && (
          <span className="text-xs text-[var(--color-success)]">Guardado ✓</span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]"
      />
    </label>
  );
}
