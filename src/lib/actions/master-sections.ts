"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const upsertSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(120),
  type: z.string().trim().min(1, "El tipo es requerido").max(50),
  title: z.string().trim().min(1, "El título es requerido").max(200),
  html: z.string().default(""),
});

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/** Lista las secciones maestras activas (no soft-deleted). */
export async function listMasterSections() {
  await requireAdmin();
  return db
    .select()
    .from(schema.masterSections)
    .where(eq(schema.masterSections.isActive, true))
    .orderBy(desc(schema.masterSections.updatedAt))
    .all();
}

export async function getMasterSection(id: number) {
  await requireAdmin();
  return db
    .select()
    .from(schema.masterSections)
    .where(eq(schema.masterSections.id, id))
    .get();
}

function parseForm(formData: FormData) {
  return upsertSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    title: formData.get("title"),
    html: formData.get("html") ?? "",
  });
}

export async function createMasterSection(
  formData: FormData
): Promise<ActionResult<{ id: number }>> {
  const session = await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const inserted = await db
    .insert(schema.masterSections)
    .values({
      name: parsed.data.name,
      type: parsed.data.type,
      title: parsed.data.title,
      content: { html: parsed.data.html },
      createdBy: session.userId!,
    })
    .returning({ id: schema.masterSections.id })
    .get();

  revalidatePath("/master-sections");
  redirect(`/master-sections/${inserted.id}`);
}

export async function updateMasterSection(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const result = await db
    .update(schema.masterSections)
    .set({
      name: parsed.data.name,
      type: parsed.data.type,
      title: parsed.data.title,
      content: { html: parsed.data.html },
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(schema.masterSections.id, id))
    .returning({ id: schema.masterSections.id })
    .get();

  if (!result) return { ok: false, error: "Sección no encontrada" };

  revalidatePath("/master-sections");
  revalidatePath(`/master-sections/${id}`);
  return { ok: true };
}

export async function deleteMasterSection(id: number): Promise<ActionResult> {
  await requireAdmin();
  // Soft-delete: mantiene integridad con newsletter_sections existentes
  const result = await db
    .update(schema.masterSections)
    .set({ isActive: false, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(and(eq(schema.masterSections.id, id), eq(schema.masterSections.isActive, true)))
    .returning({ id: schema.masterSections.id })
    .get();

  if (!result) return { ok: false, error: "Sección no encontrada" };

  revalidatePath("/master-sections");
  return { ok: true };
}

export async function duplicateMasterSection(
  id: number
): Promise<ActionResult<{ id: number }>> {
  const session = await requireAdmin();

  const original = await db
    .select()
    .from(schema.masterSections)
    .where(eq(schema.masterSections.id, id))
    .get();

  if (!original) return { ok: false, error: "Sección no encontrada" };

  const copy = await db
    .insert(schema.masterSections)
    .values({
      name: `${original.name} (copia)`,
      type: original.type,
      title: original.title,
      content: original.content,
      createdBy: session.userId!,
    })
    .returning({ id: schema.masterSections.id })
    .get();

  revalidatePath("/master-sections");
  return { ok: true, data: { id: copy.id } };
}
