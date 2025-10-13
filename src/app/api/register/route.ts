import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
// import { db } from '@/lib/db';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }
  if (name.length < 3) {
    return NextResponse.json({ message: 'Name must be at least 3 characters' }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
  }
  
  const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if ((existing as any[]).length > 0) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // await pool.query(
  //   'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
  //   [name, email, hashedPassword]
  // );

  const result: any = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  const userId = result[0].insertId;

  const [rows] = await pool.query(
      'SELECT id, name, tokens FROM plans WHERE name = ?',
      ['free']
    ) as any[];

    const plan = rows[0];
    const plan_id = rows[0]?.id


    await pool.query(
      'INSERT INTO user_plans (user_id, plan_id) VALUES (?, ?)',
      [userId, plan_id]
    );

    await pool.query(
      'UPDATE users SET plan = ?, tokens = tokens + ? WHERE id = ?',
      [plan.name, plan.tokens, userId]
    );

  return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
}
