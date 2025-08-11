import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const [plans] = await db.query('SELECT * FROM plans');
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, price, description, tokens, agentCost, meetingCost } = body;

  await db.query(
    'INSERT INTO plans (name, price, description, tokens, agent_cost, meeting_cost) VALUES (?, ?, ?, ?, ?, ?)',
    [name, price, description, tokens, agentCost, meetingCost]
  );

  return NextResponse.json({ message: 'Plan created' });
}

export async function PATCH(req: Request, { params }: any) {
  const planId = params.id;

  if (!planId) {
    return NextResponse.json({ error: 'planId is required' }, { status: 400 });
  }

  const body = await req.json();
  const { name, price, description, tokens, agentCost, meetingCost } = body;

  await db.query(
    `UPDATE plans 
     SET name = ?, price = ?, description = ?, tokens = ?, agent_cost = ?, meeting_cost = ? 
     WHERE id = ?`,
    [name, price, description, tokens, agentCost, meetingCost, planId]
  );

  return NextResponse.json({ message: 'Plan updated' });
}
// DELETE: Delete a plan by ID (expects planId in query)
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get('planId');

  if (!planId) {
    return NextResponse.json({ error: 'planId is required' }, { status: 400 });
  }

  await db.query('DELETE FROM plans WHERE id = ?', [planId]);

  return NextResponse.json({ message: 'Plan deleted' });
}
