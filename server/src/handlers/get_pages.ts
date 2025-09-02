import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type Page } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getPages = async (): Promise<Page[]> => {
  try {
    const results = await db.select()
      .from(pagesTable)
      .orderBy(asc(pagesTable.title))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    throw error;
  }
};

export const getPublishedPages = async (): Promise<Page[]> => {
  try {
    const results = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.is_published, true))
      .orderBy(asc(pagesTable.title))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch published pages:', error);
    throw error;
  }
};