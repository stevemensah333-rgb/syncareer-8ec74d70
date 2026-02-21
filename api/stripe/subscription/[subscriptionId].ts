import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Verify JWT token from Supabase
 */
async function verifyAuth(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (err) {
    console.error('[Auth Verification] Error:', err);
    return null;
  }
}

/**
 * Cancels a Stripe subscription
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { subscriptionId } = req.query;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!subscriptionId || typeof subscriptionId !== 'string') {
    return res.status(400).json({ error: 'Subscription ID is required' });
  }

  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify subscription belongs to user
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Cancel subscription with Stripe
    const canceledSub = await stripe.subscriptions.del(subscriptionId);

    // Update subscription status in database
    await supabase
      .from('subscriptions')
      .update({
        status: canceledSub.status as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    return res.status(200).json({ subscription: canceledSub });
  } catch (error) {
    console.error('[Cancel Subscription] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
