import { NextResponse } from 'next/server';
import { readJson, writeJson, generateId, now } from '@/lib/json-db';
import { Page } from '@/types';

export async function GET() {
  try {
    const pages = await readJson<Page[]>('pages.json', []);
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pages = await readJson<Page[]>('pages.json', []);
    
    const newPage: Page = {
      ...body,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    
    pages.push(newPage);
    await writeJson('pages.json', pages);
    
    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('Failed to create page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
