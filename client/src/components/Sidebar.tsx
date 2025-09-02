import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu } from 'lucide-react';

export interface SidebarItem {
  id: string;
  title: string;
  anchor: string;
  level?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function Sidebar({ items, className = '' }: SidebarProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        rootMargin: '-100px 0px -66%',
        threshold: 0.1 
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <ScrollArea className="h-full">
      <div className="p-6">
        <h3 className="font-semibold mb-4">On this page</h3>
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = activeSection === item.id;
            const level = item.level || 0;
            
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left text-sm py-2 px-3 rounded-md transition-colors hover:bg-muted ${
                  isActive
                    ? 'text-primary bg-primary/10 font-medium'
                    : 'text-muted-foreground'
                } ${
                  level > 0 ? `ml-${level * 4}` : ''
                }`}
                style={{ marginLeft: level > 0 ? `${level * 16}px` : '0' }}
              >
                {item.title}
              </button>
            );
          })}
        </nav>
      </div>
    </ScrollArea>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden fixed bottom-6 right-6 z-40">
          <Button size="icon" className="rounded-full shadow-lg">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block w-64 shrink-0 ${className}`}>
        <div className="sticky top-20 h-[calc(100vh-5rem)]">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}