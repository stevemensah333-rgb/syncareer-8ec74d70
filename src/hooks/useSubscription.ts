import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SubscriptionData } from '@/services/subscriptionService';
import { getUserSubscription, isPremiumUser } from '@/services/subscriptionService';

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

      const sub = await getUserSubscription(user.id);
      const premium = await isPremiumUser(user.id);

      setSubscription(sub);
      setIsPremium(premium);
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

    channelRef.current = supabase
      .channel('subscriptions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions' },
        () => fetchSubscription()
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchSubscription]);

  return { subscription, isPremium, loading, error, refetch: fetchSubscription };
}

export function usePremiumFeature() {
  const { isPremium, loading } = useSubscription();
  return { canAccess: isPremium, loading };
}
