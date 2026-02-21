import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SubscriptionData } from '@/services/subscriptionService';
import { getUserSubscription, isPremiumUser } from '@/services/subscriptionService';

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000;

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;
      const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setError(null);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setSubscription(null);
        setIsPremium(false);
        setLoading(false);
        return;
      }

      const data = await fetchWithRetry(async () => {
        const sub = await getUserSubscription(user.id);
        const premium = await isPremiumUser(user.id);
        return { subscription: sub, isPremium: premium };
      });

      setSubscription(data.subscription);
      setIsPremium(data.isPremium);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load subscription';
      console.error('[useSubscription] Fetch error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();

    // Set up realtime subscription changes
    channelRef.current = supabase
      .channel('subscriptions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchSubscription]);

  return {
    subscription,
    isPremium,
    loading,
    error,
    refetch: fetchSubscription,
  };
}

/**
 * Hook to check if user can access a premium feature
 * Returns true if user has active premium subscription
 */
export function usePremiumFeature() {
  const { isPremium, loading } = useSubscription();

  return {
    canAccess: isPremium,
    loading,
  };
}
