'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { slugify } from '@/lib/slug'
import { readJson, writeJson, generateId, now } from '@/lib/json-db'
import { BlogPost, PostStatus } from '@/types'

const BlogPostSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  imageUrl: z.string().url('URL de imagem inválida').optional().or(z.literal('')),
  category: z.string().optional(),
  tags: z.string().optional(),
  featured: z.string().optional(),
  published: z.string().optional(),
})

export async function createBlogPost(_: unknown, formData: FormData) {
  const raw = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    imageUrl: formData.get('imageUrl'),
    category: formData.get('category'),
    tags: formData.get('tags'),
    featured: formData.get('featured'),
    published: formData.get('published'),
  }

  const parsed = BlogPostSchema.safeParse(raw)
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  const tags = parsed.data.tags
    ? parsed.data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const slug = (parsed.data.slug && parsed.data.slug.trim()) ? slugify(parsed.data.slug) : slugify(parsed.data.title)
  const nowStr = now()

  try {
    const posts = await readJson<BlogPost[]>('blog.json', [])
    
    const newPost: BlogPost = {
      id: generateId(),
      slug,
      status: parsed.data.published === 'on' ? 'published' : 'draft',
      published: parsed.data.published === 'on',
      featured: parsed.data.featured === 'on',
      createdAt: nowStr,
      updatedAt: nowStr,
      publishedAt: parsed.data.published === 'on' ? nowStr : undefined,
      category: parsed.data.category || 'general',
      subcategory: 'general',
      tags,
      authorId: 'author-1', // Default author
      imageUrl: parsed.data.imageUrl || undefined,
      translations: {
        en: {
          title: parsed.data.title,
          excerpt: parsed.data.excerpt || '',
          content: parsed.data.content,
        },
        pt: {
          title: parsed.data.title,
          excerpt: parsed.data.excerpt || '',
          content: parsed.data.content,
        },
        es: {
          title: parsed.data.title,
          excerpt: parsed.data.excerpt || '',
          content: parsed.data.content,
        },
      },
    }

    posts.unshift(newPost)
    await writeJson('blog.json', posts)
  } catch (error) {
    console.error('Failed to create blog post:', error)
    return { message: 'Falha ao criar post.' }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return { message: 'Post criado com sucesso' }
}

export async function updateBlogPost(id: string, _: unknown, formData: FormData) {
  const raw = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    imageUrl: formData.get('imageUrl'),
    category: formData.get('category'),
    tags: formData.get('tags'),
    featured: formData.get('featured'),
    published: formData.get('published'),
  }

  const parsed = BlogPostSchema.safeParse(raw)
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  const tags = parsed.data.tags
    ? parsed.data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const slug = (parsed.data.slug && parsed.data.slug.trim()) ? slugify(parsed.data.slug) : slugify(parsed.data.title)
  const nowStr = now()

  try {
    const posts = await readJson<BlogPost[]>('blog.json', [])
    const postIndex = posts.findIndex(p => p.id === id)
    
    if (postIndex === -1) {
      return { message: 'Post não encontrado' }
    }

    const oldPost = posts[postIndex]
    const wasPublished = oldPost.published
    const isPublished = parsed.data.published === 'on'

    posts[postIndex] = {
      ...oldPost,
      slug,
      status: isPublished ? 'published' : 'draft',
      published: isPublished,
      featured: parsed.data.featured === 'on',
      updatedAt: nowStr,
      publishedAt: !wasPublished && isPublished ? nowStr : oldPost.publishedAt,
      category: parsed.data.category || 'general',
      tags,
      imageUrl: parsed.data.imageUrl || undefined,
      translations: {
        ...oldPost.translations,
        en: {
          ...oldPost.translations.en,
          title: parsed.data.title,
          excerpt: parsed.data.excerpt || '',
          content: parsed.data.content,
        },
        pt: {
          ...oldPost.translations.pt,
          title: parsed.data.title,
          excerpt: parsed.data.excerpt || '',
          content: parsed.data.content,
        },
        es: {
          ...oldPost.translations.es,
          title: parsed.data.title,
          excerpt: parsed.data.excerpt || '',
          content: parsed.data.content,
        },
      },
    }

    await writeJson('blog.json', posts)
  } catch (error) {
    console.error('Failed to update blog post:', error)
    return { message: 'Falha ao salvar post.' }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  revalidatePath(`/blog/${slug}`)
  revalidatePath(`/admin/blog/edit/${id}`)
  return { message: 'Post atualizado com sucesso' }
}

export async function deleteBlogPost(id: string) {
  try {
    const posts = await readJson<BlogPost[]>('blog.json', [])
    const filtered = posts.filter(p => p.id !== id)
    await writeJson('blog.json', filtered)
  } catch (error) {
    console.error('Failed to delete blog post:', error)
    throw new Error('Falha ao excluir post')
  }
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}

export async function toggleBlogPostPublished(id: string, nextValue: boolean) {
  try {
    const posts = await readJson<BlogPost[]>('blog.json', [])
    const postIndex = posts.findIndex(p => p.id === id)
    
    if (postIndex === -1) throw new Error('Post não encontrado')

    const nowStr = now()
    posts[postIndex] = {
      ...posts[postIndex],
      published: nextValue,
      status: nextValue ? 'published' : 'draft',
      updatedAt: nowStr,
      publishedAt: nextValue && !posts[postIndex].publishedAt ? nowStr : posts[postIndex].publishedAt,
    }

    await writeJson('blog.json', posts)
  } catch (error) {
    console.error('Failed to toggle published:', error)
    throw new Error('Falha ao atualizar status')
  }
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}

export async function toggleBlogPostFeatured(id: string, nextValue: boolean) {
  try {
    const posts = await readJson<BlogPost[]>('blog.json', [])
    const postIndex = posts.findIndex(p => p.id === id)
    
    if (postIndex === -1) throw new Error('Post não encontrado')

    posts[postIndex] = {
      ...posts[postIndex],
      featured: nextValue,
      updatedAt: now(),
    }

    await writeJson('blog.json', posts)
  } catch (error) {
    console.error('Failed to toggle featured:', error)
    throw new Error('Falha ao atualizar destaque')
  }
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}
