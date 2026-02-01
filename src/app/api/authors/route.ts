import { NextResponse } from 'next/server';
import { readJson } from '@/lib/json-db';
import { Author } from '@/types';

export async function GET() {
  try {
    const authors = await readJson<Author[]>('authors.json', []);
    return NextResponse.json(authors);
  } catch (error) {
    console.error('Failed to fetch authors:', error);
    return NextResponse.json([], { status: 500 });
  }
}
