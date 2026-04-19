"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, X } from "lucide-react";

type Defaults = {
  name?: string;
  username?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

export function FilterForm({
  defaults,
  users,
  hasActive,
}: {
  defaults: Defaults;
  users: { username: string; email: string }[];
  hasActive: boolean;
}) {
  const [createdFrom, setCreatedFrom] = useState(defaults.createdFrom ?? "");
  const [createdTo, setCreatedTo] = useState(defaults.createdTo ?? "");
  const [updatedFrom, setUpdatedFrom] = useState(defaults.updatedFrom ?? "");
  const [updatedTo, setUpdatedTo] = useState(defaults.updatedTo ?? "");

  const input =
    "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]";
  const labelCls = "block space-y-1";
  const spanCls =
    "text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]";
  const miniCls = "text-[11px] text-[var(--color-text-subtle)]";

  return (
    <form
      action="/admin/newsletters"
      method="get"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs"
    >
      {/* Reset página al aplicar filtros */}
      <input type="hidden" name="page" value="1" />

      <div className="grid gap-3 md:grid-cols-3">
        <label className={labelCls}>
          <span className={spanCls}>Nombre</span>
          <input
            name="name"
            defaultValue={defaults.name ?? ""}
            placeholder="Contiene…"
            className={input}
          />
        </label>

        <label className={labelCls}>
          <span className={spanCls}>Usuario</span>
          <select
            name="username"
            defaultValue={defaults.username ?? ""}
            className={input}
          >
            <option value="">Todos</option>
            {users.map((u) => (
              <option key={u.username} value={u.username}>
                {u.username} · {u.email}
              </option>
            ))}
          </select>
        </label>

        <div className="hidden md:block" />

        <div className="space-y-1">
          <span className={spanCls}>Creado</span>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className={miniCls}>Desde</span>
              <input
                type="date"
                name="createdFrom"
                value={createdFrom}
                max={createdTo || undefined}
                onChange={(e) => setCreatedFrom(e.target.value)}
                className={input}
              />
            </label>
            <label className="space-y-1">
              <span className={miniCls}>Hasta</span>
              <input
                type="date"
                name="createdTo"
                value={createdTo}
                min={createdFrom || undefined}
                onChange={(e) => setCreatedTo(e.target.value)}
                className={input}
              />
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <span className={spanCls}>Actualizado</span>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className={miniCls}>Desde</span>
              <input
                type="date"
                name="updatedFrom"
                value={updatedFrom}
                max={updatedTo || undefined}
                onChange={(e) => setUpdatedFrom(e.target.value)}
                className={input}
              />
            </label>
            <label className="space-y-1">
              <span className={miniCls}>Hasta</span>
              <input
                type="date"
                name="updatedTo"
                value={updatedTo}
                min={updatedFrom || undefined}
                onChange={(e) => setUpdatedTo(e.target.value)}
                className={input}
              />
            </label>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            <Search className="h-4 w-4" /> Aplicar
          </button>
          {hasActive && (
            <Link
              href="/admin/newsletters"
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
            >
              <X className="h-3.5 w-3.5" /> Limpiar
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
