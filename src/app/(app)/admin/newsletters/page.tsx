import Link from "next/link";
import { FileText, User, ChevronLeft, ChevronRight } from "lucide-react";
import {
  listAllNewsletters,
  listUsernamesForAdmin,
  type NewsletterFilters,
} from "@/lib/actions/admin";
import { ViewHeader } from "@/components/view-header";
import { AdminPreviewButton } from "./preview-button";
import { FilterForm } from "./filter-form";

type SearchParams = {
  name?: string;
  username?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: string;
};

export default async function AdminNewslettersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const filters: NewsletterFilters = {
    name: sp.name || undefined,
    username: sp.username || undefined,
    createdFrom: sp.createdFrom || undefined,
    createdTo: sp.createdTo || undefined,
    updatedFrom: sp.updatedFrom || undefined,
    updatedTo: sp.updatedTo || undefined,
    page: sp.page ? Number(sp.page) : 1,
  };

  const [{ rows, total, page, pageSize }, users] = await Promise.all([
    listAllNewsletters(filters),
    listUsernamesForAdmin(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasActiveFilters = Boolean(
    sp.name || sp.username || sp.createdFrom || sp.createdTo || sp.updatedFrom || sp.updatedTo
  );

  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      <ViewHeader title="Todos los newsletters" />

      <p className="text-sm text-[var(--color-text-muted)]">
        Vista de administrador. Muestra los newsletters de todos los usuarios. Solo lectura.
      </p>

      <FilterForm defaults={sp} users={users} hasActive={hasActiveFilters} />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-12 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            {hasActiveFilters
              ? "Ningún newsletter coincide con los filtros."
              : "Aún no hay newsletters en el sistema."}
          </p>
        </div>
      ) : (
        <>
          <div className="card-surface overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="table-rich w-full text-sm">
              <thead className="bg-[var(--color-surface-3)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Bloques</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3">Actualizado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[var(--color-border)] transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.name}</div>
                      {r.description && (
                        <div className="line-clamp-1 text-xs text-[var(--color-text-subtle)]">
                          {r.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                          <User className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <div className="font-medium">{r.ownerUsername}</div>
                          <div className="text-xs text-[var(--color-text-subtle)]">
                            {r.ownerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)]">
                        <FileText className="h-3.5 w-3.5" />
                        {r.sectionsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {formatDate(r.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AdminPreviewButton id={r.id} name={r.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            first={first}
            last={last}
            total={total}
            searchParams={sp}
          />
        </>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  first,
  last,
  total,
  searchParams,
}: {
  page: number;
  totalPages: number;
  first: number;
  last: number;
  total: number;
  searchParams: SearchParams;
}) {
  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, String(v));
    }
    params.set("page", String(p));
    return `/admin/newsletters?${params.toString()}`;
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const pill =
    "inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]";
  const pillDisabled =
    "inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-3)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-subtle)] opacity-50";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-text-muted)]">
      <span>
        Mostrando <strong>{first}</strong>–<strong>{last}</strong> de{" "}
        <strong>{total}</strong>
      </span>
      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span className={pillDisabled}>
            <ChevronLeft className="h-4 w-4" /> Anterior
          </span>
        ) : (
          <Link href={hrefFor(page - 1)} className={pill}>
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Link>
        )}
        <span className="text-xs text-[var(--color-text-subtle)]">
          Página {page} de {totalPages}
        </span>
        {nextDisabled ? (
          <span className={pillDisabled}>
            Siguiente <ChevronRight className="h-4 w-4" />
          </span>
        ) : (
          <Link href={hrefFor(page + 1)} className={pill}>
            Siguiente <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
