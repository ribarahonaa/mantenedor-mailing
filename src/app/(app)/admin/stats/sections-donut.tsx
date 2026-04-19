"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Slice = { type: string; count: number };

const PALETTE = [
  "#4f46e5", // accent / indigo
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#6366f1", // indigo-2
  "#14b8a6", // teal
  "#f97316", // orange
];

export function SectionsDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, r) => s + r.count, 0);

  return (
    <div className="card-surface rounded-xl border border-[var(--color-border)] p-5">
      <header className="mb-4">
        <h2 className="text-base font-semibold tracking-tight">
          Distribución por tipo
        </h2>
        <p className="text-xs text-[var(--color-text-subtle)]">
          Secciones usadas en todos los newsletters
        </p>
      </header>

      {total === 0 ? (
        <p className="py-12 text-center text-sm text-[var(--color-text-subtle)]">
          Aún no hay bloques en uso.
        </p>
      ) : (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-[180px] w-[180px] shrink-0 self-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number, name: string) => [`${v}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tracking-tight">{total}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                bloques
              </span>
            </div>
          </div>

          <ul className="flex-1 space-y-1.5 overflow-auto text-sm">
            {data.map((s, i) => {
              const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
              return (
                <li
                  key={s.type}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-[var(--color-surface-3)]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ background: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="truncate">{s.type}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--color-text-muted)]">
                    {s.count}{" "}
                    <span className="text-xs text-[var(--color-text-subtle)]">
                      ({pct}%)
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
