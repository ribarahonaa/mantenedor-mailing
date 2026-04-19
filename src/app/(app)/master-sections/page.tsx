import Link from "next/link";
import { Plus } from "lucide-react";
import { listMasterSections } from "@/lib/actions/master-sections";
import { MasterSectionCard } from "@/components/master-section-card";
import { ViewHeader } from "@/components/view-header";

export default async function MasterSectionsPage() {
  const sections = await listMasterSections();

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Secciones maestras"
        actions={
          <Link
            href="/master-sections/new"
            className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Nueva sección
          </Link>
        }
      />

      {sections.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((s) => (
            <MasterSectionCard
              key={s.id}
              id={s.id}
              name={s.name}
              type={s.type}
              title={s.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-12 text-center">
      <h3 className="text-base font-semibold">No hay secciones maestras</h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Crea bloques reutilizables que los usuarios puedan arrastrar a sus newsletters.
      </p>
      <Link
        href="/master-sections/new"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
      >
        <Plus className="h-4 w-4" /> Crear primera sección
      </Link>
    </div>
  );
}
