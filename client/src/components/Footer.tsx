import { Github, Mail, Scale } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-1 mb-4">
              <span className="text-xl font-bold">release</span>
              <span className="text-xl font-bold text-primary">.tools</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              A collection of tools to improve CI/CD workflows, streamline releases, 
              and prevent deployment pitfalls. Open source, developer-focused, 
              and Apache-2.0 licensed.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-foreground transition-colors"
                >
                  Mutex
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-foreground transition-colors"
                >
                  CLI
                </button>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://github.com/releasetools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center space-x-2"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/releasetools/mutex/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center space-x-2"
                >
                  <Scale className="h-4 w-4" />
                  <span>Apache-2.0 License</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@release.tools"
                  className="hover:text-foreground transition-colors flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} release.tools. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Built for developers, by developers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}