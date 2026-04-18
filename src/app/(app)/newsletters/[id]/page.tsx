import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { ViewHeader } from "@/components/view-header";
import { Placeholder } from "@/components/placeholder";
import { NewsletterMetaForm } from "./meta-form";

export default async function NewsletterEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const newsletter = await db
    .select()
    .from(schema.newsletters)
    .where(
      and(
        eq(schema.newsletters.id, Number(id)),
        eq(schema.newsletters.userId, session.userId!)
      )
    )
    .get();

  if (!newsletter) notFound();

  return (
    <div className="space-y-6">
      <ViewHeader
        title={newsletter.name}
        actions={
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        }
      />

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          Detalles
        </h2>
        <NewsletterMetaForm
          id={newsletter.id}
          initialName={newsletter.name}
          initialDescription={newsletter.description ?? ""}
          initialStatus={newsletter.status as "draft" | "published"}
        />
      </section>

      <Placeholder
        title="Editor visual en Fase 6"
        description="Canvas tipo papel, sidebar de bloques, panel de propiedades y drag & drop."
      />
    </div>
  );
}
