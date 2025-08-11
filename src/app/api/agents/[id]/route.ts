import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  req: NextRequest,
  { params }: any
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const awaitedparam =  params
  const agentId = awaitedparam.id;

  const [rows] = await db.query(
    'SELECT id, name, instruction FROM agents WHERE id = ? AND userId = ?',
    [agentId, session.user?.id]
  );

  const agent = (rows as any[])[0];

  if (!agent) {
    return new NextResponse('Agent not found', { status: 404 });
  }

  return NextResponse.json(agent);
}
