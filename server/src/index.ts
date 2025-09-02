import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createProjectInputSchema,
  updateProjectInputSchema,
  getProjectBySlugInputSchema,
  createPageInputSchema,
  updatePageInputSchema,
  getPageBySlugInputSchema,
  createNavigationItemInputSchema,
  getNavigationByPageSlugInputSchema,
} from './schema';

// Import handlers
import { createProject } from './handlers/create_project';
import { getProjects, getFeaturedProjects } from './handlers/get_projects';
import { getProjectBySlug } from './handlers/get_project_by_slug';
import { updateProject } from './handlers/update_project';
import { createPage } from './handlers/create_page';
import { getPages, getPublishedPages } from './handlers/get_pages';
import { getPageBySlug } from './handlers/get_page_by_slug';
import { updatePage } from './handlers/update_page';
import { createNavigationItem } from './handlers/create_navigation_item';
import { getNavigationByPageSlug } from './handlers/get_navigation_by_page_slug';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Project routes
  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),

  getProjects: publicProcedure
    .query(() => getProjects()),

  getFeaturedProjects: publicProcedure
    .query(() => getFeaturedProjects()),

  getProjectBySlug: publicProcedure
    .input(getProjectBySlugInputSchema)
    .query(({ input }) => getProjectBySlug(input)),

  updateProject: publicProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),

  // Page routes
  createPage: publicProcedure
    .input(createPageInputSchema)
    .mutation(({ input }) => createPage(input)),

  getPages: publicProcedure
    .query(() => getPages()),

  getPublishedPages: publicProcedure
    .query(() => getPublishedPages()),

  getPageBySlug: publicProcedure
    .input(getPageBySlugInputSchema)
    .query(({ input }) => getPageBySlug(input)),

  updatePage: publicProcedure
    .input(updatePageInputSchema)
    .mutation(({ input }) => updatePage(input)),

  // Navigation routes
  createNavigationItem: publicProcedure
    .input(createNavigationItemInputSchema)
    .mutation(({ input }) => createNavigationItem(input)),

  getNavigationByPageSlug: publicProcedure
    .input(getNavigationByPageSlugInputSchema)
    .query(({ input }) => getNavigationByPageSlug(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();