import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const [existing] = await pool.query('SELECT id FROM newsletters WHERE email = ?', [email]);
  if ((existing as any[]).length > 0) {
    return NextResponse.json({ success: false, message: 'Email already subscribed' }, { status: 400 });
  }
  await pool.query('INSERT IGNORE INTO newsletters (email) VALUES (?)', [email]);
  return NextResponse.json({ success: true });
}
export async function GET() {
  const [rows] = await pool.query('SELECT * FROM newsletters ORDER BY created_at DESC');
  return NextResponse.json(rows);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await pool.query('DELETE FROM newsletters WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}