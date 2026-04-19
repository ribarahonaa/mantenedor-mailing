"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Puzzle, Shield, BarChart3, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (pathname: string) => boolean;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Mis newsletters",
    icon: Newspaper,
    match: (p) => p === "/" || p.startsWith("/newsletters/"),
  },
  {
    href: "/master-sections",
    label: "Secciones maestras",
    icon: Puzzle,
    adminOnly: true,
  },
  {
    href: "/admin/newsletters",
    label: "Todos los newsletters",
    icon: Shield,
    adminOnly: true,
  },
  {
    href: "/admin/users",
    label: "Usuarios",
    icon: Users,
    adminOnly: true,
  },
  {
    href: "/admin/stats",
    label: "Estadísticas",
    icon: BarChart3,
    adminOnly: true,
  },
];

export function AppNav({ role }: { role: "admin" | "user" }) {
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex h-[52px] max-w-[1400px] items-center gap-1 overflow-x-auto px-6">
        {items.map((item) => {
          const isActive = item.match ? item.match(pathname) : pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative inline-flex h-full items-center gap-2 whitespace-nowrap border-b-2 px-4 text-sm font-medium transition",
                isActive
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 inset-y-2 rounded-md"
                  style={{ background: "var(--gradient-accent-soft)" }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
