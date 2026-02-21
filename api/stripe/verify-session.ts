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
 * Verifies a Stripe checkout session and activates subscription
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Update checkout session status
    const { error: updateError } = await supabase
      .from('checkout_sessions')
      .update({
        status: 'completed',
      })
      .eq('stripe_session_id', sessionId);

    if (updateError) {
      console.error('Error updating checkout session:', updateError);
    }

    // Subscription should already be created by webhook, but verify it
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', session.subscription as string)
      .eq('user_id', userId)
      .single();

    return res.status(200).json({
      success: true,
      subscription,
      message: 'Subscription verified successfully',
    });
  } catch (error) {
    console.error('[Verify Session] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
