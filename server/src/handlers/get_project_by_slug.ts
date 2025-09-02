import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type GetProjectBySlugInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export const getProjectBySlug = async (input: GetProjectBySlugInput): Promise<Project | null> => {
  try {
    // Query for project with the given slug
    const results = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.slug, input.slug))
      .limit(1)
      .execute();

    // Return null if no project found
    if (results.length === 0) {
      return null;
    }

    // Return the found project
    const project = results[0];
    return {
      ...project
    };
  } catch (error) {
    console.error('Failed to get project by slug:', error);
    throw error;
  }
};