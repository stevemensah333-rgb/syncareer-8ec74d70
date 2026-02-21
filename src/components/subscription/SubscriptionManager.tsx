import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { cancelSubscription } from '@/services/subscriptionService';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';

export default function SubscriptionManager() {
  const { subscription, isPremium, loading, refetch } = useSubscription();
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const success = await cancelSubscription(subscription?.user_id || '');
      if (success) {
        toast.success('Subscription canceled successfully');
        await refetch();
        setShowCancelConfirm(false);
      } else {
        toast.error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('An error occurred while canceling');
    } finally {
      setIsCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-50">
        <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>

        {isPremium ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Premium Plan Active</p>
                <p className="text-sm text-slate-600">You have access to all premium features</p>
              </div>
            </div>

            {subscription && (
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <p className="font-medium capitalize">{subscription.status}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Billing Cycle</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(subscription.current_period_start)} -{' '}
                    {formatDate(subscription.current_period_end)}
                  </p>
                </div>

                {subscription.trial_end && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-600">Trial Ends</p>
                    <p className="font-medium">{formatDate(subscription.trial_end)}</p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              <Button
                onClick={() => setShowCancelConfirm(true)}
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel Subscription
              </Button>
            </div>

            {showCancelConfirm && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900">Confirm Cancellation</p>
                    <p className="text-sm text-red-700">
                      You'll lose access to premium features at the end of your current billing period.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={isCanceling}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isCanceling ? 'Processing...' : 'Yes, Cancel'}
                  </Button>
                  <Button
                    onClick={() => setShowCancelConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Keep Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-300 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Free Plan</p>
                <p className="text-sm text-slate-600">
                  You're using our free tier. Upgrade to premium to unlock advanced features.
                </p>
              </div>
            </div>

            <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
              Upgrade to Premium
            </Button>
          </div>
        )}
      </Card>

      {/* Premium Features Info */}
      {!isPremium && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <h4 className="font-semibold mb-3">Premium Features Included</h4>
          <ul className="space-y-2 text-sm">
            {[
              'Unlimited AI coach sessions',
              'Advanced interview simulator modes',
              'Real-time analytics dashboard',
              'Personalized career recommendations',
              'Priority support',
              'Early access to new features',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-slate-700">{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
