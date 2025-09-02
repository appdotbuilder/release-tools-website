import { z } from 'zod';

// Project schema for mutex and cli projects
export const projectSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  github_url: z.string().url(),
  github_stars: z.number().int().nonnegative(),
  github_forks: z.number().int().nonnegative(),
  license: z.string(),
  is_featured: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Page content schema for different pages (home, mutex, cli)
export const pageSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  content: z.string(), // Markdown or structured content
  meta_description: z.string().nullable(),
  is_published: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Page = z.infer<typeof pageSchema>;

// Navigation item schema for sidebar navigation
export const navigationItemSchema = z.object({
  id: z.number(),
  page_slug: z.string(),
  title: z.string(),
  anchor: z.string(), // For jumping to sections within pages
  order: z.number().int().nonnegative(),
  parent_id: z.number().nullable(), // For nested navigation
  created_at: z.coerce.date()
});

export type NavigationItem = z.infer<typeof navigationItemSchema>;

// Input schema for creating projects
export const createProjectInputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  github_url: z.string().url(),
  github_stars: z.number().int().nonnegative().default(0),
  github_forks: z.number().int().nonnegative().default(0),
  license: z.string().default('Apache-2.0'),
  is_featured: z.boolean().default(false)
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

// Input schema for updating projects
export const updateProjectInputSchema = z.object({
  id: z.number(),
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  github_url: z.string().url().optional(),
  github_stars: z.number().int().nonnegative().optional(),
  github_forks: z.number().int().nonnegative().optional(),
  license: z.string().optional(),
  is_featured: z.boolean().optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

// Input schema for creating pages
export const createPageInputSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  meta_description: z.string().nullable().optional(),
  is_published: z.boolean().default(true)
});

export type CreatePageInput = z.infer<typeof createPageInputSchema>;

// Input schema for updating pages
export const updatePageInputSchema = z.object({
  id: z.number(),
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  meta_description: z.string().nullable().optional(),
  is_published: z.boolean().optional()
});

export type UpdatePageInput = z.infer<typeof updatePageInputSchema>;

// Input schema for creating navigation items
export const createNavigationItemInputSchema = z.object({
  page_slug: z.string().min(1),
  title: z.string().min(1),
  anchor: z.string().min(1),
  order: z.number().int().nonnegative(),
  parent_id: z.number().nullable().optional()
});

export type CreateNavigationItemInput = z.infer<typeof createNavigationItemInputSchema>;

// Query schema for getting page by slug
export const getPageBySlugInputSchema = z.object({
  slug: z.string().min(1)
});

export type GetPageBySlugInput = z.infer<typeof getPageBySlugInputSchema>;

// Query schema for getting project by slug
export const getProjectBySlugInputSchema = z.object({
  slug: z.string().min(1)
});

export type GetProjectBySlugInput = z.infer<typeof getProjectBySlugInputSchema>;

// Query schema for getting navigation items by page slug
export const getNavigationByPageSlugInputSchema = z.object({
  page_slug: z.string().min(1)
});

export type GetNavigationByPageSlugInput = z.infer<typeof getNavigationByPageSlugInputSchema>;