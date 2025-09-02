import { type Page } from '../schema';

export const getPages = async (): Promise<Page[]> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching all pages from the database.
    // Should return only published pages ordered by creation date or title.
    return [];
};

export const getPublishedPages = async (): Promise<Page[]> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching only published pages.
    // Should filter pages where is_published = true and return them ordered appropriately.
    return [];
};