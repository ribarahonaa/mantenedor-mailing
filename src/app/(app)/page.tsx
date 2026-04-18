import { db, schema } from "@/lib/db";
import { Placeholder } from "@/components/placeholder";
import { ViewHeader } from "@/components/view-header";

export default async function NewslettersPage() {
  const users = await db.select().from(schema.users).all();
  const sections = await db.select().from(schema.masterSections).all();
  const newsletters = await db.select().from(schema.newsletters).all();

  return (
    <div className="space-y-8">
      <ViewHeader title="Mis newsletters" />

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-[var(--color-text-subtle)] font-semibold">
          Estado de la DB
        </h2>
        <dl className="grid grid-cols-3 gap-4">
          <Stat label="Usuarios" value={users.length} />
          <Stat label="Secciones" value={sections.length} />
          <Stat label="Newsletters" value={newsletters.length} />
        </dl>
      </section>

      <Placeholder
        title="Listado de newsletters en Fase 4"
        description="Aquí vendrán las tarjetas de newsletters con acciones (editar, duplicar, eliminar)."
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold text-[var(--color-accent)]">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
        {label}
      </div>
    </div>
  );
}
