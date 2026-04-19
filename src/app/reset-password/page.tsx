"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2, ShieldAlert, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type State =
  | { kind: "validating" }
  | { kind: "invalid"; reason: string }
  | { kind: "ready"; username: string }
  | { kind: "done" };

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)]">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <p className="text-sm">Cargando…</p>
          </div>
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>({ kind: "validating" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid", reason: "Link de reset incompleto" });
      return;
    }
    fetch(`/api/auth/validate-reset-token/${encodeURIComponent(token)}`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok && d.valid) {
          setState({ kind: "ready", username: d.username });
        } else {
          setState({ kind: "invalid", reason: d.reason ?? "Link inválido o expirado" });
        }
      })
      .catch(() => setState({ kind: "invalid", reason: "No se pudo validar el link" }));
  }, [token]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (newPassword !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mínimo 6 caracteres");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Error restableciendo contraseña");
        return;
      }
      setState({ kind: "done" });
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Error de red");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg p-8">
        {state.kind === "validating" && (
          <div className="flex flex-col items-center gap-3 py-8 text-[var(--color-text-muted)]">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <p className="text-sm">Validando link…</p>
          </div>
        )}

        {state.kind === "invalid" && (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold">Link inválido</h1>
            <p className="text-sm text-[var(--color-text-muted)]">{state.reason}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
            >
              Volver al login
            </button>
          </div>
        )}

        {state.kind === "ready" && (
          <>
            <header className="mb-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mb-3">
                <KeyRound className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Hola, {state.username}
              </h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Establece una nueva contraseña para tu cuenta.
              </p>
            </header>

            {error && (
              <div className="mb-4 rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <Field label="Nueva contraseña" name="newPassword" />
              <Field label="Confirmar contraseña" name="confirm" />
              <button
                type="submit"
                disabled={busy}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white",
                  "transition hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                )}
              >
                {busy ? "..." : "Establecer nueva contraseña"}
              </button>
            </form>
          </>
        )}

        {state.kind === "done" && (
          <div className="flex flex-col items-center gap-3 text-center py-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold">Contraseña actualizada</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Redirigiendo al login…
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, name }: { label: string; name: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        className={cn(
          "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm",
          "transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]"
        )}
      />
    </label>
  );
}
