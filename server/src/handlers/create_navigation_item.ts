import { db } from '../db';
import { navigationItemsTable, pagesTable } from '../db/schema';
import { type CreateNavigationItemInput, type NavigationItem } from '../schema';
import { eq } from 'drizzle-orm';

export const createNavigationItem = async (input: CreateNavigationItemInput): Promise<NavigationItem> => {
  try {
    // Validate that the referenced page exists
    const existingPage = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.slug, input.page_slug))
      .execute();

    if (existingPage.length === 0) {
      throw new Error(`Page with slug '${input.page_slug}' does not exist`);
    }

    // If parent_id is provided, validate that the parent navigation item exists
    if (input.parent_id !== undefined && input.parent_id !== null) {
      const existingParent = await db.select()
        .from(navigationItemsTable)
        .where(eq(navigationItemsTable.id, input.parent_id))
        .execute();

      if (existingParent.length === 0) {
        throw new Error(`Parent navigation item with id '${input.parent_id}' does not exist`);
      }
    }

    // Insert navigation item record
    const result = await db.insert(navigationItemsTable)
      .values({
        page_slug: input.page_slug,
        title: input.title,
        anchor: input.anchor,
        order: input.order,
        parent_id: input.parent_id || null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Navigation item creation failed:', error);
    throw error;
  }
};