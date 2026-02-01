'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Github, Linkedin, LogIn, LayoutDashboard } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Simple auth hook for demo
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  React.useEffect(() => {
    const auth = localStorage.getItem('portfolio_auth');
    setIsAuthenticated(!!auth);
  }, []);
  
  return { isAuthenticated };
};

export function Navigation() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const navItems = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.portfolio'), href: '/portfolio' },
    { name: t('navigation.blog'), href: '/blog' },
    { name: t('navigation.curriculum'), href: '/curriculum' },
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled ? "bg-background/95 backdrop-blur-md border-b shadow-sm" : "bg-background/50"
    )}>
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 group-hover:opacity-80 transition-opacity">
              Portfolio.
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-full backdrop-blur-sm border border-white/5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
                pathname === item.href 
                  ? 'bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-1">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Social Links */}
          <Link href="https://github.com" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <Link href="https://linkedin.com" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </Link>
          
          {/* Divider */}
          <div className="w-px h-6 bg-border mx-2" />
          
          {/* Auth Button */}
          {isAuthenticated ? (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden lg:inline">{t('navigation.admin')}</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden lg:inline">{t('navigation.login')}</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-10">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-xl font-medium transition-colors hover:text-primary px-4 py-2 rounded-lg hover:bg-secondary/50',
                      pathname === item.href ? 'text-primary bg-secondary/30' : 'text-muted-foreground'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t space-y-2">
                  {isAuthenticated ? (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary bg-primary/10"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-medium">{t('navigation.admin')}</span>
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span className="font-medium">{t('navigation.login')}</span>
                    </Link>
                  )}
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground px-4 mb-2">Social</p>
                  <div className="flex gap-2 px-4">
                    <Link href="https://github.com" target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Github className="h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="https://linkedin.com" target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Linkedin className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
