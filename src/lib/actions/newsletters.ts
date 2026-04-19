"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireSession } from "@/lib/session";

const createSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(120),
  description: z.string().trim().max(500).optional().default(""),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
});

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/** Listar newsletters del usuario actual (con conteo de secciones). */
export async function listNewsletters() {
  const session = await requireSession();
  const rows = await db
    .select({
      id: schema.newsletters.id,
      name: schema.newsletters.name,
      description: schema.newsletters.description,
      createdAt: schema.newsletters.createdAt,
      updatedAt: schema.newsletters.updatedAt,
      sectionsCount: sql<number>`COALESCE((SELECT COUNT(*) FROM newsletter_sections ns WHERE ns.newsletter_id = newsletters.id), 0)`,
    })
    .from(schema.newsletters)
    .where(eq(schema.newsletters.userId, session.userId!))
    .orderBy(desc(schema.newsletters.updatedAt))
    .all();
  return rows;
}

export async function createNewsletter(formData: FormData): Promise<ActionResult<{ id: number }>> {
  const session = await requireSession();
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const inserted = await db
    .insert(schema.newsletters)
    .values({
      userId: session.userId!,
      name: parsed.data.name,
      description: parsed.data.description || null,
    })
    .returning({ id: schema.newsletters.id })
    .get();

  revalidatePath("/");
  redirect(`/newsletters/${inserted.id}`);
}

export async function updateNewsletter(
  id: number,
  input: z.infer<typeof updateSchema>
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const result = await db
    .update(schema.newsletters)
    .set({ ...parsed.data, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(
      and(eq(schema.newsletters.id, id), eq(schema.newsletters.userId, session.userId!))
    )
    .returning({ id: schema.newsletters.id })
    .get();

  if (!result) return { ok: false, error: "Newsletter no encontrado" };

  revalidatePath("/");
  revalidatePath(`/newsletters/${id}`);
  return { ok: true };
}

export async function deleteNewsletter(id: number): Promise<ActionResult> {
  const session = await requireSession();

  const owned = await db
    .select({ id: schema.newsletters.id })
    .from(schema.newsletters)
    .where(
      and(eq(schema.newsletters.id, id), eq(schema.newsletters.userId, session.userId!))
    )
    .get();

  if (!owned) return { ok: false, error: "Newsletter no encontrado" };

  // Las secciones se borran en cascada por la FK del schema
  await db.delete(schema.newsletters).where(eq(schema.newsletters.id, id));

  revalidatePath("/");
  return { ok: true };
}

export async function duplicateNewsletter(id: number): Promise<ActionResult<{ id: number }>> {
  const session = await requireSession();

  const original = await db
    .select()
    .from(schema.newsletters)
    .where(
      and(eq(schema.newsletters.id, id), eq(schema.newsletters.userId, session.userId!))
    )
    .get();

  if (!original) return { ok: false, error: "Newsletter no encontrado" };

  const copy = await db
    .insert(schema.newsletters)
    .values({
      userId: session.userId!,
      name: `${original.name} (copia)`,
      description: original.description,
    })
    .returning({ id: schema.newsletters.id })
    .get();

  const sections = await db
    .select()
    .from(schema.newsletterSections)
    .where(eq(schema.newsletterSections.newsletterId, id))
    .all();

  if (sections.length > 0) {
    await db.insert(schema.newsletterSections).values(
      sections.map((s) => ({
        newsletterId: copy.id,
        masterSectionId: s.masterSectionId,
        sectionType: s.sectionType,
        title: s.title,
        content: s.content,
        sectionOrder: s.sectionOrder,
        isCustomized: s.isCustomized,
      }))
    );
  }

  revalidatePath("/");
  return { ok: true, data: { id: copy.id } };
}
