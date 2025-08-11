import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';


export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email address is required.' }, { status: 400 });
    }

    const [result] = await db.query(
      'SELECT id, email, name FROM users WHERE email = ?',
      [email]
    );
    const user = (result as any[])[0];

    // Always return the same message for security
    const genericResponse = {
      message: 'If an account with that email exists, a password reset link has been sent to it.',
    };

    if (!user) {
      return NextResponse.json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      [resetToken, resetTokenExpires, user.id]
    );

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Meet Ai" <${process.env.SMTP_EMAIL}>`,
      to: user.email,
      subject: 'Password Reset Request',
      text: `Hi ${user.name || user.email},\n\nPlease use the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(genericResponse);

  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
    { message: 'An internal server error occurred.' },
    { status: 500 }
    );
  }
}