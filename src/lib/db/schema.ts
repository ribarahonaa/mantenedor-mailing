import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

/**
 * Schema Drizzle que refleja la DB existente.
 * Los nombres de columna coinciden con `legacy/init-database.js` para que
 * los datos actuales en `database/newsletters.db` sean leídos sin migración.
 */

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const masterSections = sqliteTable("master_sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content", { mode: "json" }).$type<SectionContent>().notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const newsletters = sqliteTable("newsletters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const newsletterSections = sqliteTable("newsletter_sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  newsletterId: integer("newsletter_id").notNull().references(() => newsletters.id, { onDelete: "cascade" }),
  masterSectionId: integer("master_section_id").references(() => masterSections.id, { onDelete: "set null" }),
  sectionType: text("section_type").notNull(),
  title: text("title").notNull(),
  content: text("content", { mode: "json" }).$type<SectionContent>().notNull(),
  sectionOrder: integer("section_order").notNull(),
  isCustomized: integer("is_customized", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================================
// Tipos
// ==========================================================

export type SectionContent = {
  html: string;
};

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type MasterSection = typeof masterSections.$inferSelect;
export type NewMasterSection = typeof masterSections.$inferInsert;

export type Newsletter = typeof newsletters.$inferSelect;
export type NewNewsletter = typeof newsletters.$inferInsert;

export type NewsletterSection = typeof newsletterSections.$inferSelect;
export type NewNewsletterSection = typeof newsletterSections.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
