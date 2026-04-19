import {
  Users,
  Newspaper,
  Puzzle,
  Layers,
  Trophy,
  Flame,
  TrendingUp,
} from "lucide-react";
import { getAdminStats } from "@/lib/actions/admin";
import { ViewHeader } from "@/components/view-header";
import { ActivityChart } from "./activity-chart";
import { SectionsDonut } from "./sections-donut";

export default async function AdminStatsPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <ViewHeader title="Estadísticas" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Usuarios"
          value={stats.totals.users}
          sub={
            stats.totals.usersLast30 > 0
              ? `+${stats.totals.usersLast30} nuevos en 30 días`
              : "sin nuevos en 30 días"
          }
          tone="accent"
          highlight={stats.totals.usersLast30 > 0}
        />
        <StatCard
          icon={Newspaper}
          label="Newsletters"
          value={stats.totals.newsletters}
          sub={
            stats.totals.newslettersLast30 > 0
              ? `+${stats.totals.newslettersLast30} en 30 días`
              : "sin actividad en 30 días"
          }
          tone="info"
          highlight={stats.totals.newslettersLast30 > 0}
        />
        <StatCard
          icon={Puzzle}
          label="Secciones maestras"
          value={stats.totals.activeMasterSections}
          sub={
            stats.totals.inactiveMasterSections > 0
              ? `${stats.totals.inactiveMasterSections} inactivas`
              : "todas activas"
          }
          tone="success"
        />
        <StatCard
          icon={Layers}
          label="Bloques por newsletter"
          value={stats.totals.avgBlocksPerNewsletter}
          sub="promedio"
          tone="warning"
        />
      </div>

      <ActivityChart data={stats.newslettersByDay} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionsDonut data={stats.sectionsByType} />
        <LeaderboardCard
          icon={Trophy}
          title="Usuarios más activos"
          subtitle="Por cantidad de newsletters"
          rows={stats.topUsers.map((u) => ({
            primary: u.username,
            secondary: u.email,
            count: u.count,
          }))}
          emptyLabel="Aún no hay usuarios con newsletters."
        />
      </div>

      <LeaderboardCard
        icon={Flame}
        title="Bloques más reutilizados"
        subtitle="Veces que una sección maestra aparece en un newsletter"
        rows={stats.topMasterSections.map((m) => ({
          primary: m.name,
          secondary: m.type,
          count: m.count,
        }))}
        emptyLabel="Aún no hay bloques en uso."
      />
    </div>
  );
}

const toneStyles = {
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
  tone: keyof typeof toneStyles;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
            {label}
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
          <p
            className={`mt-1 inline-flex items-center gap-1 text-xs ${
              highlight ? "text-[var(--color-success)]" : "text-[var(--color-text-subtle)]"
            }`}
          >
            {highlight && <TrendingUp className="h-3 w-3" />}
            {sub}
          </p>
        </div>
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneStyles[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function LeaderboardCard({
  icon: Icon,
  title,
  subtitle,
  rows,
  emptyLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  rows: { primary: string; secondary: string; count: number }[];
  emptyLabel: string;
}) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0);
  const visible = rows.filter((r) => r.count > 0);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
      <header className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-[var(--color-text-subtle)]">{subtitle}</p>
        </div>
      </header>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--color-text-subtle)]">
          {emptyLabel}
        </p>
      ) : (
        <ol className="space-y-3">
          {visible.map((r, idx) => (
            <li key={`${r.primary}-${idx}`} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-3)] text-xs font-semibold text-[var(--color-text-subtle)]">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{r.primary}</div>
                    <div className="truncate text-xs text-[var(--color-text-subtle)]">
                      {r.secondary}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {r.count}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-3)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${max > 0 ? (r.count / max) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
