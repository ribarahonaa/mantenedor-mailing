"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type Point = { day: string; count: number };

export function ActivityChart({ data }: { data: Point[] }) {
  const rows = useMemo(
    () =>
      data.map((d) => ({
        day: d.day,
        label: format(parseISO(d.day), "d MMM", { locale: es }),
        count: d.count,
      })),
    [data]
  );

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const empty = total === 0;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Actividad</h2>
          <p className="text-xs text-[var(--color-text-subtle)]">
            Newsletters creados por día · últimos 30 días
          </p>
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">
          <strong className="text-[var(--color-text)]">{total}</strong> en total
        </span>
      </header>

      {empty ? (
        <p className="py-12 text-center text-sm text-[var(--color-text-subtle)]">
          Sin actividad en los últimos 30 días.
        </p>
      ) : (
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-text-subtle)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--color-text-subtle)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--color-text-subtle)" }}
                formatter={(v: number) => [`${v} newsletter${v === 1 ? "" : "s"}`, "Creados"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#activity-fill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
