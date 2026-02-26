import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useAICoachAccess } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import {
  CheckCircle,
  Calendar,
  Sparkles,
  Lock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FREE_AI_COACH_MONTHLY_LIMIT } from '@/lib/featureAccess';
import PaystackButton from '@/components/payment/PaystackButton';

const PREMIUM_FEATURES = [
  'Unlimited AI coach sessions',
  'Interview simulator (Voice mode)',
  'CV builder (all features)',
  'Real-time analytics dashboard',
  'Advanced portfolio analytics',
  'Personalized career recommendations',
  'Priority support',
  'Early access to new features',
];

export default function SubscriptionManager() {
  const { subscription, isPremium, loading, refetch } = useSubscription();
  const { used, limit } = useAICoachAccess();
  const navigate = useNavigate();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const isExpiringSoon = () => {
    if (!subscription?.current_period_end) return false;
    const end = new Date(subscription.current_period_end);
    const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  const daysLeft = () => {
    if (!subscription?.current_period_end) return null;
    const end = new Date(subscription.current_period_end);
    return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
      {/* Current Plan Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Current Plan</h3>
          {isPremium ? (
            <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3" />
              Premium
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">Free</Badge>
          )}
        </div>

        {isPremium ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Premium Plan Active</p>
                <p className="text-sm text-muted-foreground">Full access to all features</p>
              </div>
            </div>

            {subscription && (
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="font-medium capitalize">{subscription.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Renewal Date</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              </div>
            )}

            {isExpiringSoon() && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Your plan expires in {daysLeft()} day{daysLeft() !== 1 ? 's' : ''}. Renew to keep full access.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-muted mt-0.5 flex-shrink-0 border border-border" />
              <div>
                <p className="font-medium">Free Plan</p>
                <p className="text-sm text-muted-foreground">
                  {FREE_AI_COACH_MONTHLY_LIMIT} AI sessions/month · Basic features only
                </p>
              </div>
            </div>

            {/* AI Session Usage */}
            {typeof used === 'number' && typeof limit === 'number' && limit !== Infinity && (
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">AI Sessions this month</span>
                  <span className="font-medium">{used} / {limit}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      used >= limit ? 'bg-destructive' : used >= limit * 0.8 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <PaystackButton
              amount={3000}
              plan="monthly"
              onSuccess={() => { refetch(); toast.success('Premium activated!'); }}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Premium — GH₵30/month
            </PaystackButton>
          </div>
        )}
      </Card>

      {/* Feature comparison */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          {isPremium ? 'Your Included Features' : 'Unlock with Premium'}
        </h4>
        <ul className="space-y-2.5">
          {PREMIUM_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-sm">
              {isPremium
                ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                : <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              }
              <span className={isPremium ? 'text-foreground' : 'text-muted-foreground'}>{feature}</span>
            </li>
          ))}
        </ul>
        {!isPremium && (
          <Button
            onClick={() => navigate('/pricing')}
            className="w-full mt-4"
            variant="outline"
          >
            View Full Pricing Details
          </Button>
        )}
      </Card>
    </div>
  );
}
