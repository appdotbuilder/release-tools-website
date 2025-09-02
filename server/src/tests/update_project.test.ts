import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type CreateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq } from 'drizzle-orm';

// Helper function to create a test project
const createTestProject = async (overrides: Partial<CreateProjectInput> = {}): Promise<number> => {
  const testProject: CreateProjectInput = {
    slug: 'test-project',
    name: 'Test Project',
    description: 'A project for testing',
    github_url: 'https://github.com/test/project',
    github_stars: 42,
    github_forks: 7,
    license: 'MIT',
    is_featured: false,
    ...overrides
  };

  const result = await db.insert(projectsTable)
    .values({
      ...testProject,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a project with all fields', async () => {
    const projectId = await createTestProject();
    const originalProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    const updateInput: UpdateProjectInput = {
      id: projectId,
      slug: 'updated-project',
      name: 'Updated Project',
      description: 'An updated project description',
      github_url: 'https://github.com/updated/project',
      github_stars: 100,
      github_forks: 25,
      license: 'Apache-2.0',
      is_featured: true
    };

    const result = await updateProject(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(projectId);
    expect(result!.slug).toEqual('updated-project');
    expect(result!.name).toEqual('Updated Project');
    expect(result!.description).toEqual('An updated project description');
    expect(result!.github_url).toEqual('https://github.com/updated/project');
    expect(result!.github_stars).toEqual(100);
    expect(result!.github_forks).toEqual(25);
    expect(result!.license).toEqual('Apache-2.0');
    expect(result!.is_featured).toEqual(true);
    expect(result!.created_at).toEqual(originalProject[0].created_at);
    expect(result!.updated_at).not.toEqual(originalProject[0].updated_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update a project with partial fields', async () => {
    const projectId = await createTestProject({
      name: 'Original Name',
      github_stars: 10
    });

    const updateInput: UpdateProjectInput = {
      id: projectId,
      name: 'Partially Updated Name',
      github_stars: 50
    };

    const result = await updateProject(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(projectId);
    expect(result!.name).toEqual('Partially Updated Name');
    expect(result!.github_stars).toEqual(50);
    // Other fields should remain unchanged
    expect(result!.slug).toEqual('test-project');
    expect(result!.description).toEqual('A project for testing');
    expect(result!.github_url).toEqual('https://github.com/test/project');
    expect(result!.github_forks).toEqual(7);
    expect(result!.license).toEqual('MIT');
    expect(result!.is_featured).toEqual(false);
  });

  it('should update only updated_at when no fields provided', async () => {
    const projectId = await createTestProject();
    const originalProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    const updateInput: UpdateProjectInput = {
      id: projectId
    };

    const result = await updateProject(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(projectId);
    expect(result!.slug).toEqual(originalProject[0].slug);
    expect(result!.name).toEqual(originalProject[0].name);
    expect(result!.description).toEqual(originalProject[0].description);
    expect(result!.created_at).toEqual(originalProject[0].created_at);
    expect(result!.updated_at).toEqual(originalProject[0].updated_at);
  });

  it('should return null for non-existent project', async () => {
    const updateInput: UpdateProjectInput = {
      id: 999999, // Non-existent ID
      name: 'Non-existent Project'
    };

    const result = await updateProject(updateInput);

    expect(result).toBeNull();
  });

  it('should persist changes to database', async () => {
    const projectId = await createTestProject();

    const updateInput: UpdateProjectInput = {
      id: projectId,
      name: 'Database Persisted Name',
      github_stars: 200
    };

    await updateProject(updateInput);

    // Verify changes are persisted in database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].name).toEqual('Database Persisted Name');
    expect(projects[0].github_stars).toEqual(200);
    expect(projects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle boolean field updates correctly', async () => {
    const projectId = await createTestProject({
      is_featured: false
    });

    const updateInput: UpdateProjectInput = {
      id: projectId,
      is_featured: true
    };

    const result = await updateProject(updateInput);

    expect(result).toBeDefined();
    expect(result!.is_featured).toEqual(true);

    // Test updating back to false
    const updateInput2: UpdateProjectInput = {
      id: projectId,
      is_featured: false
    };

    const result2 = await updateProject(updateInput2);

    expect(result2).toBeDefined();
    expect(result2!.is_featured).toEqual(false);
  });

  it('should handle numeric field updates correctly', async () => {
    const projectId = await createTestProject({
      github_stars: 0,
      github_forks: 0
    });

    const updateInput: UpdateProjectInput = {
      id: projectId,
      github_stars: 1500,
      github_forks: 300
    };

    const result = await updateProject(updateInput);

    expect(result).toBeDefined();
    expect(result!.github_stars).toEqual(1500);
    expect(result!.github_forks).toEqual(300);
    expect(typeof result!.github_stars).toBe('number');
    expect(typeof result!.github_forks).toBe('number');
  });

  it('should handle URL field updates correctly', async () => {
    const projectId = await createTestProject();

    const updateInput: UpdateProjectInput = {
      id: projectId,
      github_url: 'https://github.com/new/repository'
    };

    const result = await updateProject(updateInput);

    expect(result).toBeDefined();
    expect(result!.github_url).toEqual('https://github.com/new/repository');
  });
});