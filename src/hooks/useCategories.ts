'use client';

import { useState, useEffect, useCallback } from 'react';
import { Category, Subcategory } from '@/types';

const STORAGE_KEY = 'portfolio_categories';

// Default categories data
const defaultCategories: Category[] = [
  {
    id: 'design',
    key: 'categories.design',
    icon: 'Palette',
    color: '#8B5CF6',
    subcategories: [
      { id: 'ui-ux', key: 'subcategories.uiUx', icon: 'Layout' },
      { id: 'branding', key: 'subcategories.branding', icon: 'Fingerprint' },
      { id: 'illustration', key: 'subcategories.illustration', icon: 'Brush' },
      { id: 'motion', key: 'subcategories.motion', icon: 'Video' },
    ],
  },
  {
    id: 'development',
    key: 'categories.development',
    icon: 'Code2',
    color: '#10B981',
    subcategories: [
      { id: 'frontend', key: 'subcategories.frontend', icon: 'Monitor' },
      { id: 'backend', key: 'subcategories.backend', icon: 'Server' },
      { id: 'mobile', key: 'subcategories.mobile', icon: 'Smartphone' },
      { id: 'fullstack', key: 'subcategories.fullstack', icon: 'Layers' },
    ],
  },
  {
    id: 'three-d',
    key: 'categories.threeD',
    icon: 'Box',
    color: '#F59E0B',
    subcategories: [
      { id: 'modeling', key: 'subcategories.modeling', icon: 'BoxSelect' },
      { id: 'animation', key: 'subcategories.animation', icon: 'Film' },
      { id: 'rendering', key: 'subcategories.rendering', icon: 'Camera' },
      { id: 'vr-ar', key: 'subcategories.vrAr', icon: 'Glasses' },
    ],
  },
  {
    id: 'creative',
    key: 'categories.creative',
    icon: 'Sparkles',
    color: '#EC4899',
    subcategories: [
      { id: 'photography', key: 'subcategories.photography', icon: 'Camera' },
      { id: 'video', key: 'subcategories.video', icon: 'Video' },
      { id: 'writing', key: 'subcategories.writing', icon: 'PenTool' },
      { id: 'music', key: 'subcategories.music', icon: 'Music' },
    ],
  },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCategories(JSON.parse(stored));
    } else {
      setCategories(defaultCategories);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    
    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newCategory;
  }, [categories]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    const updated = categories.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [categories]);

  const deleteCategory = useCallback((id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [categories]);

  const addSubcategory = useCallback((categoryId: string, subcategory: Omit<Subcategory, 'id'>) => {
    const newSubcategory: Subcategory = {
      ...subcategory,
      id: Date.now().toString(),
    };
    
    const updated = categories.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: [...c.subcategories, newSubcategory],
        };
      }
      return c;
    });
    
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newSubcategory;
  }, [categories]);

  const updateSubcategory = useCallback((categoryId: string, subcategoryId: string, updates: Partial<Subcategory>) => {
    const updated = categories.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: c.subcategories.map(s =>
            s.id === subcategoryId ? { ...s, ...updates } : s
          ),
        };
      }
      return c;
    });
    
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [categories]);

  const deleteSubcategory = useCallback((categoryId: string, subcategoryId: string) => {
    const updated = categories.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: c.subcategories.filter(s => s.id !== subcategoryId),
        };
      }
      return c;
    });
    
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [categories]);

  const resetToDefault = useCallback(() => {
    setCategories(defaultCategories);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
  }, []);

  const exportCategories = useCallback(() => {
    return JSON.stringify(categories, null, 2);
  }, [categories]);

  const importCategories = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        setCategories(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    resetToDefault,
    exportCategories,
    importCategories,
    refresh: loadCategories,
  };
}