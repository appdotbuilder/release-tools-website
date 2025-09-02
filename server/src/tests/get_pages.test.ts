import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type CreatePageInput } from '../schema';
import { getPages, getPublishedPages } from '../handlers/get_pages';

// Test page inputs
const publishedPage: CreatePageInput = {
  slug: 'published-page',
  title: 'Published Page',
  content: 'This is a published page content',
  meta_description: 'A published page for testing',
  is_published: true
};

const unpublishedPage: CreatePageInput = {
  slug: 'unpublished-page',
  title: 'Unpublished Page',
  content: 'This is an unpublished page content',
  meta_description: 'An unpublished page for testing',
  is_published: false
};

const anotherPublishedPage: CreatePageInput = {
  slug: 'another-published-page',
  title: 'Another Published Page',
  content: 'Another published page content',
  meta_description: null,
  is_published: true
};

describe('getPages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no pages exist', async () => {
    const result = await getPages();
    expect(result).toEqual([]);
  });

  it('should return all pages regardless of publication status', async () => {
    // Create test pages
    await db.insert(pagesTable)
      .values([
        {
          slug: publishedPage.slug,
          title: publishedPage.title,
          content: publishedPage.content,
          meta_description: publishedPage.meta_description,
          is_published: publishedPage.is_published
        },
        {
          slug: unpublishedPage.slug,
          title: unpublishedPage.title,
          content: unpublishedPage.content,
          meta_description: unpublishedPage.meta_description,
          is_published: unpublishedPage.is_published
        }
      ])
      .execute();

    const result = await getPages();

    expect(result).toHaveLength(2);
    expect(result.find(p => p.slug === 'published-page')).toBeDefined();
    expect(result.find(p => p.slug === 'unpublished-page')).toBeDefined();
  });

  it('should return pages ordered by title alphabetically', async () => {
    // Create pages with titles that will test ordering
    await db.insert(pagesTable)
      .values([
        {
          slug: 'zebra-page',
          title: 'Zebra Page',
          content: 'Content',
          meta_description: null,
          is_published: true
        },
        {
          slug: 'alpha-page',
          title: 'Alpha Page',
          content: 'Content',
          meta_description: null,
          is_published: true
        },
        {
          slug: 'beta-page',
          title: 'Beta Page',
          content: 'Content',
          meta_description: null,
          is_published: false
        }
      ])
      .execute();

    const result = await getPages();

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('Alpha Page');
    expect(result[1].title).toEqual('Beta Page');
    expect(result[2].title).toEqual('Zebra Page');
  });

  it('should return pages with all required fields', async () => {
    await db.insert(pagesTable)
      .values({
        slug: publishedPage.slug,
        title: publishedPage.title,
        content: publishedPage.content,
        meta_description: publishedPage.meta_description,
        is_published: publishedPage.is_published
      })
      .execute();

    const result = await getPages();

    expect(result).toHaveLength(1);
    const page = result[0];
    expect(page.id).toBeDefined();
    expect(page.slug).toEqual('published-page');
    expect(page.title).toEqual('Published Page');
    expect(page.content).toEqual('This is a published page content');
    expect(page.meta_description).toEqual('A published page for testing');
    expect(page.is_published).toEqual(true);
    expect(page.created_at).toBeInstanceOf(Date);
    expect(page.updated_at).toBeInstanceOf(Date);
  });
});

describe('getPublishedPages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no published pages exist', async () => {
    const result = await getPublishedPages();
    expect(result).toEqual([]);
  });

  it('should return empty array when only unpublished pages exist', async () => {
    await db.insert(pagesTable)
      .values({
        slug: unpublishedPage.slug,
        title: unpublishedPage.title,
        content: unpublishedPage.content,
        meta_description: unpublishedPage.meta_description,
        is_published: unpublishedPage.is_published
      })
      .execute();

    const result = await getPublishedPages();
    expect(result).toEqual([]);
  });

  it('should return only published pages', async () => {
    // Create both published and unpublished pages
    await db.insert(pagesTable)
      .values([
        {
          slug: publishedPage.slug,
          title: publishedPage.title,
          content: publishedPage.content,
          meta_description: publishedPage.meta_description,
          is_published: publishedPage.is_published
        },
        {
          slug: unpublishedPage.slug,
          title: unpublishedPage.title,
          content: unpublishedPage.content,
          meta_description: unpublishedPage.meta_description,
          is_published: unpublishedPage.is_published
        },
        {
          slug: anotherPublishedPage.slug,
          title: anotherPublishedPage.title,
          content: anotherPublishedPage.content,
          meta_description: anotherPublishedPage.meta_description,
          is_published: anotherPublishedPage.is_published
        }
      ])
      .execute();

    const result = await getPublishedPages();

    expect(result).toHaveLength(2);
    expect(result.every(page => page.is_published === true)).toBe(true);
    expect(result.find(p => p.slug === 'published-page')).toBeDefined();
    expect(result.find(p => p.slug === 'another-published-page')).toBeDefined();
    expect(result.find(p => p.slug === 'unpublished-page')).toBeUndefined();
  });

  it('should return published pages ordered by title alphabetically', async () => {
    // Create published pages with titles for ordering test
    await db.insert(pagesTable)
      .values([
        {
          slug: 'zebra-published',
          title: 'Zebra Published',
          content: 'Content',
          meta_description: null,
          is_published: true
        },
        {
          slug: 'alpha-published',
          title: 'Alpha Published',
          content: 'Content',
          meta_description: null,
          is_published: true
        },
        {
          slug: 'unpublished-middle',
          title: 'Middle Unpublished',
          content: 'Content',
          meta_description: null,
          is_published: false
        }
      ])
      .execute();

    const result = await getPublishedPages();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Alpha Published');
    expect(result[1].title).toEqual('Zebra Published');
  });

  it('should handle pages with null meta_description correctly', async () => {
    await db.insert(pagesTable)
      .values({
        slug: anotherPublishedPage.slug,
        title: anotherPublishedPage.title,
        content: anotherPublishedPage.content,
        meta_description: anotherPublishedPage.meta_description,
        is_published: anotherPublishedPage.is_published
      })
      .execute();

    const result = await getPublishedPages();

    expect(result).toHaveLength(1);
    const page = result[0];
    expect(page.meta_description).toBeNull();
    expect(page.is_published).toEqual(true);
  });

  it('should return published pages with all required fields', async () => {
    await db.insert(pagesTable)
      .values({
        slug: publishedPage.slug,
        title: publishedPage.title,
        content: publishedPage.content,
        meta_description: publishedPage.meta_description,
        is_published: publishedPage.is_published
      })
      .execute();

    const result = await getPublishedPages();

    expect(result).toHaveLength(1);
    const page = result[0];
    expect(page.id).toBeDefined();
    expect(page.slug).toEqual('published-page');
    expect(page.title).toEqual('Published Page');
    expect(page.content).toEqual('This is a published page content');
    expect(page.meta_description).toEqual('A published page for testing');
    expect(page.is_published).toEqual(true);
    expect(page.created_at).toBeInstanceOf(Date);
    expect(page.updated_at).toBeInstanceOf(Date);
  });
});