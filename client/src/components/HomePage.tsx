import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Star, GitFork, ExternalLink, Zap, Shield, Users } from 'lucide-react';
import type { Project } from '../../../server/src/schema';

interface HomePageProps {
  projects: Project[];
  onNavigate: (page: 'home' | 'mutex' | 'cli') => void;
}

export function HomePage({ projects, onNavigate }: HomePageProps) {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-foreground">release</span>
              <span className="text-primary">.tools</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              A collection of tools to improve CI/CD workflows, streamline releases, 
              and prevent deployment pitfalls.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a
                  href="https://github.com/releasetools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <Github className="h-5 w-5" />
                  <span>View on GitHub</span>
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => onNavigate('mutex')}
                className="flex items-center space-x-2"
              >
                <Zap className="h-5 w-5" />
                <span>Get Started</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Modern Development
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Developer-focused tools designed to integrate seamlessly into your existing workflows
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Open Source</h3>
              <p className="text-muted-foreground">
                Apache-2.0 licensed with full transparency and community contributions welcome
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Developer-Focused</h3>
              <p className="text-muted-foreground">
                Designed by developers for developers with clean APIs and comprehensive documentation
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
              <p className="text-muted-foreground">
                Battle-tested in real-world scenarios with robust error handling and monitoring
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to streamline your CI/CD pipeline and prevent deployment issues
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {projects.map((project: Project) => (
              <Card key={project.id} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{project.name}</CardTitle>
                    <Badge variant="secondary">Featured</Badge>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{project.github_stars.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GitFork className="h-4 w-4" />
                        <span>{project.github_forks.toLocaleString()}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {project.license}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      className="flex-1"
                      onClick={() => onNavigate(project.slug as 'mutex' | 'cli')}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>Learn More</span>
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2"
                      >
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Improve Your CI/CD?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join developers who trust release.tools to streamline their deployment workflows
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => onNavigate('mutex')}
                className="flex items-center space-x-2"
              >
                <Zap className="h-5 w-5" />
                <span>Get Started with Mutex</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => onNavigate('cli')}
                className="flex items-center space-x-2"
              >
                <span>Explore CLI Tools</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}