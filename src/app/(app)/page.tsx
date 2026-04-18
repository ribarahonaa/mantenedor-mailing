import Link from "next/link";
import { Plus } from "lucide-react";
import { listNewsletters } from "@/lib/actions/newsletters";
import { NewsletterCard } from "@/components/newsletter-card";
import { ViewHeader } from "@/components/view-header";

export default async function NewslettersPage() {
  const newsletters = await listNewsletters();

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Mis newsletters"
        actions={
          <Link
            href="/newsletters/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            <Plus className="h-4 w-4" /> Nuevo newsletter
          </Link>
        }
      />

      {newsletters.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {newsletters.map((n) => (
            <NewsletterCard
              key={n.id}
              id={n.id}
              name={n.name}
              description={n.description}
              status={n.status as "draft" | "published"}
              sectionsCount={Number(n.sectionsCount)}
              updatedAt={n.updatedAt}
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
      <h3 className="text-base font-semibold">Aún no tienes newsletters</h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Crea el primero para empezar a armar tu mailing.
      </p>
      <Link
        href="/newsletters/new"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
      >
        <Plus className="h-4 w-4" /> Crear newsletter
      </Link>
    </div>
  );
}
