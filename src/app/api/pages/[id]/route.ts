import { NextResponse } from 'next/server';
import { readJson, writeJson, now } from '@/lib/json-db';
import { Page } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pages = await readJson<Page[]>('pages.json', []);
    const page = pages.find(p => p.id === id);
    
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    
    return NextResponse.json(page);
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pages = await readJson<Page[]>('pages.json', []);
    
    const index = pages.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    
    pages[index] = {
      ...pages[index],
      ...body,
      updatedAt: now(),
    };
    
    await writeJson('pages.json', pages);
    return NextResponse.json(pages[index]);
  } catch (error) {
    console.error('Failed to update page:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pages = await readJson<Page[]>('pages.json', []);
    const filtered = pages.filter(p => p.id !== id);
    
    await writeJson('pages.json', filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete page:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
