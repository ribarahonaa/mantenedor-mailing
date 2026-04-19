"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, LogIn, UserPlus, KeyRound, ArrowLeft, Copy, Link2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NeuralBackground } from "@/components/neural-background";

type Panel = "login" | "register" | "forgot" | "result";

export default function LoginPage() {
  const [panel, setPanel] = useState<Panel>("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const router = useRouter();

  async function submit(url: string, data: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Algo salió mal");
        return null;
      }
      return json;
    } catch {
      setError("Error de red");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await submit("/api/auth/login", {
      username: form.get("username"),
      password: form.get("password"),
    });
    if (result) router.push("/");
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await submit("/api/auth/register", {
      username: form.get("username"),
      email: form.get("email"),
      password: form.get("password"),
    });
    if (result) router.push("/");
  }

  async function handleForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await submit("/api/auth/forgot-password", {
      email: form.get("email"),
    });
    if (result) {
      if (result.resetUrl) {
        setResetLink(result.resetUrl);
        setPanel("result");
      } else {
        setError(result.message);
      }
    }
  }

  function switchPanel(next: Panel) {
    setError(null);
    setPanel(next);
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(700px 500px at 15% 20%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(600px 500px at 85% 80%, rgba(255,255,255,0.12), transparent 60%), linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #8b5cf6 100%)",
      }}
    >
      {/* Textura de puntos sutil sobre todo el fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.28) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Red neuronal cubre todo el viewport; sigue el cursor donde esté */}
      <NeuralBackground />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        <aside className="hidden lg:flex items-center justify-center p-12 text-white">
          <div className="max-w-md space-y-6">
          <div className="inline-flex items-center gap-3 text-lg font-semibold">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15 backdrop-blur">
              <Mail className="h-5 w-5" />
            </span>
            Mantenedor de Mailings
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Newsletters que enganchan, sin fricción.
          </h1>
          <p className="text-white/85 text-lg leading-relaxed">
            Diseña, edita y gestiona tus mailings con un editor visual pensado
            para equipos.
          </p>
          <ul className="space-y-3 pt-2">
            {[
              "Secciones maestras reutilizables",
              "Editor tipo papel con drag & drop",
              "Vista previa y copiar HTML",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-white/92">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg p-8 lg:p-10">
          <header className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              {panel === "result"
                ? "Link generado"
                : panel === "forgot"
                  ? "Recuperar contraseña"
                  : panel === "register"
                    ? "Crear cuenta"
                    : "Bienvenido"}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {panel === "login" && "Inicia sesión para gestionar tus newsletters"}
              {panel === "register" && "Regístrate para empezar"}
              {panel === "forgot" && "Te enviaremos un link para restablecer tu contraseña"}
              {panel === "result" && "Cópialo y ábrelo para establecer una nueva contraseña"}
            </p>
          </header>

          {(panel === "login" || panel === "register") && (
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-[var(--color-surface-3)] p-1">
              <TabButton active={panel === "login"} onClick={() => switchPanel("login")}>
                Iniciar sesión
              </TabButton>
              <TabButton active={panel === "register"} onClick={() => switchPanel("register")}>
                Registrarse
              </TabButton>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          )}

          {panel === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Usuario" name="username" autoComplete="username" required />
              <Field label="Contraseña" name="password" type="password" autoComplete="current-password" required />
              <PrimaryButton busy={busy}>
                <LogIn className="h-4 w-4" /> Iniciar sesión
              </PrimaryButton>
              <p className="text-center text-sm">
                <button
                  type="button"
                  className="text-[var(--color-accent)] hover:underline"
                  onClick={() => switchPanel("forgot")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </p>
            </form>
          )}

          {panel === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="Usuario" name="username" required minLength={3} />
              <Field label="Email" name="email" type="email" autoComplete="email" required />
              <Field label="Contraseña" name="password" type="password" autoComplete="new-password" required minLength={6} />
              <PrimaryButton busy={busy}>
                <UserPlus className="h-4 w-4" /> Crear cuenta
              </PrimaryButton>
            </form>
          )}

          {panel === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <Field label="Email" name="email" type="email" autoComplete="email" required />
              <PrimaryButton busy={busy}>
                <KeyRound className="h-4 w-4" /> Enviar link de reset
              </PrimaryButton>
              <BackLink onClick={() => switchPanel("login")} />
            </form>
          )}

          {panel === "result" && resetLink && (
            <div className="space-y-4 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Link2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                En producción este link se enviaría por email. Cópialo y ábrelo
                para establecer tu nueva contraseña.
              </p>
              <CopyableUrl url={resetLink} />
              <p className="text-xs text-[var(--color-text-subtle)]">
                Válido por 1 hora · uso único
              </p>
              <BackLink onClick={() => switchPanel("login")} />
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}

// ===== UI subcomponents =====

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-[var(--color-surface)] text-[var(--color-accent)] shadow-sm"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className={cn(
          "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm",
          "transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]"
        )}
      />
    </label>
  );
}

function PrimaryButton({
  busy,
  children,
}: {
  busy?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white",
        "transition hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-active)] disabled:opacity-50"
      )}
    >
      {busy ? "..." : children}
    </button>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <p className="text-center text-sm">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline"
      >
        <ArrowLeft className="h-3 w-3" /> Volver al inicio de sesión
      </button>
    </p>
  );
}

function CopyableUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[var(--color-surface-3)] p-2">
      <input
        readOnly
        value={url}
        className="flex-1 bg-transparent px-2 py-1 font-mono text-xs outline-none"
      />
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
      >
        <Copy className="h-3 w-3" />
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
