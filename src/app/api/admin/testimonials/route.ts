import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
import { pool } from '@/lib/db'

// export async function GET() {
//   const [rows] = await db.query('SELECT * FROM testimonials ORDER BY created_at DESC');
//   return NextResponse.json(rows);
// }

// export async function GET() {
//   const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC')
//   return NextResponse.json(rows)
// }

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (err) {
    console.error('DB Error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  const { image, name, position, description, rating } = await req.json();
  await pool.query(
    'INSERT INTO testimonials (image, name, position, description, rating) VALUES (?, ?, ?, ?, ?)',
    [image, name, position, description, rating]
  );
  return NextResponse.json({ success: true });
}
