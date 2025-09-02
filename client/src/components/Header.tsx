import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Github, Star } from 'lucide-react';

const navigation = [
  { name: 'Home', page: 'home' as const },
  { name: 'Mutex', page: 'mutex' as const },
  { name: 'CLI', page: 'cli' as const }
];

interface HeaderProps {
  currentPage: 'home' | 'mutex' | 'cli';
  onNavigate: (page: 'home' | 'mutex' | 'cli') => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (page: string) => {
    return currentPage === page;
  };

  const handleNavigation = (page: 'home' | 'mutex' | 'cli') => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavigation('home')}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center space-x-1">
            <span className="text-xl font-bold">release</span>
            <span className="text-xl font-bold text-primary">.tools</span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.page)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.page)
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/releasetools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </Button>
          <Button variant="default" size="sm" asChild>
            <a
              href="https://github.com/releasetools/mutex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>Star</span>
            </a>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col space-y-4 mt-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.page)}
                  className={`text-lg font-medium transition-colors hover:text-primary text-left ${
                    isActive(item.page)
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t">
                <Button variant="outline" asChild>
                  <a
                    href="https://github.com/releasetools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                </Button>
                <Button variant="default" asChild>
                  <a
                    href="https://github.com/releasetools/mutex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Star</span>
                  </a>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}