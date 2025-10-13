// import { db } from '@/lib/db';
import {pool }from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: any
) {

    const awaitedparams =  params
    const userId = awaitedparams.id;

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const [rows]:any = await pool.execute(
        `
        SELECT 
            user_plans.id,
            user_plans.user_id,
            user_plans.plan_id,
            user_plans.created_at,
            user_plans.updated_at,
            users.name AS user_name,
            plans.name AS plan_name,
            plans.price AS plan_price
        FROM user_plans
        JOIN users ON users.id = user_plans.user_id
        JOIN plans ON plans.id = user_plans.plan_id
        WHERE user_plans.user_id = ?
        `,
        [userId]
        );

        if (Array.isArray(rows) && rows.length === 0) {
        return NextResponse.json({ error: 'No user plan found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (err) {
        console.error('Error fetching user plan by ID:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
