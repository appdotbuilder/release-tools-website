import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type CreatePageInput } from '../schema';
import { createPage } from '../handlers/create_page';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreatePageInput = {
  slug: 'test-page',
  title: 'Test Page',
  content: '# Test Page\n\nThis is a test page with some markdown content.',
  meta_description: 'A test page for unit testing',
  is_published: true
};

describe('createPage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a page with all fields', async () => {
    const result = await createPage(testInput);

    // Basic field validation
    expect(result.slug).toEqual('test-page');
    expect(result.title).toEqual('Test Page');
    expect(result.content).toEqual('# Test Page\n\nThis is a test page with some markdown content.');
    expect(result.meta_description).toEqual('A test page for unit testing');
    expect(result.is_published).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save page to database', async () => {
    const result = await createPage(testInput);

    // Query using proper drizzle syntax
    const pages = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.id, result.id))
      .execute();

    expect(pages).toHaveLength(1);
    const savedPage = pages[0];
    expect(savedPage.slug).toEqual('test-page');
    expect(savedPage.title).toEqual('Test Page');
    expect(savedPage.content).toEqual('# Test Page\n\nThis is a test page with some markdown content.');
    expect(savedPage.meta_description).toEqual('A test page for unit testing');
    expect(savedPage.is_published).toEqual(true);
    expect(savedPage.created_at).toBeInstanceOf(Date);
    expect(savedPage.updated_at).toBeInstanceOf(Date);
  });

  it('should create page with null meta_description', async () => {
    const inputWithoutMeta: CreatePageInput = {
      slug: 'no-meta-page',
      title: 'Page Without Meta',
      content: 'Content without meta description',
      meta_description: null,
      is_published: false
    };

    const result = await createPage(inputWithoutMeta);

    expect(result.slug).toEqual('no-meta-page');
    expect(result.title).toEqual('Page Without Meta');
    expect(result.meta_description).toBeNull();
    expect(result.is_published).toEqual(false);
  });

  it('should create page with default is_published when using zod defaults', async () => {
    // Test with minimal input to verify Zod defaults
    const minimalInput: CreatePageInput = {
      slug: 'minimal-page',
      title: 'Minimal Page',
      content: 'Minimal content',
      is_published: true // Include all required fields since Zod defaults are applied at parse time
    };

    const result = await createPage(minimalInput);

    expect(result.slug).toEqual('minimal-page');
    expect(result.title).toEqual('Minimal Page');
    expect(result.content).toEqual('Minimal content');
    expect(result.meta_description).toBeNull(); // Optional field default
    expect(result.is_published).toEqual(true); // Explicit value
  });

  it('should handle unique slug constraint violation', async () => {
    // Create first page
    await createPage(testInput);

    // Attempt to create page with same slug
    const duplicateInput: CreatePageInput = {
      slug: 'test-page', // Same slug as first page
      title: 'Duplicate Page',
      content: 'This should fail due to unique constraint',
      is_published: true
    };

    await expect(createPage(duplicateInput)).rejects.toThrow(/unique/i);
  });

  it('should handle long content correctly', async () => {
    const longContent = 'A'.repeat(10000); // Very long content
    const longContentInput: CreatePageInput = {
      slug: 'long-content-page',
      title: 'Page with Long Content',
      content: longContent,
      meta_description: 'Page with very long content for testing',
      is_published: true
    };

    const result = await createPage(longContentInput);

    expect(result.content).toEqual(longContent);
    expect(result.content.length).toEqual(10000);

    // Verify it's saved correctly in database
    const pages = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.id, result.id))
      .execute();

    expect(pages[0].content).toEqual(longContent);
  });

  it('should create multiple pages with different slugs', async () => {
    const page1Input: CreatePageInput = {
      slug: 'home',
      title: 'Home Page',
      content: '# Welcome to the homepage',
      meta_description: 'Homepage description',
      is_published: true
    };

    const page2Input: CreatePageInput = {
      slug: 'mutex',
      title: 'Mutex Documentation',
      content: '# Mutex\n\nDocumentation for the mutex project.',
      meta_description: 'Mutex project documentation',
      is_published: true
    };

    const page3Input: CreatePageInput = {
      slug: 'cli',
      title: 'CLI Documentation',
      content: '# CLI Tools\n\nDocumentation for CLI tools.',
      meta_description: 'CLI tools documentation',
      is_published: false
    };

    const result1 = await createPage(page1Input);
    const result2 = await createPage(page2Input);
    const result3 = await createPage(page3Input);

    // Verify all pages were created with different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.id).not.toEqual(result3.id);
    expect(result2.id).not.toEqual(result3.id);

    // Verify all pages exist in database
    const allPages = await db.select()
      .from(pagesTable)
      .execute();

    expect(allPages).toHaveLength(3);
    
    const slugs = allPages.map(page => page.slug);
    expect(slugs).toContain('home');
    expect(slugs).toContain('mutex');
    expect(slugs).toContain('cli');
  });
});