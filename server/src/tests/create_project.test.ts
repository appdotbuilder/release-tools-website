import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields and defaults
const testInput: CreateProjectInput = {
  slug: 'test-project',
  name: 'Test Project',
  description: 'A comprehensive project for testing purposes',
  github_url: 'https://github.com/test/project',
  github_stars: 150,
  github_forks: 25,
  license: 'MIT',
  is_featured: true
};

// Minimal input using Zod defaults
const minimalInput: CreateProjectInput = {
  slug: 'minimal-project',
  name: 'Minimal Project',
  description: 'A minimal project with defaults',
  github_url: 'https://github.com/test/minimal',
  github_stars: 0, // Default value
  github_forks: 0, // Default value
  license: 'Apache-2.0', // Default value
  is_featured: false // Default value
};

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project with all fields', async () => {
    const result = await createProject(testInput);

    // Basic field validation
    expect(result.slug).toEqual('test-project');
    expect(result.name).toEqual('Test Project');
    expect(result.description).toEqual(testInput.description);
    expect(result.github_url).toEqual('https://github.com/test/project');
    expect(result.github_stars).toEqual(150);
    expect(result.github_forks).toEqual(25);
    expect(result.license).toEqual('MIT');
    expect(result.is_featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a project with default values', async () => {
    const result = await createProject(minimalInput);

    // Verify default values are applied
    expect(result.slug).toEqual('minimal-project');
    expect(result.name).toEqual('Minimal Project');
    expect(result.description).toEqual(minimalInput.description);
    expect(result.github_url).toEqual('https://github.com/test/minimal');
    expect(result.github_stars).toEqual(0); // Default value
    expect(result.github_forks).toEqual(0); // Default value
    expect(result.license).toEqual('Apache-2.0'); // Default value
    expect(result.is_featured).toEqual(false); // Default value
  });

  it('should save project to database', async () => {
    const result = await createProject(testInput);

    // Query using proper drizzle syntax
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    const savedProject = projects[0];
    expect(savedProject.slug).toEqual('test-project');
    expect(savedProject.name).toEqual('Test Project');
    expect(savedProject.description).toEqual(testInput.description);
    expect(savedProject.github_url).toEqual('https://github.com/test/project');
    expect(savedProject.github_stars).toEqual(150);
    expect(savedProject.github_forks).toEqual(25);
    expect(savedProject.license).toEqual('MIT');
    expect(savedProject.is_featured).toEqual(true);
    expect(savedProject.created_at).toBeInstanceOf(Date);
    expect(savedProject.updated_at).toBeInstanceOf(Date);
  });

  it('should enforce unique slug constraint', async () => {
    // Create first project
    await createProject(testInput);

    // Try to create another project with same slug
    const duplicateInput: CreateProjectInput = {
      slug: 'test-project', // Same slug as testInput
      name: 'Another Project',
      description: 'This should fail due to duplicate slug',
      github_url: 'https://github.com/test/another',
      github_stars: 0,
      github_forks: 0,
      license: 'Apache-2.0',
      is_featured: false
    };

    // Should throw an error due to unique constraint violation
    await expect(createProject(duplicateInput)).rejects.toThrow(/unique/i);
  });

  it('should handle GitHub URL validation correctly', async () => {
    const validGitHubInput: CreateProjectInput = {
      slug: 'github-project',
      name: 'GitHub Project',
      description: 'Valid GitHub URL project',
      github_url: 'https://github.com/user/repo',
      github_stars: 0,
      github_forks: 0,
      license: 'Apache-2.0',
      is_featured: false
    };

    const result = await createProject(validGitHubInput);
    expect(result.github_url).toEqual('https://github.com/user/repo');
  });

  it('should set proper timestamps', async () => {
    const beforeCreation = new Date();
    const result = await createProject(testInput);
    const afterCreation = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });

  it('should create multiple projects successfully', async () => {
    const project1Input: CreateProjectInput = {
      slug: 'mutex-project',
      name: 'Mutex Project',
      description: 'A mutex synchronization library',
      github_url: 'https://github.com/test/mutex',
      github_stars: 0,
      github_forks: 0,
      license: 'Apache-2.0',
      is_featured: true
    };

    const project2Input: CreateProjectInput = {
      slug: 'cli-project',
      name: 'CLI Project',
      description: 'A command-line interface tool',
      github_url: 'https://github.com/test/cli',
      github_stars: 500,
      github_forks: 0,
      license: 'BSD-3-Clause',
      is_featured: false
    };

    const result1 = await createProject(project1Input);
    const result2 = await createProject(project2Input);

    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.slug).toEqual('mutex-project');
    expect(result2.slug).toEqual('cli-project');

    // Verify both projects exist in database
    const allProjects = await db.select().from(projectsTable).execute();
    expect(allProjects).toHaveLength(2);
  });
});