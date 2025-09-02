import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { navigationItemsTable, pagesTable } from '../db/schema';
import { type CreateNavigationItemInput } from '../schema';
import { createNavigationItem } from '../handlers/create_navigation_item';
import { eq } from 'drizzle-orm';

// Test page data
const testPage = {
  slug: 'test-page',
  title: 'Test Page',
  content: 'Test page content',
  meta_description: 'Test page for navigation',
  is_published: true
};

// Test navigation item input
const testInput: CreateNavigationItemInput = {
  page_slug: 'test-page',
  title: 'Test Navigation Item',
  anchor: 'test-section',
  order: 1,
  parent_id: null
};

describe('createNavigationItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a navigation item', async () => {
    // Create prerequisite page
    await db.insert(pagesTable).values(testPage).execute();

    const result = await createNavigationItem(testInput);

    // Basic field validation
    expect(result.page_slug).toEqual('test-page');
    expect(result.title).toEqual('Test Navigation Item');
    expect(result.anchor).toEqual('test-section');
    expect(result.order).toEqual(1);
    expect(result.parent_id).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save navigation item to database', async () => {
    // Create prerequisite page
    await db.insert(pagesTable).values(testPage).execute();

    const result = await createNavigationItem(testInput);

    // Query navigation item from database
    const navigationItems = await db.select()
      .from(navigationItemsTable)
      .where(eq(navigationItemsTable.id, result.id))
      .execute();

    expect(navigationItems).toHaveLength(1);
    expect(navigationItems[0].page_slug).toEqual('test-page');
    expect(navigationItems[0].title).toEqual('Test Navigation Item');
    expect(navigationItems[0].anchor).toEqual('test-section');
    expect(navigationItems[0].order).toEqual(1);
    expect(navigationItems[0].parent_id).toBeNull();
    expect(navigationItems[0].created_at).toBeInstanceOf(Date);
  });

  it('should create navigation item with parent_id', async () => {
    // Create prerequisite page
    await db.insert(pagesTable).values(testPage).execute();

    // Create parent navigation item first
    const parentResult = await db.insert(navigationItemsTable)
      .values({
        page_slug: 'test-page',
        title: 'Parent Item',
        anchor: 'parent-section',
        order: 0,
        parent_id: null
      })
      .returning()
      .execute();

    const parentId = parentResult[0].id;

    // Create child navigation item
    const childInput: CreateNavigationItemInput = {
      ...testInput,
      title: 'Child Navigation Item',
      anchor: 'child-section',
      order: 2,
      parent_id: parentId
    };

    const result = await createNavigationItem(childInput);

    expect(result.parent_id).toEqual(parentId);
    expect(result.title).toEqual('Child Navigation Item');
    expect(result.anchor).toEqual('child-section');
    expect(result.order).toEqual(2);
  });

  it('should handle undefined parent_id as null', async () => {
    // Create prerequisite page
    await db.insert(pagesTable).values(testPage).execute();

    const inputWithUndefined: CreateNavigationItemInput = {
      ...testInput,
      parent_id: undefined
    };

    const result = await createNavigationItem(inputWithUndefined);

    expect(result.parent_id).toBeNull();
  });

  it('should throw error when page does not exist', async () => {
    // Don't create the page - test with non-existent page
    const inputWithInvalidPage: CreateNavigationItemInput = {
      ...testInput,
      page_slug: 'non-existent-page'
    };

    await expect(createNavigationItem(inputWithInvalidPage))
      .rejects
      .toThrow(/Page with slug 'non-existent-page' does not exist/i);
  });

  it('should throw error when parent navigation item does not exist', async () => {
    // Create prerequisite page
    await db.insert(pagesTable).values(testPage).execute();

    const inputWithInvalidParent: CreateNavigationItemInput = {
      ...testInput,
      parent_id: 999 // Non-existent parent ID
    };

    await expect(createNavigationItem(inputWithInvalidParent))
      .rejects
      .toThrow(/Parent navigation item with id '999' does not exist/i);
  });

  it('should create multiple navigation items with different orders', async () => {
    // Create prerequisite page
    await db.insert(pagesTable).values(testPage).execute();

    // Create first navigation item
    const firstItem = await createNavigationItem({
      ...testInput,
      title: 'First Item',
      anchor: 'first-section',
      order: 1
    });

    // Create second navigation item
    const secondItem = await createNavigationItem({
      ...testInput,
      title: 'Second Item',
      anchor: 'second-section',
      order: 2
    });

    expect(firstItem.order).toEqual(1);
    expect(secondItem.order).toEqual(2);
    expect(firstItem.id).not.toEqual(secondItem.id);

    // Verify both items exist in database
    const allItems = await db.select()
      .from(navigationItemsTable)
      .where(eq(navigationItemsTable.page_slug, 'test-page'))
      .execute();

    expect(allItems).toHaveLength(2);
  });
});