import { serial, text, pgTable, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Projects table for storing mutex and cli project information
export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  name: text('name').notNull(),
  description: text('description').notNull(),
  github_url: text('github_url').notNull(),
  github_stars: integer('github_stars').notNull().default(0),
  github_forks: integer('github_forks').notNull().default(0),
  license: text('license').notNull().default('Apache-2.0'),
  is_featured: boolean('is_featured').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Pages table for storing content (home, mutex, cli pages)
export const pagesTable = pgTable('pages', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  title: text('title').notNull(),
  content: text('content').notNull(), // Markdown or structured content
  meta_description: text('meta_description'), // Nullable for SEO
  is_published: boolean('is_published').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Navigation items table for sidebar navigation
export const navigationItemsTable = pgTable('navigation_items', {
  id: serial('id').primaryKey(),
  page_slug: text('page_slug').notNull(), // References pages.slug
  title: text('title').notNull(),
  anchor: text('anchor').notNull(), // For jumping to sections within pages
  order: integer('order').notNull().default(0), // For sorting navigation items
  parent_id: integer('parent_id'), // Nullable for nested navigation
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const pagesRelations = relations(pagesTable, ({ many }) => ({
  navigationItems: many(navigationItemsTable),
}));

export const navigationItemsRelations = relations(navigationItemsTable, ({ one }) => ({
  page: one(pagesTable, {
    fields: [navigationItemsTable.page_slug],
    references: [pagesTable.slug],
  }),
  parent: one(navigationItemsTable, {
    fields: [navigationItemsTable.parent_id],
    references: [navigationItemsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;

export type Page = typeof pagesTable.$inferSelect;
export type NewPage = typeof pagesTable.$inferInsert;

export type NavigationItem = typeof navigationItemsTable.$inferSelect;
export type NewNavigationItem = typeof navigationItemsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  projects: projectsTable,
  pages: pagesTable,
  navigationItems: navigationItemsTable,
};

export const tableRelations = {
  pagesRelations,
  navigationItemsRelations,
};