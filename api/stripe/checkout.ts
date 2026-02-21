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

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

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
 * Creates a Stripe checkout session
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

    const { customerId, priceId, successUrl } = req.body;

    if (!customerId || !priceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${BASE_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/pricing`,
      metadata: {
        userId,
      },
    });

    // Store checkout session in database
    await supabase.from('checkout_sessions').insert({
      user_id: userId,
      stripe_session_id: session.id,
      stripe_customer_id: customerId,
      price_id: priceId,
      status: 'open',
    });

    return res.status(200).json({ sessionUrl: session.url });
  } catch (error) {
    console.error('[Create Checkout] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
