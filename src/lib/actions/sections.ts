"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireSession } from "@/lib/session";
import type { SectionContent } from "@/lib/db/schema";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/**
 * Verifica que el newsletter exista y pertenezca al usuario de la sesión.
 * Retorna el newsletter o lanza 404.
 */
async function requireOwnedNewsletter(newsletterId: number) {
  const session = await requireSession();
  const row = await db
    .select({ id: schema.newsletters.id })
    .from(schema.newsletters)
    .where(
      and(
        eq(schema.newsletters.id, newsletterId),
        eq(schema.newsletters.userId, session.userId!)
      )
    )
    .get();
  if (!row) throw new Error("Newsletter no encontrado o sin permisos");
  return row;
}

async function requireOwnedSection(sectionId: number) {
  const session = await requireSession();
  const row = await db
    .select({
      id: schema.newsletterSections.id,
      newsletterId: schema.newsletterSections.newsletterId,
    })
    .from(schema.newsletterSections)
    .innerJoin(
      schema.newsletters,
      eq(schema.newsletters.id, schema.newsletterSections.newsletterId)
    )
    .where(
      and(
        eq(schema.newsletterSections.id, sectionId),
        eq(schema.newsletters.userId, session.userId!)
      )
    )
    .get();
  if (!row) throw new Error("Sección no encontrada o sin permisos");
  return row;
}

/**
 * Inserta una sección en el newsletter copiando desde una master.
 * `insertIndex`: posición (0-based) donde se inserta; secciones >= index
 * se desplazan +1 en `section_order`.
 */
export async function addSectionToNewsletter(
  newsletterId: number,
  masterSectionId: number,
  insertIndex: number
): Promise<ActionResult<{ id: number }>> {
  try {
    await requireOwnedNewsletter(newsletterId);

    const master = await db
      .select()
      .from(schema.masterSections)
      .where(
        and(
          eq(schema.masterSections.id, masterSectionId),
          eq(schema.masterSections.isActive, true)
        )
      )
      .get();
    if (!master) return { ok: false, error: "Sección maestra no encontrada" };

    // Desplazar las existentes cuyo order >= insertIndex
    await db
      .update(schema.newsletterSections)
      .set({ sectionOrder: sql`${schema.newsletterSections.sectionOrder} + 1` })
      .where(
        and(
          eq(schema.newsletterSections.newsletterId, newsletterId),
          sql`${schema.newsletterSections.sectionOrder} >= ${insertIndex}`
        )
      );

    const inserted = await db
      .insert(schema.newsletterSections)
      .values({
        newsletterId,
        masterSectionId: master.id,
        sectionType: master.type,
        title: master.title,
        content: master.content as SectionContent,
        sectionOrder: insertIndex,
        isCustomized: false,
      })
      .returning({ id: schema.newsletterSections.id })
      .get();

    await touchNewsletter(newsletterId);
    revalidatePath(`/newsletters/${newsletterId}`);
    return { ok: true, data: { id: inserted.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

/**
 * Reordena todas las secciones del newsletter según el arreglo de IDs recibido.
 * El orden del arreglo define el nuevo `section_order` (0..N-1).
 */
export async function reorderSections(
  newsletterId: number,
  orderedIds: number[]
): Promise<ActionResult> {
  try {
    await requireOwnedNewsletter(newsletterId);

    // Actualizar cada sección a su nuevo índice.
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(schema.newsletterSections)
        .set({ sectionOrder: i, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(
          and(
            eq(schema.newsletterSections.id, orderedIds[i]),
            eq(schema.newsletterSections.newsletterId, newsletterId)
          )
        );
    }
    await touchNewsletter(newsletterId);
    revalidatePath(`/newsletters/${newsletterId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  html: z.string().optional(),
});

/** Actualiza título y/o HTML de una sección. Marca is_customized=true. */
export async function updateSection(
  sectionId: number,
  patch: { title?: string; html?: string }
): Promise<ActionResult> {
  try {
    const section = await requireOwnedSection(sectionId);
    const parsed = updateSchema.safeParse(patch);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }

    const current = await db
      .select()
      .from(schema.newsletterSections)
      .where(eq(schema.newsletterSections.id, sectionId))
      .get();
    if (!current) return { ok: false, error: "Sección no encontrada" };

    const nextContent: SectionContent = {
      html: parsed.data.html ?? (current.content as SectionContent).html,
    };

    await db
      .update(schema.newsletterSections)
      .set({
        title: parsed.data.title ?? current.title,
        content: nextContent,
        isCustomized: true,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(schema.newsletterSections.id, sectionId));

    await touchNewsletter(section.newsletterId);
    revalidatePath(`/newsletters/${section.newsletterId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

/** Elimina una sección. Compacta los `section_order` de las siguientes. */
export async function deleteSection(sectionId: number): Promise<ActionResult> {
  try {
    const section = await requireOwnedSection(sectionId);
    const row = await db
      .select({
        newsletterId: schema.newsletterSections.newsletterId,
        order: schema.newsletterSections.sectionOrder,
      })
      .from(schema.newsletterSections)
      .where(eq(schema.newsletterSections.id, sectionId))
      .get();
    if (!row) return { ok: false, error: "Sección no encontrada" };

    await db
      .delete(schema.newsletterSections)
      .where(eq(schema.newsletterSections.id, sectionId));

    // Compactar orders: las que estaban >= order bajan 1
    await db
      .update(schema.newsletterSections)
      .set({ sectionOrder: sql`${schema.newsletterSections.sectionOrder} - 1` })
      .where(
        and(
          eq(schema.newsletterSections.newsletterId, row.newsletterId),
          sql`${schema.newsletterSections.sectionOrder} > ${row.order}`
        )
      );

    await touchNewsletter(section.newsletterId);
    revalidatePath(`/newsletters/${section.newsletterId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

/** Actualiza el timestamp del newsletter para que la lista refleje "hace X min". */
async function touchNewsletter(newsletterId: number) {
  await db
    .update(schema.newsletters)
    .set({ updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(schema.newsletters.id, newsletterId));
}
