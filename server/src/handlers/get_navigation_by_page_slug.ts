import { db } from '../db';
import { navigationItemsTable } from '../db/schema';
import { type GetNavigationByPageSlugInput, type NavigationItem } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getNavigationByPageSlug = async (input: GetNavigationByPageSlugInput): Promise<NavigationItem[]> => {
  try {
    // Fetch navigation items for the specified page slug, ordered by the 'order' field
    const results = await db.select()
      .from(navigationItemsTable)
      .where(eq(navigationItemsTable.page_slug, input.page_slug))
      .orderBy(asc(navigationItemsTable.order))
      .execute();

    // Return the results directly as they match the NavigationItem type
    return results;
  } catch (error) {
    console.error('Failed to fetch navigation items:', error);
    throw error;
  }
};