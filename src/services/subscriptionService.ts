import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionData {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  tier: 'free' | 'premium';
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface StripeCustomer {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  email: string;
  created_at: string;
}

/**
 * Fetches the current user's subscription status
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionData | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('[Subscription Service] Error fetching subscription:', error);
    return null;
  }
}

/**
 * Checks if user has an active premium subscription
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  // Check if subscription is active or trialing
  if (!['active', 'trialing'].includes(subscription.status)) {
    return false;
  }

  // Check if subscription is not expired
  if (subscription.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    if (endDate < new Date()) {
      return false;
    }
  }

  return subscription.tier === 'premium';
}

/**
 * Gets or creates a Stripe customer for the user
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<StripeCustomer | null> {
  try {
    // First check if customer exists
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('stripe_customers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingCustomer) {
      return existingCustomer;
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Get user email for Stripe customer creation
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) {
      throw new Error('Unable to get user email');
    }

    // Call API to create Stripe customer
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ userId, email: user.email }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Stripe customer');
    }

    const { customer } = await response.json();

    // Save to database
    const { data: newCustomer, error: saveError } = await supabase
      .from('stripe_customers')
      .insert({
        user_id: userId,
        stripe_customer_id: customer.id,
        email: user.email,
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    return newCustomer;
  } catch (error) {
    console.error('[Subscription Service] Error creating Stripe customer:', error);
    return null;
  }
}

/**
 * Creates a checkout session for the user
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string
): Promise<string | null> {
  try {
    const customer = await getOrCreateStripeCustomer(userId);
    if (!customer) {
      throw new Error('Failed to get or create Stripe customer');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        userId,
        customerId: customer.stripe_customer_id,
        priceId,
        successUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionUrl } = await response.json();
    return sessionUrl;
  } catch (error) {
    console.error('[Subscription Service] Error creating checkout session:', error);
    return null;
  }
}

/**
 * Cancels a user's subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription?.stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/stripe/subscription/${subscription.stripe_subscription_id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    // Update local subscription status
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('id', subscription.id);

    return true;
  } catch (error) {
    console.error('[Subscription Service] Error canceling subscription:', error);
    return false;
  }
}
