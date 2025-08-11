import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);

  const isGoogleAuth = session?.user?.provider === 'google';

  return NextResponse.json({ isGoogleAuth });
}