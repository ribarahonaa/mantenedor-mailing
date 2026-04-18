import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { ViewHeader } from "@/components/view-header";
import { NewsletterMetaForm } from "./meta-form";
import { NewsletterEditor } from "@/components/editor/newsletter-editor";

type Content = { html: string };

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

  const sectionsRaw = await db
    .select()
    .from(schema.newsletterSections)
    .where(eq(schema.newsletterSections.newsletterId, newsletter.id))
    .orderBy(asc(schema.newsletterSections.sectionOrder))
    .all();

  const sections = sectionsRaw.map((s) => ({
    id: s.id,
    masterSectionId: s.masterSectionId,
    sectionType: s.sectionType,
    title: s.title,
    content: (s.content as Content) ?? { html: "" },
    sectionOrder: s.sectionOrder,
    isCustomized: s.isCustomized,
  }));

  const masterBlocksRaw = await db
    .select({
      id: schema.masterSections.id,
      name: schema.masterSections.name,
      type: schema.masterSections.type,
      title: schema.masterSections.title,
    })
    .from(schema.masterSections)
    .where(eq(schema.masterSections.isActive, true))
    .orderBy(asc(schema.masterSections.type), asc(schema.masterSections.name))
    .all();

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

      <NewsletterEditor
        newsletterId={newsletter.id}
        initialSections={sections}
        masterBlocks={masterBlocksRaw}
      />
    </div>
  );
}
