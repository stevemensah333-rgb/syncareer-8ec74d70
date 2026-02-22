import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionManager() {
  const { subscription, isPremium, loading } = useSubscription();
  const navigate = useNavigate();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                  <p className="text-sm text-slate-600">Billing Period</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(subscription.current_period_start)} –{' '}
                    {formatDate(subscription.current_period_end)}
                  </p>
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
                  Upgrade to premium to unlock advanced features.
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/pricing')}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Upgrade to Premium
            </Button>
          </div>
        )}
      </Card>

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
