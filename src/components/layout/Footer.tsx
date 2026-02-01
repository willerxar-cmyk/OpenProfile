'use client';

import { Github, Linkedin, Twitter, Mail, MapPin, Phone, Heart } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';

export function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    navigation: [
      { name: t('navigation.home') || 'Home', href: '/' },
      { name: t('navigation.portfolio') || 'Portfolio', href: '/portfolio' },
      { name: t('navigation.blog') || 'Blog', href: '/blog' },
      { name: t('navigation.curriculum') || 'Currículo', href: '/curriculum' },
    ],
    social: [
      { name: 'GitHub', href: 'https://github.com', icon: Github },
      { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
      { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    ],
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                Portfolio.
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Criando experiências digitais incríveis através de design, desenvolvimento e arte 3D.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {footerLinks.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              {t('navigation.title') || 'Navegação'}
            </h3>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contato@portfolio.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+55 (11) 99999-9999</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>São Paulo, Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Portfolio. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using Next.js & Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}
