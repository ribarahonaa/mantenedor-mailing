import Link from "next/link";
import { Mail } from "lucide-react";
import { LogoutButton } from "./logout-button";

export function AppHeader({
  username,
  role,
}: {
  username: string;
  role: "admin" | "user";
}) {
  return (
    <header className="sticky top-0 z-20 relative border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
      {/* Banda superior accent→purple */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%)" }}
      />
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <Mail className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Mantenedor de Mailings
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span className="font-medium text-[var(--color-text)]">{username}</span>
            <span className="inline-flex items-center rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)]">
              {role}
            </span>
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
