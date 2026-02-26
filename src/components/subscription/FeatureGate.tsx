import { ReactNode } from 'react';
import { Sparkles, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFeatureAccess } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import {
  FEATURE_LABELS,
  FEATURE_UPGRADE_BENEFITS,
  type FeatureKey,
} from '@/lib/featureAccess';

interface FeatureGateProps {
  featureKey: FeatureKey;
  children: ReactNode;
  /** Show a subtle inline lock instead of a full card */
  inline?: boolean;
}

export function FeatureGate({ featureKey, children, inline = false }: FeatureGateProps) {
  const { allowed, loading } = useFeatureAccess(featureKey);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (allowed) return <>{children}</>;

  const label = FEATURE_LABELS[featureKey];
  const benefits = FEATURE_UPGRADE_BENEFITS[featureKey];

  if (inline) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none opacity-40 blur-[2px]">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm rounded-lg">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <Button size="sm" onClick={() => navigate('/pricing')}>
            Unlock with Premium
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{label}</h3>
            <Badge variant="outline" className="text-xs border-primary/40 text-primary">
              Premium
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This feature is available on the Premium plan. Upgrade to unlock it and accelerate your career.
          </p>
          {benefits.length > 0 && (
            <ul className="space-y-1 mb-4">
              {benefits.map((b) => (
                <li key={b} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
          <Button onClick={() => navigate('/pricing')} size="sm">
            Upgrade to Premium — GH₵30/mo
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Legacy: checks only isPremium (no feature key). Kept for backward compat. */
export function useFeatureGate(tier: 'free' | 'premium' = 'premium'): boolean {
  const { allowed } = useFeatureAccess(
    tier === 'premium' ? 'ai_coach_unlimited' : 'ai_coach_basic'
  );
  if (tier === 'free') return true;
  return allowed;
}

export function withPremiumGate<P extends object>(
  Component: React.ComponentType<P>,
  featureKey: FeatureKey = 'ai_coach_unlimited'
) {
  return function PremiumGateWrapper(props: P) {
    return (
      <FeatureGate featureKey={featureKey}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}
