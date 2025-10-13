import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Token and new password are required.' }, { status: 400 });
    }

    const [result] = await pool.query(
      'SELECT id, reset_password_expires FROM users WHERE reset_password_token = ?',
      [token]
    );

    const user = (result as any[])[0];

    if (!user) {
      return NextResponse.json({ message: 'Invalid reset token.' }, { status: 400 });
    }

    const isExpired = new Date(user.reset_password_expires) < new Date();
    if (isExpired) {
      return NextResponse.json({ message: 'Reset link expired. Please try again.' }, { status: 410 }); // 410 Gone
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    return NextResponse.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
