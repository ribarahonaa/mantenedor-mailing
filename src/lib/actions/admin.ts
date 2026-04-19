"use server";

import { asc, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import type { SectionContent } from "@/lib/db/schema";

/**
 * Lista todos los newsletters del sistema con el nombre del owner
 * y la cantidad de bloques. Solo admin.
 */
export async function listAllNewsletters() {
  await requireAdmin();
  return db
    .select({
      id: schema.newsletters.id,
      name: schema.newsletters.name,
      description: schema.newsletters.description,
      ownerId: schema.users.id,
      ownerUsername: schema.users.username,
      ownerEmail: schema.users.email,
      updatedAt: schema.newsletters.updatedAt,
      createdAt: schema.newsletters.createdAt,
      sectionsCount: sql<number>`COALESCE((SELECT COUNT(*) FROM newsletter_sections ns WHERE ns.newsletter_id = newsletters.id), 0)`,
    })
    .from(schema.newsletters)
    .innerJoin(schema.users, eq(schema.users.id, schema.newsletters.userId))
    .orderBy(desc(schema.newsletters.updatedAt))
    .all();
}

export type AdminStats = {
  totals: {
    users: number;
    newsletters: number;
    activeMasterSections: number;
  };
  topUsers: { username: string; email: string; count: number }[];
  topMasterSections: { id: number; name: string; type: string; count: number }[];
};

/**
 * Calcula estadísticas globales del sistema. Solo admin.
 */
export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();

  const [usersCount] = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.users)
    .all();

  const [newslettersCount] = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.newsletters)
    .all();

  const [activeMastersCount] = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.masterSections)
    .where(eq(schema.masterSections.isActive, true))
    .all();

  const topUsers = await db
    .select({
      username: schema.users.username,
      email: schema.users.email,
      count: sql<number>`count(${schema.newsletters.id})`,
    })
    .from(schema.users)
    .leftJoin(schema.newsletters, eq(schema.newsletters.userId, schema.users.id))
    .groupBy(schema.users.id)
    .orderBy(desc(sql`count(${schema.newsletters.id})`))
    .limit(5)
    .all();

  const topMasterSections = await db
    .select({
      id: schema.masterSections.id,
      name: schema.masterSections.name,
      type: schema.masterSections.type,
      count: sql<number>`count(${schema.newsletterSections.id})`,
    })
    .from(schema.masterSections)
    .leftJoin(
      schema.newsletterSections,
      eq(schema.newsletterSections.masterSectionId, schema.masterSections.id)
    )
    .where(eq(schema.masterSections.isActive, true))
    .groupBy(schema.masterSections.id)
    .orderBy(desc(sql`count(${schema.newsletterSections.id})`))
    .limit(5)
    .all();

  return {
    totals: {
      users: Number(usersCount.n ?? 0),
      newsletters: Number(newslettersCount.n ?? 0),
      activeMasterSections: Number(activeMastersCount.n ?? 0),
    },
    topUsers: topUsers.map((u) => ({
      username: u.username,
      email: u.email,
      count: Number(u.count ?? 0),
    })),
    topMasterSections: topMasterSections.map((m) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      count: Number(m.count ?? 0),
    })),
  };
}

/**
 * Trae los datos necesarios para previsualizar un newsletter en la vista admin.
 * Retorna nombre + HTML en orden de cada sección. Solo admin.
 */
export async function getNewsletterForAdmin(
  id: number
): Promise<{ name: string; sectionsHtml: string[] } | null> {
  await requireAdmin();
  const newsletter = await db
    .select({ id: schema.newsletters.id, name: schema.newsletters.name })
    .from(schema.newsletters)
    .where(eq(schema.newsletters.id, id))
    .get();

  if (!newsletter) return null;

  const rows = await db
    .select({ content: schema.newsletterSections.content })
    .from(schema.newsletterSections)
    .where(eq(schema.newsletterSections.newsletterId, newsletter.id))
    .orderBy(asc(schema.newsletterSections.sectionOrder))
    .all();

  return {
    name: newsletter.name,
    sectionsHtml: rows.map((r) => (r.content as SectionContent).html ?? ""),
  };
}
