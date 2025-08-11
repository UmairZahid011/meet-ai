import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Agent } from '@/lib/types'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const [rows] = await db.query('SELECT * FROM agents WHERE userId = ?', [session.user?.id])
  const agents = (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      instruction: row.instruction
    })) as Agent[];
  return NextResponse.json(agents)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const body = await req.json()
  const newAgent: Agent = {
    ...body,
    userId: session.user?.id,
  }
  const [userPlanRows] = await db.query('SELECT plan_id FROM user_plans WHERE user_id = ?', [session.user?.id]) as [any[], any];
  const planId = userPlanRows[0]?.plan_id;
  console.log(planId, 'plan id');

  const [planRows] = await db.query('SELECT agent_cost FROM plans WHERE id = ?', [planId]) as [any[], any];
  const agentTokenCost = planRows[0]?.agent_cost;
  console.log(agentTokenCost, 'agent cost');
  

  const [userRows] = await db.query('SELECT tokens FROM users WHERE id = ?', [session.user?.id]) as [any[], any];
  const tokens = userRows[0]?.tokens;
  console.log(tokens, 'user tokens');


  if (tokens < agentTokenCost) {
    return new NextResponse('Not enough tokens', { status: 403 });
  }

  // Deduct tokens
  await db.query('UPDATE users SET tokens = tokens - ? WHERE id = ?', [agentTokenCost, session.user?.id]);

  await db.query(
    'INSERT INTO agents (id, name, instruction, userId) VALUES (?, ?, ?, ?)',
    [newAgent.id, newAgent.name, newAgent.instruction, session.user?.id]
  )

  return NextResponse.json(newAgent)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const body = await req.json()
  const idsToDelete: number[] = body.ids || []

  if (idsToDelete.length === 0) {
    return new NextResponse('No IDs provided', { status: 400 })
  }

  const placeholders = idsToDelete.map(() => '?').join(',')
  await db.query(
    `DELETE FROM agents WHERE id IN (${placeholders}) AND userId = ?`,
    [...idsToDelete, session.user.id]
  )

  return new NextResponse(null, { status: 204 })
}
