import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  await pool.query(
    'INSERT INTO inquiries (name, email, message) VALUES (?, ?, ?)',
    [name, email, message]
  );

  return NextResponse.json({ success: true });
}

export async function GET() {
  const [rows] = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
  return NextResponse.json(rows);
}