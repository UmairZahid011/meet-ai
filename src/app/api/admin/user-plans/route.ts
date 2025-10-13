import { NextResponse } from 'next/server';
// import { db } from '@/lib/db';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        user_plans.id,
        user_plans.user_id,
        user_plans.plan_id,
        user_plans.created_at,
        user_plans.updated_at,
        users.name AS user_name,
        plans.name AS plan_name
      FROM user_plans
      JOIN users ON users.id = user_plans.user_id
      JOIN plans ON plans.id = user_plans.plan_id
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error('Error fetching user plans:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
