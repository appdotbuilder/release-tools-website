import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type GetProjectBySlugInput, type CreateProjectInput } from '../schema';
import { getProjectBySlug } from '../handlers/get_project_by_slug';
import { eq } from 'drizzle-orm';

// Test input for creating a project
const testProjectInput: CreateProjectInput = {
  slug: 'test-mutex',
  name: 'Test Mutex Project',
  description: 'A test project for mutex functionality',
  github_url: 'https://github.com/test/mutex',
  github_stars: 150,
  github_forks: 25,
  license: 'MIT',
  is_featured: true
};

// Test input for querying by slug
const testQueryInput: GetProjectBySlugInput = {
  slug: 'test-mutex'
};

describe('getProjectBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return project when found by slug', async () => {
    // Create a test project first
    await db.insert(projectsTable)
      .values({
        slug: testProjectInput.slug,
        name: testProjectInput.name,
        description: testProjectInput.description,
        github_url: testProjectInput.github_url,
        github_stars: testProjectInput.github_stars,
        github_forks: testProjectInput.github_forks,
        license: testProjectInput.license,
        is_featured: testProjectInput.is_featured
      })
      .execute();

    // Query for the project by slug
    const result = await getProjectBySlug(testQueryInput);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.slug).toEqual('test-mutex');
    expect(result!.name).toEqual('Test Mutex Project');
    expect(result!.description).toEqual('A test project for mutex functionality');
    expect(result!.github_url).toEqual('https://github.com/test/mutex');
    expect(result!.github_stars).toEqual(150);
    expect(result!.github_forks).toEqual(25);
    expect(result!.license).toEqual('MIT');
    expect(result!.is_featured).toEqual(true);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when project not found', async () => {
    // Query for a non-existent project
    const nonExistentInput: GetProjectBySlugInput = {
      slug: 'non-existent-project'
    };

    const result = await getProjectBySlug(nonExistentInput);

    // Should return null
    expect(result).toBeNull();
  });

  it('should handle different slug formats correctly', async () => {
    // Create projects with different slug formats
    const projects = [
      {
        slug: 'simple-project',
        name: 'Simple Project',
        description: 'Simple description',
        github_url: 'https://github.com/test/simple',
        github_stars: 10,
        github_forks: 2,
        license: 'Apache-2.0',
        is_featured: false
      },
      {
        slug: 'project_with_underscores',
        name: 'Project With Underscores',
        description: 'Another description',
        github_url: 'https://github.com/test/underscores',
        github_stars: 20,
        github_forks: 5,
        license: 'GPL-3.0',
        is_featured: true
      },
      {
        slug: 'project123',
        name: 'Project With Numbers',
        description: 'Numeric description',
        github_url: 'https://github.com/test/numeric',
        github_stars: 5,
        github_forks: 1,
        license: 'MIT',
        is_featured: false
      }
    ];

    // Insert all test projects
    await db.insert(projectsTable)
      .values(projects)
      .execute();

    // Test each slug format
    for (const project of projects) {
      const result = await getProjectBySlug({ slug: project.slug });
      
      expect(result).not.toBeNull();
      expect(result!.slug).toEqual(project.slug);
      expect(result!.name).toEqual(project.name);
      expect(result!.github_stars).toEqual(project.github_stars);
      expect(result!.is_featured).toEqual(project.is_featured);
    }
  });

  it('should verify data is correctly saved in database', async () => {
    // Create test project
    await db.insert(projectsTable)
      .values({
        slug: testProjectInput.slug,
        name: testProjectInput.name,
        description: testProjectInput.description,
        github_url: testProjectInput.github_url,
        github_stars: testProjectInput.github_stars,
        github_forks: testProjectInput.github_forks,
        license: testProjectInput.license,
        is_featured: testProjectInput.is_featured
      })
      .execute();

    // Query handler result
    const handlerResult = await getProjectBySlug(testQueryInput);

    // Direct database query for comparison
    const dbResults = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.slug, testProjectInput.slug))
      .execute();

    // Both should return the same data
    expect(handlerResult).not.toBeNull();
    expect(dbResults).toHaveLength(1);
    expect(handlerResult!.id).toEqual(dbResults[0].id);
    expect(handlerResult!.slug).toEqual(dbResults[0].slug);
    expect(handlerResult!.name).toEqual(dbResults[0].name);
    expect(handlerResult!.github_stars).toEqual(dbResults[0].github_stars);
    expect(handlerResult!.created_at).toEqual(dbResults[0].created_at);
  });

  it('should handle case-sensitive slug matching', async () => {
    // Create project with specific case
    await db.insert(projectsTable)
      .values({
        slug: 'CamelCase-Project',
        name: 'Camel Case Project',
        description: 'Case sensitive test',
        github_url: 'https://github.com/test/camel',
        github_stars: 30,
        github_forks: 8,
        license: 'BSD-3-Clause',
        is_featured: false
      })
      .execute();

    // Exact match should work
    const exactMatch = await getProjectBySlug({ slug: 'CamelCase-Project' });
    expect(exactMatch).not.toBeNull();
    expect(exactMatch!.name).toEqual('Camel Case Project');

    // Different case should not match (PostgreSQL is case-sensitive by default)
    const wrongCase = await getProjectBySlug({ slug: 'camelcase-project' });
    expect(wrongCase).toBeNull();

    // Another different case should not match
    const upperCase = await getProjectBySlug({ slug: 'CAMELCASE-PROJECT' });
    expect(upperCase).toBeNull();
  });
});