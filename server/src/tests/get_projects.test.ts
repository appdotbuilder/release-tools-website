import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { getProjects, getFeaturedProjects } from '../handlers/get_projects';

// Test project inputs
const testProject1: CreateProjectInput = {
  slug: 'test-project-1',
  name: 'Test Project 1',
  description: 'A test project for testing',
  github_url: 'https://github.com/user/test-project-1',
  github_stars: 50,
  github_forks: 10,
  license: 'MIT',
  is_featured: true
};

const testProject2: CreateProjectInput = {
  slug: 'test-project-2', 
  name: 'Test Project 2',
  description: 'Another test project',
  github_url: 'https://github.com/user/test-project-2',
  github_stars: 25,
  github_forks: 5,
  license: 'Apache-2.0',
  is_featured: false
};

const testProject3: CreateProjectInput = {
  slug: 'test-project-3',
  name: 'Test Project 3', 
  description: 'A third test project',
  github_url: 'https://github.com/user/test-project-3',
  github_stars: 100,
  github_forks: 20,
  license: 'GPL-3.0',
  is_featured: true
};

describe('getProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all projects ordered by featured status then creation date', async () => {
    // Insert test projects with some delay to ensure different creation times
    await db.insert(projectsTable).values({
      ...testProject2,
      github_stars: testProject2.github_stars,
      github_forks: testProject2.github_forks
    }).execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(projectsTable).values({
      ...testProject1,
      github_stars: testProject1.github_stars,
      github_forks: testProject1.github_forks
    }).execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(projectsTable).values({
      ...testProject3,
      github_stars: testProject3.github_stars,
      github_forks: testProject3.github_forks
    }).execute();

    const results = await getProjects();

    expect(results).toHaveLength(3);
    
    // Featured projects should come first
    expect(results[0].is_featured).toBe(true);
    expect(results[1].is_featured).toBe(true);
    expect(results[2].is_featured).toBe(false);

    // Among featured projects, newer should come first
    expect(results[0].slug).toBe('test-project-3'); // Most recently created featured project
    expect(results[1].slug).toBe('test-project-1'); // Earlier created featured project
    expect(results[2].slug).toBe('test-project-2'); // Non-featured project

    // Verify all fields are present
    results.forEach(project => {
      expect(project.id).toBeDefined();
      expect(project.slug).toBeDefined();
      expect(project.name).toBeDefined();
      expect(project.description).toBeDefined();
      expect(project.github_url).toBeDefined();
      expect(project.github_stars).toBeDefined();
      expect(project.github_forks).toBeDefined();
      expect(project.license).toBeDefined();
      expect(typeof project.is_featured).toBe('boolean');
      expect(project.created_at).toBeInstanceOf(Date);
      expect(project.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return empty array when no projects exist', async () => {
    const results = await getProjects();
    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should handle projects with default values correctly', async () => {
    // Create project with minimal data (relying on defaults)
    await db.insert(projectsTable).values({
      slug: 'minimal-project',
      name: 'Minimal Project',
      description: 'A minimal test project',
      github_url: 'https://github.com/user/minimal'
    }).execute();

    const results = await getProjects();

    expect(results).toHaveLength(1);
    expect(results[0].github_stars).toBe(0); // Default value
    expect(results[0].github_forks).toBe(0); // Default value
    expect(results[0].license).toBe('Apache-2.0'); // Default value
    expect(results[0].is_featured).toBe(false); // Default value
  });
});

describe('getFeaturedProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only featured projects ordered by creation date', async () => {
    // Insert projects with different featured status
    await db.insert(projectsTable).values({
      ...testProject2, // Not featured
      github_stars: testProject2.github_stars,
      github_forks: testProject2.github_forks
    }).execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(projectsTable).values({
      ...testProject1, // Featured
      github_stars: testProject1.github_stars,
      github_forks: testProject1.github_forks
    }).execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(projectsTable).values({
      ...testProject3, // Featured
      github_stars: testProject3.github_stars,
      github_forks: testProject3.github_forks
    }).execute();

    const results = await getFeaturedProjects();

    expect(results).toHaveLength(2);
    
    // Only featured projects should be returned
    results.forEach(project => {
      expect(project.is_featured).toBe(true);
    });

    // Should be ordered by creation date (newest first)
    expect(results[0].slug).toBe('test-project-3'); // Most recently created
    expect(results[1].slug).toBe('test-project-1'); // Earlier created

    // Verify all fields are present
    results.forEach(project => {
      expect(project.id).toBeDefined();
      expect(project.slug).toBeDefined();
      expect(project.name).toBeDefined();
      expect(project.description).toBeDefined();
      expect(project.github_url).toBeDefined();
      expect(project.github_stars).toBeDefined();
      expect(project.github_forks).toBeDefined();
      expect(project.license).toBeDefined();
      expect(project.created_at).toBeInstanceOf(Date);
      expect(project.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return empty array when no featured projects exist', async () => {
    // Insert only non-featured project
    await db.insert(projectsTable).values({
      ...testProject2, // Not featured
      github_stars: testProject2.github_stars,
      github_forks: testProject2.github_forks
    }).execute();

    const results = await getFeaturedProjects();
    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should return empty array when no projects exist at all', async () => {
    const results = await getFeaturedProjects();
    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should handle single featured project correctly', async () => {
    await db.insert(projectsTable).values({
      ...testProject1, // Featured
      github_stars: testProject1.github_stars,
      github_forks: testProject1.github_forks
    }).execute();

    const results = await getFeaturedProjects();

    expect(results).toHaveLength(1);
    expect(results[0].is_featured).toBe(true);
    expect(results[0].slug).toBe('test-project-1');
    expect(results[0].name).toBe('Test Project 1');
    expect(results[0].github_stars).toBe(50);
    expect(results[0].github_forks).toBe(10);
    expect(results[0].license).toBe('MIT');
  });
});