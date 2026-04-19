"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export type AdminUserRow = {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: string;
  newslettersCount: number;
};

/**
 * Lista todos los usuarios con su conteo de newsletters. Solo admin.
 */
export async function listAllUsers(): Promise<AdminUserRow[]> {
  await requireAdmin();
  const rows = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      role: schema.users.role,
      isActive: schema.users.isActive,
      createdAt: schema.users.createdAt,
      newslettersCount: sql<number>`COALESCE((SELECT COUNT(*) FROM newsletters nl WHERE nl.user_id = users.id), 0)`,
    })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt))
    .all();

  return rows.map((r) => ({
    ...r,
    newslettersCount: Number(r.newslettersCount ?? 0),
  }));
}

/**
 * Activa o desactiva una cuenta. Admin no puede desactivarse a sí mismo.
 */
export async function setUserActive(
  userId: number,
  active: boolean
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (userId === session.userId && !active) {
    return { ok: false, error: "No puedes desactivar tu propia cuenta" };
  }
  await db
    .update(schema.users)
    .set({ isActive: active, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(schema.users.id, userId));

  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Cambia el rol de un usuario. Admin no puede degradar su propio rol.
 */
export async function setUserRole(
  userId: number,
  role: "admin" | "user"
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (userId === session.userId && role !== "admin") {
    return { ok: false, error: "No puedes cambiar tu propio rol" };
  }
  await db
    .update(schema.users)
    .set({ role, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(schema.users.id, userId));

  revalidatePath("/admin/users");
  return { ok: true };
}

const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100);

/**
 * Setea una nueva contraseña para un usuario (reset administrativo).
 */
export async function resetUserPassword(
  userId: number,
  newPassword: string
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Contraseña inválida",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data, 10);
  await db
    .update(schema.users)
    .set({ passwordHash, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(schema.users.id, userId));

  // También invalidar cualquier token de reset pendiente
  await db
    .update(schema.passwordResetTokens)
    .set({ used: true })
    .where(eq(schema.passwordResetTokens.userId, userId));

  revalidatePath("/admin/users");
  return { ok: true };
}
