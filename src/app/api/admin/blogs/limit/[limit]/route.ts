// import { NextResponse } from 'next/server';
// // import { db } from '@/lib/db';
// import { pool } from '@/lib/db'

// export async function GET(_: Request, { params }: any) {
//   const stringLimit = params
//     const limit = parseInt(stringLimit.limit);

//   const [rows] = await pool.query(
//     'SELECT * FROM blogs ORDER BY created_at DESC LIMIT ?',
//     [limit]
//   ) as any;

//   return NextResponse.json(rows);
// }


import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  try {
    // Use URL to get the limit param instead of context.params
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/'); // ['','api','admin','blogs','limit','3']
    const limitParam = pathSegments[pathSegments.length - 1]; // last segment is the limit
    const limit = parseInt(limitParam, 10);

    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT * FROM blogs ORDER BY created_at DESC LIMIT ?',
      [limit]
    ) as any;

    return NextResponse.json(rows);
  } catch (err) {
    console.error('Error fetching blogs with limit:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


