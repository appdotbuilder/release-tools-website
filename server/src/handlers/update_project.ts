import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProject = async (input: UpdateProjectInput): Promise<Project | null> => {
  try {
    // Extract id from input and create update object with only provided fields
    const { id, ...updateFields } = input;

    // If no fields to update, just return the existing project
    if (Object.keys(updateFields).length === 0) {
      const existing = await db.select()
        .from(projectsTable)
        .where(eq(projectsTable.id, id))
        .execute();
      
      return existing.length > 0 ? existing[0] : null;
    }

    // Update project with provided fields and set updated_at timestamp
    const result = await db.update(projectsTable)
      .set({
        ...updateFields,
        updated_at: new Date() // Always update the timestamp
      })
      .where(eq(projectsTable.id, id))
      .returning()
      .execute();

    // Return the updated project or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Project update failed:', error);
    throw error;
  }
};