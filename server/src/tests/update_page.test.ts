import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type UpdatePageInput, type CreatePageInput } from '../schema';
import { updatePage } from '../handlers/update_page';
import { eq } from 'drizzle-orm';

// Helper function to create a test page
const createTestPage = async (input: CreatePageInput) => {
  const result = await db.insert(pagesTable)
    .values({
      slug: input.slug,
      title: input.title,
      content: input.content,
      meta_description: input.meta_description || null,
      is_published: input.is_published ?? true
    })
    .returning()
    .execute();
  return result[0];
};

// Test data
const testPageInput: CreatePageInput = {
  slug: 'test-page',
  title: 'Test Page',
  content: 'This is test page content',
  meta_description: 'Test page description',
  is_published: true
};

describe('updatePage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all page fields', async () => {
    // Create a test page
    const createdPage = await createTestPage(testPageInput);
    
    const updateInput: UpdatePageInput = {
      id: createdPage.id,
      slug: 'updated-page',
      title: 'Updated Page Title',
      content: 'Updated page content',
      meta_description: 'Updated meta description',
      is_published: false
    };

    const result = await updatePage(updateInput);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdPage.id);
    expect(result!.slug).toEqual('updated-page');
    expect(result!.title).toEqual('Updated Page Title');
    expect(result!.content).toEqual('Updated page content');
    expect(result!.meta_description).toEqual('Updated meta description');
    expect(result!.is_published).toEqual(false);
    expect(result!.created_at).toEqual(createdPage.created_at);
    expect(result!.updated_at).not.toEqual(createdPage.updated_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    // Create a test page
    const createdPage = await createTestPage(testPageInput);
    
    const updateInput: UpdatePageInput = {
      id: createdPage.id,
      title: 'Partially Updated Title',
      is_published: false
    };

    const result = await updatePage(updateInput);

    // Verify only specified fields were updated
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdPage.id);
    expect(result!.slug).toEqual(createdPage.slug); // Unchanged
    expect(result!.title).toEqual('Partially Updated Title'); // Updated
    expect(result!.content).toEqual(createdPage.content); // Unchanged
    expect(result!.meta_description).toEqual(createdPage.meta_description); // Unchanged
    expect(result!.is_published).toEqual(false); // Updated
    expect(result!.created_at).toEqual(createdPage.created_at);
    expect(result!.updated_at).not.toEqual(createdPage.updated_at);
  });

  it('should handle null meta_description', async () => {
    // Create a test page with null meta_description
    const pageWithoutMeta = await createTestPage({
      ...testPageInput,
      meta_description: null
    });
    
    const updateInput: UpdatePageInput = {
      id: pageWithoutMeta.id,
      meta_description: 'Now has meta description'
    };

    const result = await updatePage(updateInput);

    expect(result).not.toBeNull();
    expect(result!.meta_description).toEqual('Now has meta description');
  });

  it('should handle setting meta_description to null', async () => {
    // Create a test page with meta_description
    const pageWithMeta = await createTestPage(testPageInput);
    
    const updateInput: UpdatePageInput = {
      id: pageWithMeta.id,
      meta_description: null
    };

    const result = await updatePage(updateInput);

    expect(result).not.toBeNull();
    expect(result!.meta_description).toBeNull();
  });

  it('should return null for non-existent page', async () => {
    const updateInput: UpdatePageInput = {
      id: 999999, // Non-existent ID
      title: 'Should not work'
    };

    const result = await updatePage(updateInput);

    expect(result).toBeNull();
  });

  it('should return null when no fields to update', async () => {
    // Create a test page
    const createdPage = await createTestPage(testPageInput);
    
    const updateInput: UpdatePageInput = {
      id: createdPage.id
      // No fields to update
    };

    const result = await updatePage(updateInput);

    expect(result).toBeNull();
  });

  it('should update page in database', async () => {
    // Create a test page
    const createdPage = await createTestPage(testPageInput);
    
    const updateInput: UpdatePageInput = {
      id: createdPage.id,
      title: 'Database Update Test',
      content: 'Updated content in database'
    };

    await updatePage(updateInput);

    // Query database directly to verify update
    const pages = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.id, createdPage.id))
      .execute();

    expect(pages).toHaveLength(1);
    expect(pages[0].title).toEqual('Database Update Test');
    expect(pages[0].content).toEqual('Updated content in database');
    expect(pages[0].slug).toEqual(createdPage.slug); // Should remain unchanged
    expect(pages[0].updated_at).not.toEqual(createdPage.updated_at);
  });

  it('should handle unique constraint violations', async () => {
    // Create two test pages
    const firstPage = await createTestPage(testPageInput);
    const secondPage = await createTestPage({
      ...testPageInput,
      slug: 'second-page',
      title: 'Second Page'
    });
    
    const updateInput: UpdatePageInput = {
      id: secondPage.id,
      slug: firstPage.slug // Try to use existing slug
    };

    // Should throw an error due to unique constraint
    await expect(updatePage(updateInput)).rejects.toThrow();
  });

  it('should handle boolean field updates correctly', async () => {
    // Create a published page
    const publishedPage = await createTestPage({
      ...testPageInput,
      is_published: true
    });
    
    const updateInput: UpdatePageInput = {
      id: publishedPage.id,
      is_published: false
    };

    const result = await updatePage(updateInput);

    expect(result).not.toBeNull();
    expect(result!.is_published).toEqual(false);
    expect(typeof result!.is_published).toBe('boolean');
  });

  it('should preserve created_at timestamp', async () => {
    // Create a test page
    const createdPage = await createTestPage(testPageInput);
    
    // Wait a small amount to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const updateInput: UpdatePageInput = {
      id: createdPage.id,
      title: 'Timestamp Preservation Test'
    };

    const result = await updatePage(updateInput);

    expect(result).not.toBeNull();
    expect(result!.created_at).toEqual(createdPage.created_at);
    expect(result!.updated_at).not.toEqual(createdPage.updated_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});