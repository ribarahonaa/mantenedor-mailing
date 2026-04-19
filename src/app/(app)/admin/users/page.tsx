import { Shield, User, FileText } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { listAllUsers } from "@/lib/actions/users";
import { ViewHeader } from "@/components/view-header";
import { UserActions } from "./user-actions";

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const users = await listAllUsers();

  return (
    <div className="space-y-6">
      <ViewHeader title="Usuarios" />

      <p className="text-sm text-[var(--color-text-muted)]">
        Gestión de cuentas. Los usuarios desactivados no pueden iniciar sesión, pero sus newsletters se conservan.
      </p>

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-12 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            No hay usuarios registrados.
          </p>
        </div>
      ) : (
        <div className="card-surface overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="table-rich w-full text-sm">
            <thead className="bg-[var(--color-surface-3)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Newsletters</th>
                <th className="px-4 py-3">Creado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === session.userId;
                return (
                  <tr
                    key={u.id}
                    className="border-t border-[var(--color-border)] transition"
                  >
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                          <User className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <div className="font-medium">
                            {u.username}
                            {isSelf && (
                              <span className="ml-1.5 rounded-full bg-[var(--color-surface-3)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-text-subtle)]">
                                tú
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--color-text-subtle)]">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)]">
                          <Shield className="h-3 w-3" /> admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-3)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
                          usuario
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-success)]">
                          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)]" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)]">
                          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)]">
                        <FileText className="h-3.5 w-3.5" />
                        {u.newslettersCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <UserActions
                        userId={u.id}
                        username={u.username}
                        role={u.role}
                        isActive={u.isActive}
                        isSelf={isSelf}
                      />
                    </td>
                  </tr>
                );
              })}
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
