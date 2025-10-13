import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
import { pool } from '@/lib/db'

export async function GET(_: NextRequest, { params }: any) {
    const {type} =  params
    const [rows] = await pool.query('SELECT * FROM policies WHERE type = ?', [type]) as any;
    if (!rows.length) {
        return NextResponse.json({ content: '' });
    }
    return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: any) {
  const { content } = await req.json();
  const {type} =  params
  const [existing] = await pool.query('SELECT * FROM policies WHERE type = ?', [type]) as any;

  if (existing.length > 0) {
    await pool.query('UPDATE policies SET content = ? WHERE type = ?', [content, type]);
  } else {
    await pool.query('INSERT INTO policies (type, content) VALUES (?, ?)', [type, content]);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: any) {
    const {type} =  params
    await pool.query('DELETE FROM policies WHERE type = ?', [type]);
    return NextResponse.json({ success: true });
}
