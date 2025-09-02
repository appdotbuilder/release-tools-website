import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type GetPageBySlugInput, type CreatePageInput } from '../schema';
import { getPageBySlug } from '../handlers/get_page_by_slug';

// Test input for querying page
const testQuery: GetPageBySlugInput = {
  slug: 'test-page'
};

// Test page data - published page
const publishedPageInput: CreatePageInput = {
  slug: 'test-page',
  title: 'Test Page',
  content: '# Test Page\n\nThis is a test page content.',
  meta_description: 'A test page for unit testing',
  is_published: true
};

// Test page data - unpublished page
const unpublishedPageInput: CreatePageInput = {
  slug: 'draft-page',
  title: 'Draft Page',
  content: '# Draft Page\n\nThis page is not published yet.',
  meta_description: 'A draft page for testing',
  is_published: false
};

describe('getPageBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return published page by slug', async () => {
    // Create a published page
    await db.insert(pagesTable)
      .values(publishedPageInput)
      .execute();

    const result = await getPageBySlug(testQuery);

    expect(result).not.toBeNull();
    expect(result!.slug).toEqual('test-page');
    expect(result!.title).toEqual('Test Page');
    expect(result!.content).toEqual('# Test Page\n\nThis is a test page content.');
    expect(result!.meta_description).toEqual('A test page for unit testing');
    expect(result!.is_published).toBe(true);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent slug', async () => {
    const result = await getPageBySlug({
      slug: 'non-existent-page'
    });

    expect(result).toBeNull();
  });

  it('should return null for unpublished page', async () => {
    // Create an unpublished page
    await db.insert(pagesTable)
      .values(unpublishedPageInput)
      .execute();

    const result = await getPageBySlug({
      slug: 'draft-page'
    });

    expect(result).toBeNull();
  });

  it('should return published page when both published and unpublished pages exist with different slugs', async () => {
    // Create both published and unpublished pages
    await db.insert(pagesTable)
      .values([publishedPageInput, unpublishedPageInput])
      .execute();

    // Should return published page
    const publishedResult = await getPageBySlug(testQuery);
    expect(publishedResult).not.toBeNull();
    expect(publishedResult!.slug).toEqual('test-page');
    expect(publishedResult!.is_published).toBe(true);

    // Should return null for unpublished page
    const unpublishedResult = await getPageBySlug({
      slug: 'draft-page'
    });
    expect(unpublishedResult).toBeNull();
  });

  it('should handle pages with null meta_description', async () => {
    // Create page with null meta_description
    const pageWithNullMeta: CreatePageInput = {
      slug: 'no-meta-page',
      title: 'Page Without Meta',
      content: 'Content without meta description',
      meta_description: null,
      is_published: true
    };

    await db.insert(pagesTable)
      .values(pageWithNullMeta)
      .execute();

    const result = await getPageBySlug({
      slug: 'no-meta-page'
    });

    expect(result).not.toBeNull();
    expect(result!.meta_description).toBeNull();
    expect(result!.title).toEqual('Page Without Meta');
    expect(result!.is_published).toBe(true);
  });

  it('should handle case-sensitive slug matching', async () => {
    await db.insert(pagesTable)
      .values(publishedPageInput)
      .execute();

    // Test with different case - should return null since slugs are case-sensitive
    const result = await getPageBySlug({
      slug: 'Test-Page' // Different case
    });

    expect(result).toBeNull();
  });

  it('should verify page exists in database after creation', async () => {
    await db.insert(pagesTable)
      .values(publishedPageInput)
      .execute();

    // Verify the page was actually created in the database
    const dbPages = await db.select()
      .from(pagesTable)
      .execute();

    expect(dbPages).toHaveLength(1);
    expect(dbPages[0].slug).toEqual('test-page');

    // Now test the handler
    const result = await getPageBySlug(testQuery);
    expect(result).not.toBeNull();
    expect(result!.slug).toEqual(dbPages[0].slug);
  });
});