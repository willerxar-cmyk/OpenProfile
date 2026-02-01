import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson, now } from '@/lib/json-db';
import { BlogPost } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const posts = await readJson<BlogPost[]>('blog.json', []);
    const post = posts.find(p => p.id === id);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const posts = await readJson<BlogPost[]>('blog.json', []);
    
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    posts[index] = {
      ...posts[index],
      ...body,
      updatedAt: now(),
    };
    
    await writeJson('blog.json', posts);
    return NextResponse.json(posts[index]);
  } catch (error) {
    console.error('Failed to update blog post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const posts = await readJson<BlogPost[]>('blog.json', []);
    const filtered = posts.filter(p => p.id !== id);
    
    await writeJson('blog.json', filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete blog post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
