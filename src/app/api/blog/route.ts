import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson, generateId, now } from '@/lib/json-db';
import { BlogPost } from '@/types';

export async function GET() {
  try {
    const posts = await readJson<BlogPost[]>('blog.json', []);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const posts = await readJson<BlogPost[]>('blog.json', []);
    
    const newPost: BlogPost = {
      ...body,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    
    posts.unshift(newPost);
    await writeJson('blog.json', posts);
    
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
