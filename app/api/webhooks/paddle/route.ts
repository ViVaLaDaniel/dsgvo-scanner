import { NextRequest, NextResponse } from 'next/server';
import { Paddle, EventName } from '@paddle/paddle-node-sdk';
import { createAdminClient } from '@/lib/supabase/admin';

const paddle = new Paddle(process.env.PADDLE_API_KEY!);

const PLAN_LIMITS: Record<string, { limit: number, plan: string }> = {
  'pri_01kgawpyk6qvsthth775tkv641': { limit: 10, plan: 'starter' },
  'pri_01kgawtfz7k3n9emy2kwn2z292': { limit: 50, plan: 'professional' },
  'pri_01kgawx9m0d9zd3znpw7003abb': { limit: 200, plan: 'business' },
};

export async function POST(req: NextRequest) {
  const signature = req.headers.get('paddle-signature') || '';
  const body = await req.text();

  try {
    const event = await paddle.webhooks.unmarshal(body, process.env.PADDLE_WEBHOOK_SECRET!, signature);
    
    if (!event) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createAdminClient();

    switch (event.eventType) {
      case 'subscription.created':
      case 'subscription.updated': {
        const subscription = event.data as any; // Cast for SDK type flexibility in webhooks
        const userId = subscription.customData?.userId;
        const priceId = subscription.items[0]?.price?.id;
        const status = subscription.status;

        if (userId && priceId && PLAN_LIMITS[priceId]) {
          const { limit, plan } = PLAN_LIMITS[priceId];
          
          await supabase
            .from('user_profiles')
            .update({
              plan: plan,
              website_limit: limit,
              subscription_status: status === 'active' ? 'active' : 'trial',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
        break;
      }
      
      case 'subscription.canceled': {
        const subscription = event.data;
        const userId = subscription.customData?.userId;
        if (userId) {
          await supabase
            .from('user_profiles')
            .update({
              subscription_status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Paddle Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
