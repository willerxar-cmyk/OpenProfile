'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlogPost, Locale } from '@/types';

const STORAGE_KEY = 'portfolio_blog';

// Default blog data
const defaultPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'getting-started-with-nextjs-16',
    published: true,
    featured: true,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    category: 'development',
    subcategory: 'frontend',
    tags: ['Next.js', 'React', 'Tutorial'],
    author: 'Admin',
    imageUrl: '/images/blog/nextjs-16.jpg',
    translations: {
      en: {
        title: 'Getting Started with Next.js 16: What\'s New',
        excerpt: 'Explore the latest features of Next.js 16 including Proxy, Cache Components, and improved authentication patterns.',
        content: '# Getting Started with Next.js 16\n\nNext.js 16 brings significant improvements...',
      },
      pt: {
        title: 'Começando com Next.js 16: O Que Há de Novo',
        excerpt: 'Explore as últimas funcionalidades do Next.js 16...',
        content: '# Começando com Next.js 16\n\nO Next.js 16 traz melhorias significativas...',
      },
      es: {
        title: 'Empezando con Next.js 16: Novedades',
        excerpt: 'Explore las últimas funcionalidades de Next.js 16...',
        content: '# Empezando con Next.js 16\n\nNext.js 16 trae mejoras significativas...',
      },
    },
  },
];

export function useBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPosts = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPosts(JSON.parse(stored));
    } else {
      // Load default data
      fetch('/data/blog.json')
        .then(res => res.json())
        .then(data => {
          setPosts(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        })
        .catch(() => {
          setPosts(defaultPosts);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPosts));
        });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const addPost = useCallback((post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    
    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newPost;
  }, [posts]);

  const updatePost = useCallback((id: string, updates: Partial<BlogPost>) => {
    const now = new Date().toISOString();
    const updated = posts.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: now } : p
    );
    setPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [posts]);

  const deletePost = useCallback((id: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [posts]);

  const getPostBySlug = useCallback((slug: string) => {
    return posts.find(p => p.slug === slug && p.published);
  }, [posts]);

  const getPostsByCategory = useCallback((category: string, locale: Locale = 'en') => {
    return posts.filter(p => p.category === category && p.published);
  }, [posts]);

  const getFeaturedPosts = useCallback((locale: Locale = 'en') => {
    return posts.filter(p => p.featured && p.published);
  }, [posts]);

  const getRecentPosts = useCallback((limit: number = 5, locale: Locale = 'en') => {
    return posts
      .filter(p => p.published)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [posts]);

  const getRelatedPosts = useCallback((currentPostId: string, limit: number = 3) => {
    const currentPost = posts.find(p => p.id === currentPostId);
    if (!currentPost) return [];
    
    return posts
      .filter(p => 
        p.id !== currentPostId && 
        p.published &&
        (p.category === currentPost.category ||         p.tags.some((tag: string) => currentPost.tags.includes(tag)))
      )
      .slice(0, limit);
  }, [posts]);

  const searchPosts = useCallback((query: string, locale: Locale = 'en') => {
    const lowerQuery = query.toLowerCase();
    return posts.filter(p => {
      if (!p.published) return false;
      const translation = p.translations[locale];
      return (
        translation.title.toLowerCase().includes(lowerQuery) ||
        translation.excerpt.toLowerCase().includes(lowerQuery) ||
        translation.content.toLowerCase().includes(lowerQuery) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }, [posts]);

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }, []);

  const exportPosts = useCallback(() => {
    return JSON.stringify(posts, null, 2);
  }, [posts]);

  const importPosts = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        setPosts(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    posts,
    isLoading,
    addPost,
    updatePost,
    deletePost,
    getPostBySlug,
    getPostsByCategory,
    getFeaturedPosts,
    getRecentPosts,
    getRelatedPosts,
    searchPosts,
    generateSlug,
    exportPosts,
    importPosts,
    refresh: loadPosts,
  };
}