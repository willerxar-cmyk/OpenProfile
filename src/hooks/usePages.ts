'use client';

import { useState, useEffect, useCallback } from 'react';
import { Page, PageStatus } from '@/types';

export function usePages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pages');
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const addPage = useCallback(async (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });
      
      if (!response.ok) throw new Error('Failed to create page');
      
      const newPage = await response.json();
      setPages(prev => [...prev, newPage]);
      return newPage;
    } catch (error) {
      console.error('Failed to add page:', error);
      throw error;
    }
  }, []);

  const updatePage = useCallback(async (id: string, updates: Partial<Page>) => {
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update page');
      
      const updated = await response.json();
      setPages(prev => prev.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error('Failed to update page:', error);
      throw error;
    }
  }, []);

  const deletePage = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete page');
      
      setPages(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete page:', error);
      throw error;
    }
  }, []);

  const getPageById = useCallback((id: string) => {
    return pages.find(p => p.id === id);
  }, [pages]);

  const getPageBySlug = useCallback((slug: string) => {
    return pages.find(p => p.slug === slug && p.published);
  }, [pages]);

  const getPublishedPages = useCallback(() => {
    return pages.filter(p => p.published);
  }, [pages]);

  const getStats = useCallback(() => {
    return {
      total: pages.length,
      published: pages.filter(p => p.published).length,
      drafts: pages.filter(p => p.status === 'draft').length,
    };
  }, [pages]);

  return {
    pages,
    isLoading,
    addPage,
    updatePage,
    deletePage,
    getPageById,
    getPageBySlug,
    getPublishedPages,
    getStats,
    refresh: loadPages,
  };
}
