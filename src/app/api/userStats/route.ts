import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [meetingsResult, agentsResult] = await Promise.all([
    db.query('SELECT COUNT(*) as meetingCount FROM meetings WHERE user_email = ?', [session.user.email]),
    db.query('SELECT COUNT(*) as agentCount FROM agents'),
  ]);

  const meetingCount = (meetingsResult as any)[0].meetingCount;
  const agentCount = (agentsResult as any)[0].agentCount;

  return NextResponse.json({ meetingCount, agentCount });
}
