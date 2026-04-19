import { FileText, User } from "lucide-react";
import { listAllNewsletters } from "@/lib/actions/admin";
import { ViewHeader } from "@/components/view-header";

export default async function AdminNewslettersPage() {
  const rows = await listAllNewsletters();

  return (
    <div className="space-y-6">
      <ViewHeader title="Todos los newsletters" />

      <p className="text-sm text-[var(--color-text-muted)]">
        Vista de administrador. Muestra los newsletters de todos los usuarios.
        Solo lectura.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-12 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Aún no hay newsletters en el sistema.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-3)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Bloques</th>
                <th className="px-4 py-3">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-[var(--color-border)] transition hover:bg-[var(--color-surface-2)]"
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
                      {Number(r.sectionsCount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {formatDate(r.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
