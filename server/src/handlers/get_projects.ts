import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type Project } from '../schema';
import { desc, eq } from 'drizzle-orm';

export const getProjects = async (): Promise<Project[]> => {
  try {
    // Fetch all projects ordered by featured status first, then by creation date
    const results = await db.select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.is_featured), desc(projectsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
};

export const getFeaturedProjects = async (): Promise<Project[]> => {
  try {
    // Fetch only featured projects ordered by creation date (newest first)
    const results = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.is_featured, true))
      .orderBy(desc(projectsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch featured projects:', error);
    throw error;
  }
};