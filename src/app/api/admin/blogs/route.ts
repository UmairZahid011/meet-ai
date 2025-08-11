import { NextRequest, NextResponse } from 'next/server';
import {db} from '@/lib/db';

export async function GET() {
  const [blogs] = await db.query('SELECT * FROM blogs ORDER BY created_at DESC');
  return NextResponse.json(blogs);
}

export async function POST(req: NextRequest) {
  const { title, content, image } = await req.json();
  await db.query('INSERT INTO blogs (title, content, image) VALUES (?, ?, ?)', [title, content, image || '']);
  return NextResponse.json({ success: true });
}