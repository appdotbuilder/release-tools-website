import { useState, useEffect } from 'react';
import { HomePage } from '@/components/HomePage';
import { ProjectPage } from '@/components/ProjectPage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import type { Project } from '../../server/src/schema';

// Fallback data for when API returns empty results (backend handlers not implemented)
const FALLBACK_PROJECTS: Project[] = [
  {
    id: 1,
    slug: 'mutex',
    name: 'Mutex',
    description: 'Advisory lock service for CI/CD workflows. Prevents deployment conflicts with GitHub PR integration and Slack notifications.',
    github_url: 'https://github.com/releasetools/mutex',
    github_stars: 245,
    github_forks: 18,
    license: 'Apache-2.0',
    is_featured: true,
    created_at: new Date('2023-01-15'),
    updated_at: new Date('2024-01-15')
  },
  {
    id: 2,
    slug: 'cli',
    name: 'CLI',
    description: 'Release tools for bash workflows. Streamlined installation and configuration for release automation.',
    github_url: 'https://github.com/releasetools/cli',
    github_stars: 189,
    github_forks: 12,
    license: 'Apache-2.0',
    is_featured: true,
    created_at: new Date('2023-02-10'),
    updated_at: new Date('2024-01-10')
  }
];

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'mutex' | 'cli'>('home');

  useEffect(() => {
    const loadProjects = async () => {
      // Since the backend handlers are not implemented, use fallback data directly
      // In production, this would make a real API call
      console.log('Using fallback data - backend handlers not implemented');
      setProjects(FALLBACK_PROJECTS);
      setIsLoading(false);
    };

    loadProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage projects={projects} onNavigate={setCurrentPage} />;
      case 'mutex':
        return <ProjectPage projectSlug="mutex" onNavigate={setCurrentPage} />;
      case 'cli':
        return <ProjectPage projectSlug="cli" onNavigate={setCurrentPage} />;
      default:
        return <HomePage projects={projects} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;