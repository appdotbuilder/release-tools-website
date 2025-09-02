import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type CreatePageInput, type Page } from '../schema';

export const createPage = async (input: CreatePageInput): Promise<Page> => {
  try {
    // Insert page record
    const result = await db.insert(pagesTable)
      .values({
        slug: input.slug,
        title: input.title,
        content: input.content,
        meta_description: input.meta_description || null,
        is_published: input.is_published // Uses default from Zod (true)
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Page creation failed:', error);
    throw error;
  }
};