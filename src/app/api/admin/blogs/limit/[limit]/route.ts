import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_: Request, { params }: any) {
  const stringLimit = params
    const limit = parseInt(stringLimit.limit);

  const [rows] = await db.query(
    'SELECT * FROM blogs ORDER BY created_at DESC LIMIT ?',
    [limit]
  ) as any;

  return NextResponse.json(rows);
}
