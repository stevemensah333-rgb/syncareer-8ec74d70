import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePremiumFeature } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  children: ReactNode;
  featureName?: string;
  fallback?: ReactNode;
}

/**
 * FeatureGate component to protect premium features
 * Shows upgrade prompt if user is not premium
 */
export function FeatureGate({ children, featureName = 'This feature', fallback }: FeatureGateProps) {
  const { canAccess, loading } = usePremiumFeature();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-1">{featureName} is a Premium Feature</h3>
            <p className="text-sm text-amber-700 mb-4">
              Upgrade to premium to unlock this powerful feature and accelerate your career growth.
            </p>
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              View Premium Plans
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if a feature should be gated
 * Returns true if feature should be accessible (premium user or free tier)
 */
export function useFeatureGate(tier: 'free' | 'premium' = 'premium'): boolean {
  const { canAccess } = usePremiumFeature();

  if (tier === 'free') return true; // Free features always accessible
  return canAccess;
}

/**
 * Wrap a component to conditionally render based on subscription
 */
export function withPremiumGate<P extends object>(
  Component: React.ComponentType<P>,
  featureName?: string
) {
  return function PremiumGateWrapper(props: P) {
    return (
      <FeatureGate featureName={featureName}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}
