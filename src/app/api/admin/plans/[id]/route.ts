import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: any) {
  const { id } =  params;
  const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [id]) as any;
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: Request, { params }: any) {
  const planId =  params.id;

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