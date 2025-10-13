import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
import { pool } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // Read raw body as required by Stripe
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT tokens, name FROM plans WHERE id = ?',
      [planId]
    ) as any[];

    const plan = rows[0];

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    const [planRows] = await pool.query(
      'SELECT id FROM user_plans WHERE user_id = ?',
      [userId]
    ) as any[];

    if (planRows.length > 0) {
      await pool.query(
        'UPDATE user_plans SET plan_id = ? WHERE user_id = ?',
        [planId, userId]
      );
    } else {
      await pool.query(
        'INSERT INTO user_plans (user_id, plan_id) VALUES (?, ?)',
        [userId, planId]
      );
    }

    await pool.query(
      'UPDATE users SET plan = ?, tokens = tokens + ? WHERE id = ?',
      [plan.name, plan.tokens, userId]
    );
  }
  return NextResponse.json({ received: true });
}

// Stripe requires the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
