import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  try {
    // Step 1: Get user's plan ID
    const [userPlanRows] = await db.query(
      'SELECT plan_id FROM user_plans WHERE user_id = ?',
      [session.user.id]
    ) as [any[], any];

    const planId = userPlanRows[0]?.plan_id;
    if (!planId) {
      return new NextResponse('User does not have a plan', { status: 404 });
    }

    // Step 2: Get meeting_cost and agent_cost from plans table
    const [planRows] = await db.query(
      'SELECT meeting_cost, agent_cost FROM plans WHERE id = ?',
      [planId]
    ) as [any[], any];

    const plan = planRows[0];
    if (!plan) {
      return new NextResponse('Plan not found', { status: 404 });
    }

    // Step 3: Get user tokens
    const [userRows] = await db.query(
      'SELECT tokens FROM users WHERE id = ?',
      [session.user.id]
    ) as [any[], any];

    const user = userRows[0];
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json({
      meeting_cost: plan.meeting_cost,
      agent_cost: plan.agent_cost,
      tokens: user.tokens,
    });

  } catch (error) {
    console.error('Error fetching cost and token info:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
