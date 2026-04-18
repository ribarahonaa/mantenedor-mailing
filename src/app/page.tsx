import { db, schema } from "@/lib/db";

export default async function HomePage() {
  const users = await db.select().from(schema.users).all();
  const sections = await db.select().from(schema.masterSections).all();
  const newsletters = await db.select().from(schema.newsletters).all();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Mantenedor de Mailings
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Foundation lista · Next.js 16 + Drizzle + libSQL
          </p>
        </header>

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

        <p className="text-xs text-center text-[var(--color-text-subtle)]">
          Features (auth, CRUD, editor) en construcción.
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold text-[var(--color-accent)]">{value}</div>
      <div className="text-xs text-[var(--color-text-subtle)] uppercase tracking-wide mt-1">
        {label}
      </div>
    </div>
  );
}
