"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Trash2, Sliders, Save, Pencil, Eye, Copy, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { HtmlEditor } from "@/components/html-editor";
import {
  addSectionToNewsletter,
  reorderSections,
  updateSection,
  deleteSection,
} from "@/lib/actions/sections";

type SectionContent = { html: string };

type SectionRow = {
  id: number;
  masterSectionId: number | null;
  sectionType: string;
  title: string;
  content: SectionContent;
  sectionOrder: number;
  isCustomized: boolean;
};

type MasterBlock = {
  id: number;
  name: string;
  type: string;
  title: string;
};

export function NewsletterEditor({
  newsletterId,
  newsletterName,
  initialSections,
  masterBlocks,
}: {
  newsletterId: number;
  newsletterName: string;
  initialSections: SectionRow[];
  masterBlocks: MasterBlock[];
}) {
  const router = useRouter();
  const [sections, setSections] = useState<SectionRow[]>(initialSections);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [editingHtml, setEditingHtml] = useState<SectionRow | null>(null);

  // Sincroniza el estado local cuando el server component recarga (router.refresh()).
  // Sin esto, los nuevos bloques insertados no aparecen hasta recargar la página.
  // Patrón "adjust state on prop change" de react.dev — usa useState, no useEffect.
  const [lastInitial, setLastInitial] = useState(initialSections);
  if (lastInitial !== initialSections) {
    setLastInitial(initialSections);
    setSections(initialSections);
  }

  const dragRef = useRef<{ kind: "master"; masterId: number } | { kind: "section"; sectionId: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [dropAtEnd, setDropAtEnd] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const selected = sections.find((s) => s.id === selectedId) ?? null;

  function handleError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 3500);
  }

  function clearDrop() {
    dragRef.current = null;
    setDropTarget(null);
    setDropAtEnd(false);
  }

  function handleDragOverContainer(e: React.DragEvent) {
    if (!dragRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = dragRef.current.kind === "section" ? "move" : "copy";
  }

  function handleDragOverSection(e: React.DragEvent, sectionId: number) {
    if (!dragRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(sectionId);
    setDropAtEnd(false);
  }

  function handleDragOverEnd(e: React.DragEvent) {
    if (!dragRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    setDropAtEnd(true);
  }

  function computeInsertIndex(targetSectionId: number | null, atEnd: boolean) {
    if (atEnd) return sections.length;
    if (targetSectionId == null) return sections.length;
    const idx = sections.findIndex((s) => s.id === targetSectionId);
    return idx < 0 ? sections.length : idx;
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const drag = dragRef.current;
    if (!drag) return;
    const insertIndex = computeInsertIndex(dropTarget, dropAtEnd);

    if (drag.kind === "master") {
      // Optimistic: insertar placeholder temporal
      const master = masterBlocks.find((m) => m.id === drag.masterId);
      if (!master) {
        clearDrop();
        return;
      }
      startTransition(async () => {
        const result = await addSectionToNewsletter(newsletterId, master.id, insertIndex);
        if (!result.ok) handleError(result.error);
        else {
          router.refresh();
          if (result.data?.id) setSelectedId(result.data.id);
        }
      });
    } else {
      // Reordenar dentro del canvas
      const fromIdx = sections.findIndex((s) => s.id === drag.sectionId);
      if (fromIdx < 0) {
        clearDrop();
        return;
      }
      // Calcular el insertIndex ajustado (si movemos hacia abajo, se resta 1)
      let to = insertIndex;
      if (to > fromIdx) to -= 1;
      if (to === fromIdx) {
        clearDrop();
        return;
      }

      const next = [...sections];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(to, 0, moved);
      setSections(next);
      setSelectedId(moved.id);

      const orderedIds = next.map((s) => s.id);
      startTransition(async () => {
        const result = await reorderSections(newsletterId, orderedIds);
        if (!result.ok) {
          handleError(result.error);
          setSections(initialSections); // rollback rough
        } else {
          router.refresh();
        }
      });
    }
    clearDrop();
  }

  function handleConfirmDeleteSection() {
    const id = deleteId;
    if (id == null) return;
    startTransition(async () => {
      const result = await deleteSection(id);
      if (!result.ok) {
        handleError(result.error);
        setDeleteId(null);
      } else {
        setSections((curr) => curr.filter((s) => s.id !== id));
        if (selectedId === id) setSelectedId(null);
        setDeleteId(null);
        router.refresh();
      }
    });
  }

  function handleTitleBlur(id: number, nextTitle: string) {
    const section = sections.find((s) => s.id === id);
    if (!section || section.title === nextTitle) return;
    setSections((curr) =>
      curr.map((s) => (s.id === id ? { ...s, title: nextTitle, isCustomized: true } : s))
    );
    startTransition(async () => {
      const result = await updateSection(id, { title: nextTitle });
      if (!result.ok) handleError(result.error);
      else router.refresh();
    });
  }

  function buildFullHtml() {
    const body = sections.map((s) => s.content.html).join("\n");
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(newsletterName)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f4;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;max-width:600px;">
<tr><td>
${body}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  }

  async function handleCopyHtml() {
    const html = buildFullHtml();
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      handleError("No se pudo copiar al portapapeles");
    }
  }

  function handleSaveHtml(id: number, html: string) {
    setSections((curr) =>
      curr.map((s) =>
        s.id === id ? { ...s, content: { html }, isCustomized: true } : s
      )
    );
    setEditingHtml(null);
    startTransition(async () => {
      const result = await updateSection(id, { html });
      if (!result.ok) handleError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div
        className="grid gap-4 items-start"
        style={{ gridTemplateColumns: "300px 1fr 320px" }}
      >
        {/* === Sidebar: bloques disponibles === */}
        <aside className="sticky top-[calc(64px+52px+1rem)] max-h-[calc(100vh-64px-52px-4rem)] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
          <h3 className="mb-4 border-b border-[var(--color-border)] pb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
            Bloques
          </h3>
          <div className="space-y-2">
            {masterBlocks.length === 0 ? (
              <p className="text-xs text-[var(--color-text-subtle)]">
                No hay secciones maestras disponibles.
              </p>
            ) : (
              masterBlocks.map((m) => (
                <div
                  key={m.id}
                  draggable
                  onDragStart={(e) => {
                    dragRef.current = { kind: "master", masterId: m.id };
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onDragEnd={clearDrop}
                  className="cursor-grab rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-sm active:cursor-grabbing"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                    {m.type}
                  </p>
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="line-clamp-2 text-xs text-[var(--color-text-muted)]">
                    {m.title}
                  </p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* === Canvas === */}
        <div
          className="flex min-h-[calc(100vh-64px-52px-4rem)] flex-col items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-3)] p-5"
          onDragOver={handleDragOverContainer}
          onDrop={handleDrop}
        >
          {/* Toolbar: acciones + estado de guardado */}
          <div className="flex w-full max-w-[600px] flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              disabled={sections.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] shadow-xs transition hover:border-[var(--color-accent-soft)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] disabled:opacity-50"
            >
              <Eye className="h-4 w-4" /> Vista previa
            </button>
            <button
              type="button"
              onClick={handleCopyHtml}
              disabled={sections.length === 0}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium shadow-xs transition disabled:opacity-50",
                copied
                  ? "border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-soft)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
              )}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar HTML"}
            </button>

            <div
              className="ml-auto inline-flex items-center gap-1.5 text-xs text-[var(--color-text-subtle)]"
              title="Todos los cambios se guardan automáticamente"
              aria-live="polite"
            >
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
                  Guardado automáticamente
                </>
              )}
            </div>
          </div>

          {/* Papel */}
          <div className="min-h-[480px] w-full max-w-[600px] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-md">
            {sections.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-md border border-dashed border-[var(--color-border-strong)] py-12 text-center text-[var(--color-text-subtle)]">
                <p className="text-sm">Arrastra bloques aquí para construir tu newsletter</p>
              </div>
            ) : (
              <>
                {sections.map((s) => (
                  <div key={s.id} className="relative">
                    {dropTarget === s.id && <DropLine />}
                    <div
                      onClick={() => setSelectedId(s.id)}
                      draggable
                      onDragStart={(e) => {
                        dragRef.current = { kind: "section", sectionId: s.id };
                        e.dataTransfer.effectAllowed = "move";
                        e.currentTarget.classList.add("opacity-50");
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.classList.remove("opacity-50");
                        clearDrop();
                      }}
                      onDragOver={(e) => handleDragOverSection(e, s.id)}
                      className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-md border-2 mb-3 transition",
                        selectedId === s.id
                          ? "border-[var(--color-accent)] shadow-[0_0_0_3px_var(--color-accent-ring)]"
                          : "border-transparent hover:border-[var(--color-border-strong)]"
                      )}
                    >
                      <div
                        className="absolute left-1 top-1 z-10 inline-flex h-6 w-6 items-center justify-center rounded bg-[var(--color-surface)] text-[var(--color-text-subtle)] opacity-0 shadow-sm transition group-hover:opacity-100"
                        title="Arrastrar para reordenar"
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: s.content.html }} />
                    </div>
                  </div>
                ))}
                <div
                  onDragOver={handleDragOverEnd}
                  className={cn(
                    "relative h-4 rounded transition",
                    dropAtEnd && "bg-[var(--color-accent-ring)]"
                  )}
                >
                  {dropAtEnd && <DropLine />}
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-[var(--color-text-subtle)]">600px</p>
        </div>

        {/* === Properties panel === */}
        <aside className="sticky top-[calc(64px+52px+1rem)] max-h-[calc(100vh-64px-52px-4rem)] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
          <h3 className="mb-4 border-b border-[var(--color-border)] pb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
            Propiedades
          </h3>
          {!selected ? (
            <div className="py-6 text-center text-[var(--color-text-subtle)]">
              <Sliders className="mx-auto h-8 w-8 opacity-60" />
              <p className="mt-2 text-sm">Selecciona un bloque para editar sus propiedades</p>
            </div>
          ) : (
            <PropertiesForm
              key={selected.id}
              section={selected}
              totalCount={sections.length}
              onTitleBlur={(t) => handleTitleBlur(selected.id, t)}
              onEditHtml={() => setEditingHtml(selected)}
              onDelete={() => setDeleteId(selected.id)}
            />
          )}
        </aside>
      </div>

      {/* Modal de edición HTML */}
      {editingHtml && (
        <HtmlEditModal
          section={editingHtml}
          onClose={() => setEditingHtml(null)}
          onSave={(html) => handleSaveHtml(editingHtml.id, html)}
        />
      )}

      {/* Modal de vista previa del mailing completo */}
      {previewOpen && (
        <PreviewModal
          html={buildFullHtml()}
          onClose={() => setPreviewOpen(false)}
          onCopy={handleCopyHtml}
          copied={copied}
        />
      )}

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDeleteSection}
        title="Eliminar bloque"
        description="¿Seguro que quieres eliminar este bloque del newsletter? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        pending={pending}
      />
    </div>
  );
}

// ==================== Subcomponents ====================

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function DropLine() {
  return (
    <div
      className="absolute left-0 right-0 -top-1.5 z-20 h-1 rounded-full"
      style={{ background: "var(--color-accent)", boxShadow: "0 0 8px var(--color-accent-ring)" }}
    />
  );
}

function PropertiesForm({
  section,
  totalCount,
  onTitleBlur,
  onEditHtml,
  onDelete,
}: {
  section: SectionRow;
  totalCount: number;
  onTitleBlur: (title: string) => void;
  onEditHtml: () => void;
  onDelete: () => void;
}) {
  const position = section.sectionOrder + 1;
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">Tipo</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            {section.sectionType}
          </span>
          {section.isCustomized && (
            <span className="rounded-full bg-[var(--color-warning-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-warning)]">
              personalizada
            </span>
          )}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          Título
        </span>
        <input
          defaultValue={section.title}
          onBlur={(e) => onTitleBlur(e.target.value.trim())}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]"
        />
      </label>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">Posición</p>
        <p className="text-sm text-[var(--color-text-muted)]">
          {position} / {totalCount} · arrastra el bloque en el canvas para reordenar
        </p>
      </div>

      <div className="space-y-2 border-t border-[var(--color-border)] pt-4">
        <button
          type="button"
          onClick={onEditHtml}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
        >
          <Pencil className="h-4 w-4" /> Editar contenido
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--color-danger-soft)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)]"
        >
          <Trash2 className="h-4 w-4" /> Eliminar bloque
        </button>
      </div>
    </div>
  );
}

function PreviewModal({
  html,
  onClose,
  onCopy,
  copied,
}: {
  html: string;
  onClose: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Vista previa del mailing"
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onCopy}
            className={cn(
              "mr-auto inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition",
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
            onClick={onClose}
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            Cerrar
          </button>
        </>
      }
    >
      <div className="flex justify-center bg-[var(--color-surface-3)] p-6 rounded-md">
        <iframe
          srcDoc={html}
          title="Preview"
          sandbox="allow-same-origin"
          className="border-0 bg-white shadow-md"
          style={{
            width: 600,
            maxWidth: "100%",
            height: "70vh",
          }}
        />
      </div>
    </Modal>
  );
}

function HtmlEditModal({
  section,
  onClose,
  onSave,
}: {
  section: SectionRow;
  onClose: () => void;
  onSave: (html: string) => void;
}) {
  const [html, setHtml] = useState(section.content.html);
  return (
    <Modal
      open
      onClose={onClose}
      title={`Editar contenido · ${section.title}`}
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(html)}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            <Save className="h-4 w-4" /> Guardar
          </button>
        </>
      }
    >
      <HtmlEditor defaultValue={html} onChange={setHtml} />
    </Modal>
  );
}
