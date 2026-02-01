'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlogPost, Locale, PostStatus, Author, Tag } from '@/types';
import { readJson, writeJson, generateId, generateSlug, now, createIndex, findById, findAll, paginate, sortBy } from '@/lib/json-db';

const BLOG_STORAGE_KEY = 'portfolio_blog';
const AUTHORS_STORAGE_KEY = 'portfolio_authors';
const TAGS_STORAGE_KEY = 'portfolio_tags';

export function useBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from JSON files
  const loadData = useCallback(async () => {
    try {
      const [postsData, authorsData, tagsData] = await Promise.all([
        readJson<BlogPost[]>('blog.json', []),
        readJson<Author[]>('authors.json', []),
        readJson<Tag[]>('tags.json', []),
      ]);

      setPosts(postsData);
      setAuthors(authorsData);
      setTags(tagsData);

      // Create indexes for efficient searching
      createIndex('posts', postsData);
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save posts to JSON
  const savePosts = useCallback(async (updatedPosts: BlogPost[]) => {
    await writeJson('blog.json', updatedPosts);
    setPosts(updatedPosts);
    createIndex('posts', updatedPosts);
  }, []);

  const addPost = useCallback(async (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nowStr = now();
    const newPost: BlogPost = {
      ...post,
      id: generateId(),
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    
    const updated = [newPost, ...posts];
    await savePosts(updated);
    return newPost;
  }, [posts, savePosts]);

  const updatePost = useCallback(async (id: string, updates: Partial<BlogPost>) => {
    const nowStr = now();
    const updated = posts.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: nowStr } : p
    );
    await savePosts(updated);
  }, [posts, savePosts]);

  const deletePost = useCallback(async (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    await savePosts(updated);
  }, [posts, savePosts]);

  const publishPost = useCallback(async (id: string) => {
    const nowStr = now();
    const updated = posts.map(p => 
      p.id === id ? { 
        ...p, 
        status: 'published' as PostStatus, 
        published: true, 
        publishedAt: nowStr,
        updatedAt: nowStr 
      } : p
    );
    await savePosts(updated);
  }, [posts, savePosts]);

  const archivePost = useCallback(async (id: string) => {
    const nowStr = now();
    const updated = posts.map(p => 
      p.id === id ? { 
        ...p, 
        status: 'archived' as PostStatus, 
        published: false, 
        updatedAt: nowStr 
      } : p
    );
    await savePosts(updated);
  }, [posts, savePosts]);

  // Query methods
  const getPostById = useCallback((id: string) => {
    return findById<BlogPost>('posts', id);
  }, []);

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
    return sortBy(posts.filter(p => p.published), 'createdAt', 'desc').slice(0, limit);
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

  // Pagination
  const getPaginatedPosts = useCallback((page: number, pageSize: number) => {
    const published = posts.filter(p => p.published);
    return paginate(sortBy(published, 'createdAt', 'desc'), page, pageSize);
  }, [posts]);

  // Author methods
  const getAuthorById = useCallback((id: string) => {
    return authors.find(a => a.id === id);
  }, [authors]);

  // Tag methods
  const getTagBySlug = useCallback((slug: string) => {
    return tags.find(t => t.slug === slug);
  }, [tags]);

  const getAllTags = useCallback(() => {
    return tags;
  }, [tags]);

  // Stats
  const getStats = useCallback(() => {
    return {
      total: posts.length,
      published: posts.filter(p => p.published).length,
      drafts: posts.filter(p => p.status === 'draft').length,
      archived: posts.filter(p => p.status === 'archived').length,
      featured: posts.filter(p => p.featured).length,
    };
  }, [posts]);

  // Utility methods
  const createSlug = useCallback((title: string) => {
    return generateSlug(title);
  }, []);

  const refresh = useCallback(() => {
    return loadData();
  }, [loadData]);

  return {
    // Data
    posts,
    authors,
    tags,
    isLoading,
    
    // CRUD
    addPost,
    updatePost,
    deletePost,
    publishPost,
    archivePost,
    
    // Queries
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
    
    // Related data
    getAuthorById,
    getTagBySlug,
    getAllTags,
    
    // Stats
    getStats,
    
    // Utils
    createSlug,
    refresh,
  };
}
