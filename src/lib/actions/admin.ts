"use server";

import { and, asc, desc, eq, gte, like, lte, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import type { SectionContent } from "@/lib/db/schema";

export type NewsletterFilters = {
  name?: string;
  username?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  pageSize?: number;
};

export type AdminNewsletterRow = {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  ownerUsername: string;
  ownerEmail: string;
  updatedAt: string;
  createdAt: string;
  sectionsCount: number;
};

export type ListAllNewslettersResult = {
  rows: AdminNewsletterRow[];
  total: number;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Lista newsletters con filtros y paginación. Solo admin.
 * Filtros:
 *  - name / username: LIKE case-insensitive (contiene)
 *  - createdFrom/To y updatedFrom/To: rango de fechas (YYYY-MM-DD)
 */
export async function listAllNewsletters(
  filters: NewsletterFilters = {}
): Promise<ListAllNewslettersResult> {
  await requireAdmin();

  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(filters.pageSize ?? DEFAULT_PAGE_SIZE))
  );

  const conditions: SQL[] = [];
  const name = filters.name?.trim();
  const username = filters.username?.trim();

  if (name) {
    conditions.push(like(sql`lower(${schema.newsletters.name})`, `%${name.toLowerCase()}%`));
  }
  if (username) {
    conditions.push(like(sql`lower(${schema.users.username})`, `%${username.toLowerCase()}%`));
  }
  if (filters.createdFrom) {
    conditions.push(gte(schema.newsletters.createdAt, filters.createdFrom));
  }
  if (filters.createdTo) {
    conditions.push(lte(schema.newsletters.createdAt, `${filters.createdTo} 23:59:59`));
  }
  if (filters.updatedFrom) {
    conditions.push(gte(schema.newsletters.updatedAt, filters.updatedFrom));
  }
  if (filters.updatedTo) {
    conditions.push(lte(schema.newsletters.updatedAt, `${filters.updatedTo} 23:59:59`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.newsletters)
    .innerJoin(schema.users, eq(schema.users.id, schema.newsletters.userId))
    .where(whereClause)
    .all();

  const rows = await db
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
    .where(whereClause)
    .orderBy(desc(schema.newsletters.updatedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all();

  return {
    rows: rows.map((r) => ({ ...r, sectionsCount: Number(r.sectionsCount ?? 0) })),
    total: Number(totalRow?.n ?? 0),
    page,
    pageSize,
  };
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
