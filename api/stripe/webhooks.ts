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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Handles Stripe webhooks
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      webhookSecret
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;
      case 'charge.refunded':
        await handleRefund(event);
        break;
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Log webhook event
    await supabase.from('stripe_webhooks').insert({
      event_id: event.id,
      event_type: event.type,
      payload: event.data,
    });

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

/**
 * Handles subscription events (created, updated, deleted)
 */
async function handleSubscriptionEvent(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  const { id: stripeSubscriptionId, customer: stripeCustomerId, items, status } = subscription;

  // Get user from stripe customer
  const { data: customer, error: customerError } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId as string)
    .single();

  if (customerError || !customer) {
    console.error('[Stripe Webhook] Customer not found:', stripeCustomerId);
    return;
  }

  // Determine tier based on price
  const priceId = items.data[0]?.price?.id;
  const tier = priceId?.includes('premium') ? 'premium' : 'free';

  // Calculate period dates
  const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  // Upsert subscription
  const { error: upsertError } = await supabase.from('subscriptions').upsert(
    {
      user_id: customer.user_id,
      stripe_customer_id: stripeCustomerId as string,
      stripe_subscription_id: stripeSubscriptionId,
      status: status as any,
      tier,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      trial_end: trialEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' }
  );

  if (upsertError) {
    throw upsertError;
  }

  console.log(
    `[Stripe Webhook] ${event.type} processed for subscription ${stripeSubscriptionId}`
  );
}

/**
 * Handles payment succeeded event
 */
async function handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  if (!invoice.subscription) {
    return;
  }

  // Update subscription status to active
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription as string);

  if (updateError) {
    throw updateError;
  }

  console.log(`[Stripe Webhook] Payment succeeded for subscription ${invoice.subscription}`);
}

/**
 * Handles payment failed event
 */
async function handlePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  if (!invoice.subscription) {
    return;
  }

  // Update subscription status to past_due
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription as string);

  if (updateError) {
    throw updateError;
  }

  console.log(`[Stripe Webhook] Payment failed for subscription ${invoice.subscription}`);
}

/**
 * Handles refund event
 */
async function handleRefund(event: Stripe.Event): Promise<void> {
  const charge = event.data.object as Stripe.Charge;

  console.log(
    `[Stripe Webhook] Refund processed for charge ${charge.id}, amount: ${charge.amount / 100}`
  );
}
