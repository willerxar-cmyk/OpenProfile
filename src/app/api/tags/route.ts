import { NextResponse } from 'next/server';
import { readJson } from '@/lib/json-db';
import { Tag } from '@/types';

export async function GET() {
  try {
    const tags = await readJson<Tag[]>('tags.json', []);
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json([], { status: 500 });
  }
}
