import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type GetPageBySlugInput, type Page } from '../schema';
import { eq, and } from 'drizzle-orm';

export const getPageBySlug = async (input: GetPageBySlugInput): Promise<Page | null> => {
  try {
    // Query for a published page with the given slug
    const results = await db.select()
      .from(pagesTable)
      .where(and(
        eq(pagesTable.slug, input.slug),
        eq(pagesTable.is_published, true)
      ))
      .limit(1)
      .execute();

    // Return null if no page found, otherwise return the first result
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to fetch page by slug:', error);
    throw error;
  }
};