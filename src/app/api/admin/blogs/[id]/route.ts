// import { NextRequest, NextResponse } from 'next/server';
// import {db} from '@/lib/db';
// type Params = {
//   params: {
//     id: string
//   }
// }

// export async function GET(_: Request, { params }: Params) {
//     const {id} = params
//     const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]) as any;
//     return NextResponse.json(rows[0]);
// }

// export async function PATCH(req: NextRequest, { params }: Params) {
//     const {id} =  params
//     const { title, content, image } = await req.json();
//     await pool.query(
//         'UPDATE blogs SET title = ?, content = ?, image = ? WHERE id = ?',
//         [title, content, image || '', id]
//     );
//     return NextResponse.json({ success: true });
// }

// export async function DELETE(_: NextRequest, { params }: Params) {
//     const {id} =  params
//     await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
//     return NextResponse.json({ success: true });
// }

// import { NextRequest, NextResponse } from 'next/server';
// // import { db } from '@/lib/db';
// import { pool } from '@/lib/db'

// // GET blog by ID
// export async function GET(
//   request: NextRequest,
//   context: any,
// ) {
//   const id = context.params.id;

//   try {
//     const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]) as any;
//     if (!rows.length) {
//       return NextResponse.json({ error: 'Not found' }, { status: 404 });
//     }
//     return NextResponse.json(rows[0]);
//   } catch (error) {
//     console.error('GET Error:', error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }

// // PATCH blog by ID
// export async function PATCH(
//   request: NextRequest,
//   context: any
// ) {
//   const id = context.params.id;

//   try {
//     const { title, content, image } = await request.json();
//     await pool.query(
//       'UPDATE blogs SET title = ?, content = ?, image = ? WHERE id = ?',
//       [title, content, image || '', id]
//     );

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('PATCH Error:', error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }

// // DELETE blog by ID
// export async function DELETE(
//   request: NextRequest,
//   context: any
// ) {
//   const id = context.params.id;

//   try {
//     await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('DELETE Error:', error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Helper to get ID from URL
function getIdFromUrl(req: NextRequest) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/'); // ['', 'api', 'admin', 'blogs', '6']
  const idParam = segments[segments.length - 1];
  const id = parseInt(idParam, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid ID');
  }
  return id;
}

// GET blog by ID
export async function GET(req: NextRequest) {
  try {
    const id = getIdFromUrl(req);

    const [rows] = await pool.query(
      'SELECT * FROM blogs WHERE id = ?',
      [id]
    ) as any;

    if (!rows.length) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('GET Error:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: error.message === 'Invalid ID' ? 400 : 500 }
    );
  }
}

// PATCH blog by ID
export async function PATCH(req: NextRequest) {
  try {
    const id = getIdFromUrl(req);
    const { title, content, image } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await pool.query(
      'UPDATE blogs SET title = ?, content = ?, image = ? WHERE id = ?',
      [title, content, image || '', id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PATCH Error:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: error.message === 'Invalid ID' ? 400 : 500 }
    );
  }
}

// DELETE blog by ID
export async function DELETE(req: NextRequest) {
  try {
    const id = getIdFromUrl(req);

    await pool.query('DELETE FROM blogs WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE Error:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: error.message === 'Invalid ID' ? 400 : 500 }
    );
  }
}
