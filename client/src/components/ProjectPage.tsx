import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { CodeBlock } from '@/components/CodeBlock';
import { Sidebar, type SidebarItem } from '@/components/Sidebar';
import { Github, Star, GitFork, ExternalLink, Lock, Terminal, Zap, AlertCircle } from 'lucide-react';

interface ProjectPageProps {
  projectSlug: string;
  onNavigate?: (page: 'home' | 'mutex' | 'cli') => void;
}

// This would typically come from the API
const PROJECT_DATA = {
  mutex: {
    id: 1,
    slug: 'mutex',
    name: 'Mutex',
    description: 'Advisory lock service for CI/CD workflows',
    github_url: 'https://github.com/releasetools/mutex',
    github_stars: 245,
    github_forks: 18,
    license: 'Apache-2.0',
    is_featured: true,
    created_at: new Date('2023-01-15'),
    updated_at: new Date('2024-01-15')
  },
  cli: {
    id: 2,
    slug: 'cli',
    name: 'CLI',
    description: 'Release tools for bash workflows',
    github_url: 'https://github.com/releasetools/cli',
    github_stars: 189,
    github_forks: 12,
    license: 'Apache-2.0',
    is_featured: true,
    created_at: new Date('2023-02-10'),
    updated_at: new Date('2024-01-10')
  }
};

const MUTEX_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'overview', title: 'Overview', anchor: 'overview' },
  { id: 'features', title: 'Features', anchor: 'features' },
  { id: 'usage', title: 'Usage Example', anchor: 'usage' },
  { id: 'configuration', title: 'Configuration', anchor: 'configuration' },
  { id: 'action-inputs', title: 'Action Inputs', anchor: 'action-inputs' },
  { id: 'development', title: 'Development', anchor: 'development' },
  { id: 'license', title: 'License', anchor: 'license' }
];

const CLI_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'overview', title: 'Overview', anchor: 'overview' },
  { id: 'quickstart', title: 'Quickstart', anchor: 'quickstart' },
  { id: 'customizations', title: 'Customizations', anchor: 'customizations' },
  { id: 'github-action', title: 'GitHub Action Usage', anchor: 'github-action' },
  { id: 'developers', title: 'Developers', anchor: 'developers' },
  { id: 'license', title: 'License', anchor: 'license' }
];

export function ProjectPage({ projectSlug }: ProjectPageProps) {
  const [project, setProject] = useState<typeof PROJECT_DATA[keyof typeof PROJECT_DATA] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from the API
    const loadProject = async () => {
      // Since backend handlers are not implemented, use fallback data directly
      const projectData = PROJECT_DATA[projectSlug as keyof typeof PROJECT_DATA];
      if (projectData) {
        setProject(projectData);
      }
      setIsLoading(false);
    };

    loadProject();
  }, [projectSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  const sidebarItems = projectSlug === 'mutex' ? MUTEX_SIDEBAR_ITEMS : CLI_SIDEBAR_ITEMS;

  return (
    <div className="flex">
      <div className="flex-1">
        {/* Header */}
        <section className="py-12 md:py-16 border-b bg-muted/30">
          <div className="container max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {projectSlug === 'mutex' ? (
                    <Lock className="h-8 w-8 text-primary" />
                  ) : (
                    <Terminal className="h-8 w-8 text-primary" />
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold">{project.name}</h1>
                  <Badge variant="secondary">v1.0</Badge>
                </div>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{project.github_stars.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    <span>{project.github_forks.toLocaleString()}</span>
                  </div>
                  <Badge variant="outline">{project.license}</Badge>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    <span>View Source</span>
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`${project.github_url}/releases`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Releases</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container max-w-5xl py-8 md:py-12">
          <div className="flex gap-8">
            <div className="flex-1 prose prose-gray dark:prose-invert max-w-none">
              {projectSlug === 'mutex' ? <MutexContent /> : <CLIContent />}
            </div>
            <Sidebar items={sidebarItems} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MutexContent() {
  return (
    <>
      <section id="overview" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" />
          Overview
        </h2>
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          Mutex is an advisory lock service designed specifically for CI/CD workflows. 
          It prevents deployment conflicts by ensuring only one deployment can run at a time, 
          with built-in GitHub PR integration and Slack notifications.
        </p>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Mutex provides <strong>advisory locks</strong> - it's the responsibility of your workflows 
            to respect and check these locks before proceeding with deployments.
          </AlertDescription>
        </Alert>
      </section>

      <section id="features" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advisory Locking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Prevent deployment conflicts with time-based advisory locks
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GitHub PR Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automatic PR comments with lock status and deployment information
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Slack Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time notifications to your team about deployment status
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Flexible Expiration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurable lock expiration times to prevent stuck deployments
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="usage" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Usage Example</h2>
        <p className="mb-6 text-muted-foreground">
          Here's how to integrate Mutex into your GitHub Actions workflow:
        </p>
        <CodeBlock
          language="yaml"
          title=".github/workflows/deploy.yml"
          code={`name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # Acquire lock before deployment
      - name: Acquire deployment lock
        uses: releasetools/mutex@v1
        with:
          command: acquire
          id: production-deploy
          expiration: 30m
          github-token: \${{ secrets.GITHUB_TOKEN }}
          slack-webhook: \${{ secrets.SLACK_WEBHOOK }}

      # Your deployment steps here
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # Your deployment commands

      # Release lock after deployment
      - name: Release deployment lock
        if: always()
        uses: releasetools/mutex@v1
        with:
          command: release
          id: production-deploy
          github-token: \${{ secrets.GITHUB_TOKEN }}
          slack-webhook: \${{ secrets.SLACK_WEBHOOK }}`}
        />
      </section>

      <section id="configuration" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Configuration</h2>
        
        <h3 className="text-xl font-semibold mb-4">Database Requirements</h3>
        <p className="mb-4 text-muted-foreground">
          Mutex requires a PostgreSQL database to store lock information:
        </p>
        <CodeBlock
          language="sql"
          title="Database Schema"
          code={`CREATE TABLE locks (
  id VARCHAR PRIMARY KEY,
  acquired_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  metadata JSONB
);`}
        />

        <h3 className="text-xl font-semibold mb-4 mt-8">Environment Variables</h3>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">DATABASE_URL</code>
                <p className="text-sm text-muted-foreground">PostgreSQL connection string</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">GITHUB_TOKEN</code>
                <p className="text-sm text-muted-foreground">GitHub token with repo permissions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">SLACK_WEBHOOK_URL</code>
                <p className="text-sm text-muted-foreground">Optional: Slack webhook for notifications</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="action-inputs" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Action Inputs</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-3 text-left">Input</th>
                <th className="border border-border p-3 text-left">Required</th>
                <th className="border border-border p-3 text-left">Description</th>
                <th className="border border-border p-3 text-left">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-3 font-mono text-sm">command</td>
                <td className="border border-border p-3">Yes</td>
                <td className="border border-border p-3">Action to perform: 'acquire' or 'release'</td>
                <td className="border border-border p-3">-</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-mono text-sm">id</td>
                <td className="border border-border p-3">Yes</td>
                <td className="border border-border p-3">Unique identifier for the lock</td>
                <td className="border border-border p-3">-</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-mono text-sm">expiration</td>
                <td className="border border-border p-3">No</td>
                <td className="border border-border p-3">Lock expiration time (e.g., '30m', '1h')</td>
                <td className="border border-border p-3">30m</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-mono text-sm">github-token</td>
                <td className="border border-border p-3">No</td>
                <td className="border border-border p-3">GitHub token for PR comments</td>
                <td className="border border-border p-3">-</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-mono text-sm">slack-webhook</td>
                <td className="border border-border p-3">No</td>
                <td className="border border-border p-3">Slack webhook URL for notifications</td>
                <td className="border border-border p-3">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="development" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Development</h2>
        <p className="mb-4 text-muted-foreground">
          To contribute to Mutex development:
        </p>
        <CodeBlock
          language="bash"
          code={`# Clone the repository
git clone https://github.com/releasetools/mutex.git
cd mutex

# Install dependencies
npm install

# Run tests
npm test

# Build the action
npm run build

# Package for distribution
npm run package`}
        />
        
        <h3 className="text-xl font-semibold mb-4 mt-8">Release Process</h3>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Update version in package.json</li>
          <li>Run <code className="bg-muted px-1 rounded">npm run package</code></li>
          <li>Commit changes and create a PR</li>
          <li>After merge, create a new release with git tags</li>
        </ol>
      </section>

      <section id="license" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">License & About</h2>
        <p className="mb-4 text-muted-foreground">
          Mutex is licensed under the Apache-2.0 License. This means you can use, modify, 
          and distribute it freely in your projects.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <a
              href="https://github.com/releasetools/mutex/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
            >
              View License
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/releasetools/mutex/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              Report Issues
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}

function CLIContent() {
  return (
    <>
      <section id="overview" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Terminal className="h-6 w-6 text-primary" />
          Overview
        </h2>
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          Release Tools CLI provides a collection of bash-friendly tools for automating 
          release workflows. Designed to integrate seamlessly into existing scripts and 
          GitHub Actions with minimal configuration.
        </p>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The CLI tools are designed to be lightweight and dependency-free, making them 
            perfect for use in CI/CD environments and local development workflows.
          </AlertDescription>
        </Alert>
      </section>

      <section id="quickstart" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Quickstart</h2>
        
        <h3 className="text-xl font-semibold mb-4">Installation</h3>
        <p className="mb-4 text-muted-foreground">
          Install the CLI using your preferred method:
        </p>
        
        <div className="space-y-4 mb-8">
          <div>
            <h4 className="font-medium mb-2">Using curl:</h4>
            <CodeBlock
              language="bash"
              code={`curl -fsSL https://install.release.tools | bash`}
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Using wget:</h4>
            <CodeBlock
              language="bash"
              code={`wget -qO- https://install.release.tools | bash`}
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Using Homebrew:</h4>
            <CodeBlock
              language="bash"
              code={`brew install releasetools/tap/rt`}
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Verify Installation</h3>
        <p className="mb-4 text-muted-foreground">
          Check that the installation was successful:
        </p>
        <CodeBlock
          language="bash"
          code={`# Check version
rt --version

# List available commands
rt --help

# Test basic functionality
rt check`}
        />

        <h3 className="text-xl font-semibold mb-4 mt-8">Basic Usage</h3>
        <p className="mb-4 text-muted-foreground">
          Common commands to get started:
        </p>
        <CodeBlock
          language="bash"
          code={`# Initialize a new release
rt init

# Generate changelog
rt changelog

# Create a new release
rt release --tag v1.0.0

# Deploy to environment
rt deploy --env production`}
        />
      </section>

      <section id="customizations" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Customizations</h2>
        
        <h3 className="text-xl font-semibold mb-4">Environment Variables</h3>
        <p className="mb-4 text-muted-foreground">
          Customize the CLI behavior with these environment variables:
        </p>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">RT_INSTALL_DIR</code>
                <p className="text-sm text-muted-foreground">
                  Custom installation directory (default: <code>$HOME/.local/bin</code>)
                </p>
                <CodeBlock
                  language="bash"
                  code={`export RT_INSTALL_DIR="/usr/local/bin"
curl -fsSL https://install.release.tools | bash`}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">RT_BINARY_NAME</code>
                <p className="text-sm text-muted-foreground">
                  Custom binary name (default: <code>rt</code>)
                </p>
                <CodeBlock
                  language="bash"
                  code={`export RT_BINARY_NAME="release-tools"
curl -fsSL https://install.release.tools | bash`}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">RT_CONFIG_DIR</code>
                <p className="text-sm text-muted-foreground">
                  Custom configuration directory (default: <code>$HOME/.config/release-tools</code>)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-xl font-semibold mb-4 mt-8">Configuration File</h3>
        <p className="mb-4 text-muted-foreground">
          Create a configuration file to customize default behavior:
        </p>
        <CodeBlock
          language="yaml"
          title="~/.config/release-tools/config.yml"
          code={`# Default configuration
git:
  default_branch: main
  tag_prefix: "v"
  
changelog:
  format: "markdown"
  sections:
    - "Features"
    - "Bug Fixes"
    - "Breaking Changes"
    
deploy:
  environments:
    - name: "staging"
      url: "https://staging.example.com"
    - name: "production"
      url: "https://example.com"
      
notifications:
  slack:
    webhook_url: "\${SLACK_WEBHOOK_URL}"
    channel: "#deployments"`}
        />
      </section>

      <section id="github-action" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">GitHub Action Usage</h2>
        <p className="mb-4 text-muted-foreground">
          Integrate the CLI tools into your GitHub Actions workflows:
        </p>
        
        <CodeBlock
          language="yaml"
          title=".github/workflows/release.yml"
          code={`name: Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Install Release Tools
        run: |
          curl -fsSL https://install.release.tools | bash
          echo "$HOME/.local/bin" >> $GITHUB_PATH
          
      - name: Generate Changelog
        run: rt changelog --output CHANGELOG.md
        
      - name: Create Release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          rt release \\
            --tag \${{ github.ref_name }} \\
            --changelog CHANGELOG.md \\
            --assets "dist/*"`}
        />

        <h3 className="text-xl font-semibold mb-4 mt-8">Deployment Workflow</h3>
        <CodeBlock
          language="yaml"
          title=".github/workflows/deploy.yml"
          code={`name: Deploy
on:
  workflow_run:
    workflows: ["Release"]
    types: [completed]

jobs:
  deploy:
    if: \${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Release Tools
        run: |
          curl -fsSL https://install.release.tools | bash
          echo "$HOME/.local/bin" >> $GITHUB_PATH
          
      - name: Deploy to Staging
        env:
          DEPLOY_KEY: \${{ secrets.STAGING_DEPLOY_KEY }}
        run: rt deploy --env staging --wait
        
      - name: Deploy to Production
        env:
          DEPLOY_KEY: \${{ secrets.PRODUCTION_DEPLOY_KEY }}
        run: rt deploy --env production --confirm`}
        />
      </section>

      <section id="developers" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Developers</h2>
        
        <h3 className="text-xl font-semibold mb-4">Development Setup</h3>
        <p className="mb-4 text-muted-foreground">
          Set up your development environment:
        </p>
        <CodeBlock
          language="bash"
          code={`# Clone the repository
git clone https://github.com/releasetools/cli.git
cd cli

# Install dependencies
make install-deps

# Run tests
make test

# Build binary
make build

# Install locally for testing
make install-local`}
        />

        <h3 className="text-xl font-semibold mb-4 mt-8">Contributing</h3>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
          <li>Fork the repository</li>
          <li>Create a feature branch: <code className="bg-muted px-1 rounded">git checkout -b feature/my-feature</code></li>
          <li>Make your changes and add tests</li>
          <li>Run tests: <code className="bg-muted px-1 rounded">make test</code></li>
          <li>Commit changes: <code className="bg-muted px-1 rounded">git commit -am 'Add my feature'</code></li>
          <li>Push to branch: <code className="bg-muted px-1 rounded">git push origin feature/my-feature</code></li>
          <li>Create a Pull Request</li>
        </ol>

        <h3 className="text-xl font-semibold mb-4">Release Process</h3>
        <p className="mb-4 text-muted-foreground">
          For maintainers releasing new versions:
        </p>
        <CodeBlock
          language="bash"
          code={`# Update version
echo "1.2.3" > VERSION

# Generate changelog
make changelog

# Commit changes
git add VERSION CHANGELOG.md
git commit -m "chore: release v1.2.3"

# Create and push tag
git tag v1.2.3
git push origin main --tags

# GitHub Actions will handle the rest`}
        />
      </section>

      <section id="license" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">License & About</h2>
        <p className="mb-4 text-muted-foreground">
          Release Tools CLI is licensed under the Apache-2.0 License. This means you can use, 
          modify, and distribute it freely in your projects.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <a
              href="https://github.com/releasetools/cli/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
            >
              View License
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/releasetools/cli/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              Report Issues
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}