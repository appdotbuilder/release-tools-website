import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type Project } from '../schema';

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  try {
    // Insert project record
    const result = await db.insert(projectsTable)
      .values({
        slug: input.slug,
        name: input.name,
        description: input.description,
        github_url: input.github_url,
        github_stars: input.github_stars,
        github_forks: input.github_forks,
        license: input.license,
        is_featured: input.is_featured
      })
      .returning()
      .execute();

    // Return the created project
    return result[0];
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
};