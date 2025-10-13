// import { db } from '@/lib/db';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/authOptions';
// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';

// type UserRow = {
//   id: number;
//   name: string;
//   email: string;
//   password: string;
// };
// export async function GET() {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.email) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [session.user.email]) as any;
//   if (!users.length) return NextResponse.json({ message: 'User not found' }, { status: 404 });

//   const user = users[0];

//   const [[{ meetingCount }]] = await pool.query(
//     'SELECT COUNT(*) as meetingCount FROM meetings WHERE userId = ?',
//     [user.id]
//   ) as any;

//   const [[{ agentCount }]] = await pool.query(
//     'SELECT COUNT(*) as agentCount FROM agents WHERE userId = ?',
//     [user.id]
//   ) as any;

//   return NextResponse.json({
//     ...user,
//     meetingCount,
//     agentCount,
//   });
// }

// export async function PATCH(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.email) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   const { name, currentPass, newPass, image } = await req.json();

//   const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [session.user.email]) as unknown as [UserRow[]];

//   const user = rows[0];
//   if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

//   // Update name
//   if (name) {
//     await pool.query('UPDATE users SET name = ? WHERE email = ?', [name, session.user.email]);
//   }

//   if (image) {
//     await pool.query('UPDATE users SET image = ? WHERE email = ?', [image, session.user.email]);
//   }

//   // Update password
//   if (newPass) {
//     const isMatch = await bcrypt.compare(currentPass, user.password);
//     if (!isMatch) return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });

//     const hashed = await bcrypt.hash(newPass, 10);
//     await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashed, session.user.email]);
//   }

//   return NextResponse.json({ message: 'User updated' });
// }



// import { db } from '@/lib/db';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
  image?: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [session.user.email]) as any;
  if (!users.length) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  const user = users[0];

  const [[{ meetingCount }]] = await pool.query(
    'SELECT COUNT(*) as meetingCount FROM meetings WHERE userId = ?',
    [user.id]
  ) as any;

  const [[{ agentCount }]] = await pool.query(
    'SELECT COUNT(*) as agentCount FROM agents WHERE userId = ?',
    [user.id]
  ) as any;

  return NextResponse.json({
    ...user,
    meetingCount,
    agentCount,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const name = form.get('name') as string;
  const currentPass = form.get('currentPass') as string;
  const newPass = form.get('newPass') as string;
  const imageFile = form.get('image') as File | null;

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [session.user.email]) as unknown as [UserRow[]];
  const user = rows[0];
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  // Update name
  if (name) {
    await pool.query('UPDATE users SET name = ? WHERE email = ?', [name, session.user.email]);
  }

  // Handle image upload
  let imageBase64 = '';
  if (imageFile) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mimeType = imageFile.type;
    imageBase64 = `data:${mimeType};base64,${base64}`;

    await pool.query('UPDATE users SET image = ? WHERE email = ?', [imageBase64, session.user.email]);
  }

  // Update password if needed
  if (newPass) {
    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });

    const hashed = await bcrypt.hash(newPass, 10);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashed, session.user.email]);
  }

  return NextResponse.json({ message: 'User updated', image: imageBase64 || user.image });
}
