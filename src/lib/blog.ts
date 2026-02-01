import { readJson, sortBy } from '@/lib/json-db'
import { BlogPost } from '@/types'

export type BlogPostRow = BlogPost

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = await readJson<BlogPost[]>('blog.json', [])
    return posts.filter(p => p.published)
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return []
  }
}

export async function getFeaturedBlogPosts(limit = 2): Promise<BlogPost[]> {
  try {
    const posts = await readJson<BlogPost[]>('blog.json', [])
    return posts
      .filter(p => p.published && p.featured)
      .slice(0, limit)
  } catch (error) {
    console.error('Failed to fetch featured blog posts:', error)
    return []
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const posts = await readJson<BlogPost[]>('blog.json', [])
    return posts.find(p => p.slug === slug) || null
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return null
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const posts = await readJson<BlogPost[]>('blog.json', [])
    return posts.find(p => p.id === id) || null
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return null
  }
}

export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  try {
    const posts = await readJson<BlogPost[]>('blog.json', [])
    return sortBy(posts, 'createdAt', 'desc')
  } catch (error) {
    console.error('Failed to fetch admin blog posts:', error)
    return []
  }
}
