"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserCheck, UserX, Shield, ShieldOff, Save } from "lucide-react";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  setUserActive,
  setUserRole,
  resetUserPassword,
} from "@/lib/actions/users";

type Props = {
  userId: number;
  username: string;
  role: "admin" | "user";
  isActive: boolean;
  isSelf: boolean;
};

export function UserActions({ userId, username, role, isActive, isSelf }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"none" | "password" | "toggle" | "role">("none");

  function handleToggleActive() {
    setError(null);
    startTransition(async () => {
      const result = await setUserActive(userId, !isActive);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMode("none");
      router.refresh();
    });
  }

  function handleToggleRole() {
    setError(null);
    const nextRole: "admin" | "user" = role === "admin" ? "user" : "admin";
    startTransition(async () => {
      const result = await setUserRole(userId, nextRole);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMode("none");
      router.refresh();
    });
  }

  function handleResetPassword(newPassword: string) {
    setError(null);
    startTransition(async () => {
      const result = await resetUserPassword(userId, newPassword);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMode("none");
      router.refresh();
    });
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-accent-soft)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => setMode("password")}
        disabled={pending}
        className={btn}
        title="Cambiar contraseña"
      >
        <KeyRound className="h-3.5 w-3.5" /> Contraseña
      </button>

      <button
        type="button"
        onClick={() => setMode("role")}
        disabled={pending || isSelf}
        className={btn}
        title={isSelf ? "No puedes cambiar tu propio rol" : "Cambiar rol"}
      >
        {role === "admin" ? (
          <>
            <ShieldOff className="h-3.5 w-3.5" /> Hacer usuario
          </>
        ) : (
          <>
            <Shield className="h-3.5 w-3.5" /> Hacer admin
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => setMode("toggle")}
        disabled={pending || (isSelf && isActive)}
        className={
          isActive
            ? "inline-flex items-center gap-1.5 rounded-md border border-[var(--color-danger-soft)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)] disabled:opacity-50"
            : "inline-flex items-center gap-1.5 rounded-md border border-[var(--color-success-soft)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-success)] transition hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] disabled:opacity-50"
        }
        title={
          isSelf && isActive
            ? "No puedes desactivar tu propia cuenta"
            : isActive
              ? "Desactivar cuenta"
              : "Activar cuenta"
        }
      >
        {isActive ? (
          <>
            <UserX className="h-3.5 w-3.5" /> Desactivar
          </>
        ) : (
          <>
            <UserCheck className="h-3.5 w-3.5" /> Activar
          </>
        )}
      </button>

      {error && (
        <span className="ml-2 text-xs text-[var(--color-danger)]">{error}</span>
      )}

      {mode === "password" && (
        <PasswordModal
          username={username}
          pending={pending}
          onClose={() => setMode("none")}
          onSubmit={handleResetPassword}
        />
      )}

      <ConfirmDialog
        open={mode === "toggle"}
        onClose={() => setMode("none")}
        onConfirm={handleToggleActive}
        title={isActive ? "Desactivar cuenta" : "Activar cuenta"}
        description={
          isActive ? (
            <>
              El usuario <strong>{username}</strong> no podrá iniciar sesión mientras esté desactivado. Sus newsletters se conservan.
            </>
          ) : (
            <>
              El usuario <strong>{username}</strong> podrá volver a iniciar sesión.
            </>
          )
        }
        confirmLabel={isActive ? "Desactivar" : "Activar"}
        tone={isActive ? "danger" : "warning"}
        pending={pending}
      />

      <ConfirmDialog
        open={mode === "role"}
        onClose={() => setMode("none")}
        onConfirm={handleToggleRole}
        title={role === "admin" ? "Quitar rol de admin" : "Promover a admin"}
        description={
          role === "admin" ? (
            <>
              El usuario <strong>{username}</strong> perderá permisos de administrador.
            </>
          ) : (
            <>
              El usuario <strong>{username}</strong> ganará permisos de administrador — podrá ver todos los newsletters, gestionar usuarios y secciones maestras.
            </>
          )
        }
        confirmLabel={role === "admin" ? "Hacer usuario" : "Hacer admin"}
        tone="warning"
        pending={pending}
      />
    </div>
  );
}

function PasswordModal({
  username,
  pending,
  onClose,
  onSubmit,
}: {
  username: string;
  pending: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }
    setLocalError(null);
    onSubmit(password);
  }

  return (
    <Modal
      open
      onClose={pending ? () => {} : onClose}
      title={`Cambiar contraseña · ${username}`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="reset-password-form"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {pending ? "Guardando…" : "Guardar"}
          </button>
        </>
      }
    >
      <form id="reset-password-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-[var(--color-text-muted)]">
          La nueva contraseña reemplaza la actual. Los tokens de reset pendientes de este usuario quedan invalidados.
        </p>

        {localError && (
          <div className="rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {localError}
          </div>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Nueva contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Confirmar</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]"
          />
        </label>
      </form>
    </Modal>
  );
}
