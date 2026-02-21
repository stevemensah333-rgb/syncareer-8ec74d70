import { supabase } from '@/integrations/supabase/client';

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  created_at: string;
}

// These Stripe tables (stripe_customers, subscriptions, stripe_webhooks) are not yet
// created in the database. This service is a placeholder for future Stripe integration.
// Using `as any` to bypass type checking until the tables are created via migration.

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

    await logWebhookEvent(event.id, type, data);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling webhook:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(data: any): Promise<void> {
  const { id: stripeSubscriptionId, customer: stripeCustomerId, items, status } = data;

  try {
    const { data: customer, error: customerError } = await (supabase as any)
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer not found');
    }

    const priceId = items.data[0]?.price?.id;
    const tier = priceId?.includes('premium') ? 'premium' : 'free';
    const currentPeriodStart = new Date(data.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(data.current_period_end * 1000).toISOString();
    const trialEnd = data.trial_end ? new Date(data.trial_end * 1000).toISOString() : null;

    const { error: upsertError } = await (supabase as any)
      .from('subscriptions')
      .upsert(
        {
          user_id: customer.user_id,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          status,
          tier,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          trial_end: trialEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'stripe_subscription_id' }
      );

    if (upsertError) throw upsertError;
    console.log(`[Stripe Webhook] Subscription created for user ${customer.user_id}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(data: any): Promise<void> {
  const { id: stripeSubscriptionId, customer: stripeCustomerId, items, status } = data;

  try {
    const { data: customer, error: customerError } = await (supabase as any)
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer not found');
    }

    const priceId = items.data[0]?.price?.id;
    const tier = priceId?.includes('premium') ? 'premium' : 'free';
    const currentPeriodStart = new Date(data.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(data.current_period_end * 1000).toISOString();
    const trialEnd = data.trial_end ? new Date(data.trial_end * 1000).toISOString() : null;

    const { error: updateError } = await (supabase as any)
      .from('subscriptions')
      .update({
        status,
        tier,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        trial_end: trialEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (updateError) throw updateError;
    console.log(`[Stripe Webhook] Subscription updated for user ${customer.user_id}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionCanceled(data: any): Promise<void> {
  const { id: stripeSubscriptionId, customer: stripeCustomerId } = data;

  try {
    const { data: customer, error: customerError } = await (supabase as any)
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer not found');
    }

    const { error: updateError } = await (supabase as any)
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (updateError) throw updateError;
    console.log(`[Stripe Webhook] Subscription canceled for user ${customer.user_id}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling subscription canceled:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(data: any): Promise<void> {
  const { subscription: stripeSubscriptionId } = data;

  try {
    if (!stripeSubscriptionId) {
      console.log('[Stripe Webhook] Payment succeeded but no subscription attached');
      return;
    }

    const { error: updateError } = await (supabase as any)
      .from('subscriptions')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (updateError) throw updateError;
    console.log(`[Stripe Webhook] Payment succeeded for subscription ${stripeSubscriptionId}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling payment succeeded:', error);
    throw error;
  }
}

async function handlePaymentFailed(data: any): Promise<void> {
  const { subscription: stripeSubscriptionId } = data;

  try {
    if (!stripeSubscriptionId) {
      console.log('[Stripe Webhook] Payment failed but no subscription attached');
      return;
    }

    const { error: updateError } = await (supabase as any)
      .from('subscriptions')
      .update({ status: 'past_due', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (updateError) throw updateError;
    console.log(`[Stripe Webhook] Payment failed for subscription ${stripeSubscriptionId}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling payment failed:', error);
    throw error;
  }
}

async function logWebhookEvent(eventId: string, type: string, data: any): Promise<void> {
  try {
    await (supabase as any)
      .from('stripe_webhooks')
      .insert({ event_id: eventId, event_type: type, payload: data });
  } catch (error) {
    console.error('[Stripe Webhook] Error logging webhook:', error);
  }
}
