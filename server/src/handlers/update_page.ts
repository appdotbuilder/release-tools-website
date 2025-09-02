import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type UpdatePageInput, type Page } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePage = async (input: UpdatePageInput): Promise<Page | null> => {
  try {
    // Extract id and prepare update data
    const { id, ...updateData } = input;
    
    // Only include fields that are defined (not undefined)
    const fieldsToUpdate: Record<string, any> = {};
    
    if (updateData.slug !== undefined) fieldsToUpdate['slug'] = updateData.slug;
    if (updateData.title !== undefined) fieldsToUpdate['title'] = updateData.title;
    if (updateData.content !== undefined) fieldsToUpdate['content'] = updateData.content;
    if (updateData.meta_description !== undefined) fieldsToUpdate['meta_description'] = updateData.meta_description;
    if (updateData.is_published !== undefined) fieldsToUpdate['is_published'] = updateData.is_published;
    
    // Always update the updated_at timestamp
    fieldsToUpdate['updated_at'] = new Date();
    
    // If no fields to update, return null
    if (Object.keys(fieldsToUpdate).length === 1) { // Only updated_at
      return null;
    }
    
    // Update the page record
    const result = await db.update(pagesTable)
      .set(fieldsToUpdate)
      .where(eq(pagesTable.id, id))
      .returning()
      .execute();

    // Return the updated page or null if no page was found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Page update failed:', error);
    throw error;
  }
};