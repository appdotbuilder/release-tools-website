import { type Project } from '../schema';

export const getProjects = async (): Promise<Project[]> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching all projects from the database.
    // Should return projects ordered by creation date or featured status.
    return [];
};

export const getFeaturedProjects = async (): Promise<Project[]> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching only featured projects for the home page.
    // Should filter projects where is_featured = true and return them ordered appropriately.
    return [];
};