import { supabase } from '@/integrations/supabase/client';

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  created_at: string;
}

/**
 * Handles Stripe webhook events
 * This would typically be called from a Vercel Function or backend
 */
export async function handleStripeWebhook(event: any): Promise<void> {
  const { type, data } = event;

  try {
    switch (type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(data);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(data);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(data);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(data);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(data);
        break;
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${type}`);
    }

    // Log webhook event
    await logWebhookEvent(event.id, type, data);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling webhook:', error);
    throw error;
  }
}

/**
 * Handles subscription created event
 */
async function handleSubscriptionCreated(data: any): Promise<void> {
  const { id: stripeSubscriptionId, customer: stripeCustomerId, items, status } = data;

  try {
    // Get user from stripe customer
    const { data: customer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer not found');
    }

    // Determine tier based on price
    const priceId = items.data[0]?.price?.id;
    const tier = priceId?.includes('premium') ? 'premium' : 'free';

    // Calculate period dates
    const currentPeriodStart = new Date(data.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(data.current_period_end * 1000).toISOString();
    const trialEnd = data.trial_end ? new Date(data.trial_end * 1000).toISOString() : null;

    // Create or update subscription
    const { error: upsertError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: customer.user_id,
          stripe_customer_id: stripeCustomerId,
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

    console.log(`[Stripe Webhook] Subscription created for user ${customer.user_id}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling subscription created:', error);
    throw error;
  }
}

/**
 * Handles subscription updated event
 */
async function handleSubscriptionUpdated(data: any): Promise<void> {
  const { id: stripeSubscriptionId, customer: stripeCustomerId, items, status } = data;

  try {
    // Get user from stripe customer
    const { data: customer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer not found');
    }

    // Determine tier based on price
    const priceId = items.data[0]?.price?.id;
    const tier = priceId?.includes('premium') ? 'premium' : 'free';

    // Calculate period dates
    const currentPeriodStart = new Date(data.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(data.current_period_end * 1000).toISOString();
    const trialEnd = data.trial_end ? new Date(data.trial_end * 1000).toISOString() : null;

    // Update subscription
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: status as any,
        tier,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        trial_end: trialEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (updateError) {
      throw updateError;
    }

    console.log(`[Stripe Webhook] Subscription updated for user ${customer.user_id}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling subscription updated:', error);
    throw error;
  }
}

/**
 * Handles subscription canceled event
 */
async function handleSubscriptionCanceled(data: any): Promise<void> {
  const { id: stripeSubscriptionId, customer: stripeCustomerId } = data;

  try {
    // Get user from stripe customer
    const { data: customer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer not found');
    }

    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (updateError) {
      throw updateError;
    }

    console.log(`[Stripe Webhook] Subscription canceled for user ${customer.user_id}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling subscription canceled:', error);
    throw error;
  }
}

/**
 * Handles payment succeeded event
 */
async function handlePaymentSucceeded(data: any): Promise<void> {
  const { customer: stripeCustomerId, subscription: stripeSubscriptionId } = data;

  try {
    if (!stripeSubscriptionId) {
      console.log('[Stripe Webhook] Payment succeeded but no subscription attached');
      return;
    }

    // Update subscription status to active
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (updateError) {
      throw updateError;
    }

    console.log(`[Stripe Webhook] Payment succeeded for subscription ${stripeSubscriptionId}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling payment succeeded:', error);
    throw error;
  }
}

/**
 * Handles payment failed event
 */
async function handlePaymentFailed(data: any): Promise<void> {
  const { customer: stripeCustomerId, subscription: stripeSubscriptionId } = data;

  try {
    if (!stripeSubscriptionId) {
      console.log('[Stripe Webhook] Payment failed but no subscription attached');
      return;
    }

    // Update subscription status to past_due
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (updateError) {
      throw updateError;
    }

    console.log(`[Stripe Webhook] Payment failed for subscription ${stripeSubscriptionId}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling payment failed:', error);
    throw error;
  }
}

/**
 * Logs webhook event to database
 */
async function logWebhookEvent(eventId: string, type: string, data: any): Promise<void> {
  try {
    await supabase
      .from('stripe_webhooks')
      .insert({
        event_id: eventId,
        event_type: type,
        payload: data,
      });
  } catch (error) {
    console.error('[Stripe Webhook] Error logging webhook:', error);
  }
}
