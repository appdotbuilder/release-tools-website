import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable, navigationItemsTable } from '../db/schema';
import { type GetNavigationByPageSlugInput } from '../schema';
import { getNavigationByPageSlug } from '../handlers/get_navigation_by_page_slug';

describe('getNavigationByPageSlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return navigation items for a specific page slug ordered by order field', async () => {
    // Create a test page first
    await db.insert(pagesTable).values({
      slug: 'test-page',
      title: 'Test Page',
      content: 'Test content',
      is_published: true
    }).execute();

    // Create navigation items with different order values
    await db.insert(navigationItemsTable).values([
      {
        page_slug: 'test-page',
        title: 'Third Item',
        anchor: 'third-section',
        order: 2,
        parent_id: null
      },
      {
        page_slug: 'test-page',
        title: 'First Item',
        anchor: 'first-section',
        order: 0,
        parent_id: null
      },
      {
        page_slug: 'test-page',
        title: 'Second Item',
        anchor: 'second-section',
        order: 1,
        parent_id: null
      }
    ]).execute();

    const input: GetNavigationByPageSlugInput = {
      page_slug: 'test-page'
    };

    const result = await getNavigationByPageSlug(input);

    expect(result).toHaveLength(3);
    
    // Verify items are ordered by the 'order' field
    expect(result[0].title).toEqual('First Item');
    expect(result[0].order).toEqual(0);
    expect(result[1].title).toEqual('Second Item');
    expect(result[1].order).toEqual(1);
    expect(result[2].title).toEqual('Third Item');
    expect(result[2].order).toEqual(2);
    
    // Verify all items have the correct page_slug
    result.forEach(item => {
      expect(item.page_slug).toEqual('test-page');
      expect(item.id).toBeDefined();
      expect(item.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return empty array when no navigation items exist for page slug', async () => {
    // Create a page but no navigation items
    await db.insert(pagesTable).values({
      slug: 'empty-page',
      title: 'Empty Page',
      content: 'Content with no navigation',
      is_published: true
    }).execute();

    const input: GetNavigationByPageSlugInput = {
      page_slug: 'empty-page'
    };

    const result = await getNavigationByPageSlug(input);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should return only navigation items for the specified page slug', async () => {
    // Create multiple pages
    await db.insert(pagesTable).values([
      {
        slug: 'page-one',
        title: 'Page One',
        content: 'Content one',
        is_published: true
      },
      {
        slug: 'page-two',
        title: 'Page Two',
        content: 'Content two',
        is_published: true
      }
    ]).execute();

    // Create navigation items for both pages
    await db.insert(navigationItemsTable).values([
      {
        page_slug: 'page-one',
        title: 'Page One Nav',
        anchor: 'section-one',
        order: 0,
        parent_id: null
      },
      {
        page_slug: 'page-two',
        title: 'Page Two Nav',
        anchor: 'section-two',
        order: 0,
        parent_id: null
      },
      {
        page_slug: 'page-one',
        title: 'Another Page One Nav',
        anchor: 'section-three',
        order: 1,
        parent_id: null
      }
    ]).execute();

    const input: GetNavigationByPageSlugInput = {
      page_slug: 'page-one'
    };

    const result = await getNavigationByPageSlug(input);

    expect(result).toHaveLength(2);
    
    // Verify all items belong to page-one
    result.forEach(item => {
      expect(item.page_slug).toEqual('page-one');
    });
    
    // Verify specific items are returned in correct order
    expect(result[0].title).toEqual('Page One Nav');
    expect(result[0].order).toEqual(0);
    expect(result[1].title).toEqual('Another Page One Nav');
    expect(result[1].order).toEqual(1);
  });

  it('should handle navigation items with parent-child hierarchy', async () => {
    // Create a test page
    await db.insert(pagesTable).values({
      slug: 'hierarchical-page',
      title: 'Hierarchical Page',
      content: 'Content with nested navigation',
      is_published: true
    }).execute();

    // Create parent navigation item first
    const parentResult = await db.insert(navigationItemsTable).values({
      page_slug: 'hierarchical-page',
      title: 'Parent Item',
      anchor: 'parent-section',
      order: 0,
      parent_id: null
    }).returning().execute();

    const parentId = parentResult[0].id;

    // Create child navigation items
    await db.insert(navigationItemsTable).values([
      {
        page_slug: 'hierarchical-page',
        title: 'Child Item 2',
        anchor: 'child-section-2',
        order: 2,
        parent_id: parentId
      },
      {
        page_slug: 'hierarchical-page',
        title: 'Child Item 1',
        anchor: 'child-section-1',
        order: 1,
        parent_id: parentId
      }
    ]).execute();

    const input: GetNavigationByPageSlugInput = {
      page_slug: 'hierarchical-page'
    };

    const result = await getNavigationByPageSlug(input);

    expect(result).toHaveLength(3);
    
    // Verify ordering (parent first, then children ordered)
    expect(result[0].title).toEqual('Parent Item');
    expect(result[0].order).toEqual(0);
    expect(result[0].parent_id).toBeNull();
    
    expect(result[1].title).toEqual('Child Item 1');
    expect(result[1].order).toEqual(1);
    expect(result[1].parent_id).toEqual(parentId);
    
    expect(result[2].title).toEqual('Child Item 2');
    expect(result[2].order).toEqual(2);
    expect(result[2].parent_id).toEqual(parentId);
  });

  it('should return empty array for non-existent page slug', async () => {
    const input: GetNavigationByPageSlugInput = {
      page_slug: 'non-existent-page'
    };

    const result = await getNavigationByPageSlug(input);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});