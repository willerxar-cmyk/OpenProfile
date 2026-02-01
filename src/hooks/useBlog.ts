'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlogPost, Locale, PostStatus, Author, Tag } from '@/types';

export function useBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [postsRes, authorsRes, tagsRes] = await Promise.all([
        fetch('/api/blog'),
        fetch('/api/authors'),
        fetch('/api/tags'),
      ]);

      const [postsData, authorsData, tagsData] = await Promise.all([
        postsRes.json(),
        authorsRes.json(),
        tagsRes.json(),
      ]);

      setPosts(postsData);
      setAuthors(authorsData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add post via API
  const addPost = useCallback(async (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      
      if (!response.ok) throw new Error('Failed to create post');
      
      const newPost = await response.json();
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error('Failed to add post:', error);
      throw error;
    }
  }, []);

  // Update post via API
  const updatePost = useCallback(async (id: string, updates: Partial<BlogPost>) => {
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update post');
      
      const updated = await response.json();
      setPosts(prev => prev.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  }, []);

  // Delete post via API
  const deletePost = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete post');
      
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  }, []);

  // Publish post
  const publishPost = useCallback(async (id: string) => {
    await updatePost(id, { 
      status: 'published', 
      published: true, 
      publishedAt: new Date().toISOString() 
    });
  }, [updatePost]);

  // Archive post
  const archivePost = useCallback(async (id: string) => {
    await updatePost(id, { 
      status: 'archived', 
      published: false 
    });
  }, [updatePost]);

  // Query methods (client-side only)
  const getPostById = useCallback((id: string) => {
    return posts.find(p => p.id === id);
  }, [posts]);

  const getPostBySlug = useCallback((slug: string) => {
    return posts.find(p => p.slug === slug && p.published);
  }, [posts]);

  const getPostsByStatus = useCallback((status: PostStatus) => {
    return posts.filter(p => p.status === status);
  }, [posts]);

  const getPostsByCategory = useCallback((category: string) => {
    return posts.filter(p => p.category === category && p.published);
  }, [posts]);

  const getPostsByTag = useCallback((tagSlug: string) => {
    return posts.filter(p => p.tags.includes(tagSlug) && p.published);
  }, [posts]);

  const getPostsByAuthor = useCallback((authorId: string) => {
    return posts.filter(p => p.authorId === authorId && p.published);
  }, [posts]);

  const getFeaturedPosts = useCallback(() => {
    return posts.filter(p => p.featured && p.published);
  }, [posts]);

  const getRecentPosts = useCallback((limit: number = 5) => {
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
        (p.category === currentPost.category || 
         p.tags.some(tag => currentPost.tags.includes(tag)))
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

  const getPaginatedPosts = useCallback((page: number, pageSize: number) => {
    const published = posts.filter(p => p.published);
    const sorted = published.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      items: sorted.slice(start, end),
      totalPages: Math.ceil(sorted.length / pageSize),
      totalItems: sorted.length,
      hasNext: page < Math.ceil(sorted.length / pageSize),
      hasPrev: page > 1,
    };
  }, [posts]);

  const getAuthorById = useCallback((id: string) => {
    return authors.find(a => a.id === id);
  }, [authors]);

  const getTagBySlug = useCallback((slug: string) => {
    return tags.find(t => t.slug === slug);
  }, [tags]);

  const getAllTags = useCallback(() => {
    return tags;
  }, [tags]);

  const getStats = useCallback(() => {
    return {
      total: posts.length,
      published: posts.filter(p => p.published).length,
      drafts: posts.filter(p => p.status === 'draft').length,
      archived: posts.filter(p => p.status === 'archived').length,
      featured: posts.filter(p => p.featured).length,
    };
  }, [posts]);

  const createSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }, []);

  const refresh = useCallback(() => {
    return loadData();
  }, [loadData]);

  return {
    posts,
    authors,
    tags,
    isLoading,
    addPost,
    updatePost,
    deletePost,
    publishPost,
    archivePost,
    getPostById,
    getPostBySlug,
    getPostsByStatus,
    getPostsByCategory,
    getPostsByTag,
    getPostsByAuthor,
    getFeaturedPosts,
    getRecentPosts,
    getRelatedPosts,
    searchPosts,
    getPaginatedPosts,
    getAuthorById,
    getTagBySlug,
    getAllTags,
    getStats,
    createSlug,
    refresh,
  };
}
