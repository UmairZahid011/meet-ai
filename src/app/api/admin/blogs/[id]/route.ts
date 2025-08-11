// import { NextRequest, NextResponse } from 'next/server';
// import {db} from '@/lib/db';
// type Params = {
//   params: {
//     id: string
//   }
// }

// export async function GET(_: Request, { params }: Params) {
//     const {id} = params
//     const [rows] = await db.query('SELECT * FROM blogs WHERE id = ?', [id]) as any;
//     return NextResponse.json(rows[0]);
// }

// export async function PATCH(req: NextRequest, { params }: Params) {
//     const {id} =  params
//     const { title, content, image } = await req.json();
//     await db.query(
//         'UPDATE blogs SET title = ?, content = ?, image = ? WHERE id = ?',
//         [title, content, image || '', id]
//     );
//     return NextResponse.json({ success: true });
// }

// export async function DELETE(_: NextRequest, { params }: Params) {
//     const {id} =  params
//     await db.query('DELETE FROM blogs WHERE id = ?', [id]);
//     return NextResponse.json({ success: true });
// }

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET blog by ID
export async function GET(
  request: NextRequest,
  context: any,
) {
  const id = context.params.id;

  try {
    const [rows] = await db.query('SELECT * FROM blogs WHERE id = ?', [id]) as any;
    if (!rows.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH blog by ID
export async function PATCH(
  request: NextRequest,
  context: any
) {
  const id = context.params.id;

  try {
    const { title, content, image } = await request.json();
    await db.query(
      'UPDATE blogs SET title = ?, content = ?, image = ? WHERE id = ?',
      [title, content, image || '', id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE blog by ID
export async function DELETE(
  request: NextRequest,
  context: any
) {
  const id = context.params.id;

  try {
    await db.query('DELETE FROM blogs WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}