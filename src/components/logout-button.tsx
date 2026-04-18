"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-danger-soft)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}
