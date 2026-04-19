"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { DateInput } from "@/components/date-input";
import { UserSelect, type UserOption } from "@/components/user-select";

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
  const router = useRouter();
  const [name, setName] = useState(defaults.name ?? "");
  const [username, setUsername] = useState(defaults.username ?? "");
  const [createdFrom, setCreatedFrom] = useState(defaults.createdFrom ?? "");
  const [createdTo, setCreatedTo] = useState(defaults.createdTo ?? "");
  const [updatedFrom, setUpdatedFrom] = useState(defaults.updatedFrom ?? "");
  const [updatedTo, setUpdatedTo] = useState(defaults.updatedTo ?? "");

  const userOptions: UserOption[] = users.map((u) => ({
    value: u.username,
    label: u.username,
    email: u.email,
  }));

  // Al elegir "Desde": si "Hasta" está vacío o antes del nuevo valor, lo alineamos.
  function handleFromChange(
    value: string,
    currentTo: string,
    setFrom: (v: string) => void,
    setTo: (v: string) => void
  ) {
    setFrom(value);
    if (value && (!currentTo || currentTo < value)) {
      setTo(value);
    }
  }

  function handleClear() {
    setName("");
    setUsername("");
    setCreatedFrom("");
    setCreatedTo("");
    setUpdatedFrom("");
    setUpdatedTo("");
    router.push("/admin/newsletters");
  }

  const spanCls =
    "text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]";
  const miniCls = "text-[11px] text-[var(--color-text-subtle)]";
  const textInput =
    "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]";

  return (
    <form
      action="/admin/newsletters"
      method="get"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs"
    >
      {/* Reset página al aplicar filtros */}
      <input type="hidden" name="page" value="1" />

      <div className="grid gap-3 md:grid-cols-3">
        <label className="block space-y-1">
          <span className={spanCls}>Nombre</span>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contiene…"
            className={textInput}
          />
        </label>

        <div className="space-y-1">
          <span className={spanCls}>Usuario</span>
          <UserSelect
            name="username"
            value={username}
            onChange={setUsername}
            options={userOptions}
          />
        </div>

        <div className="hidden md:block" />

        <div className="space-y-1">
          <span className={spanCls}>Creado</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className={miniCls}>Desde</span>
              <DateInput
                name="createdFrom"
                value={createdFrom}
                max={createdTo || undefined}
                onChange={(v) =>
                  handleFromChange(v, createdTo, setCreatedFrom, setCreatedTo)
                }
              />
            </div>
            <div className="space-y-1">
              <span className={miniCls}>Hasta</span>
              <DateInput
                name="createdTo"
                value={createdTo}
                min={createdFrom || undefined}
                onChange={setCreatedTo}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <span className={spanCls}>Actualizado</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className={miniCls}>Desde</span>
              <DateInput
                name="updatedFrom"
                value={updatedFrom}
                max={updatedTo || undefined}
                onChange={(v) =>
                  handleFromChange(v, updatedTo, setUpdatedFrom, setUpdatedTo)
                }
              />
            </div>
            <div className="space-y-1">
              <span className={miniCls}>Hasta</span>
              <DateInput
                name="updatedTo"
                value={updatedTo}
                min={updatedFrom || undefined}
                onChange={setUpdatedTo}
              />
            </div>
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
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
            >
              <X className="h-3.5 w-3.5" /> Limpiar
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
