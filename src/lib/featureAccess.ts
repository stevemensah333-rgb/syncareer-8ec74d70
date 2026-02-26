import { supabase } from '@/integrations/supabase/client';

// ─── Feature Keys ──────────────────────────────────────────────────────────
export type FeatureKey =
  | 'ai_coach_basic'
  | 'ai_coach_unlimited'
  | 'interview_basic'
  | 'interview_advanced'
  | 'cv_basic'
  | 'cv_advanced'
  | 'analytics_monthly'
  | 'analytics_realtime'
  | 'portfolio_basic'
  | 'portfolio_advanced';

// Which features require Premium
const PREMIUM_FEATURES: FeatureKey[] = [
  'ai_coach_unlimited',
  'interview_advanced',
  'cv_advanced',
  'analytics_realtime',
  'portfolio_advanced',
];

// Free-tier AI coach monthly session cap
export const FREE_AI_COACH_MONTHLY_LIMIT = 5;

// ─── Centralized Access Check ─────────────────────────────────────────────
export function isPremiumFeature(key: FeatureKey): boolean {
  return PREMIUM_FEATURES.includes(key);
}

export function hasAccess(featureKey: FeatureKey, isPremium: boolean): boolean {
  if (!isPremiumFeature(featureKey)) return true; // free features always open
  return isPremium;
}

// ─── AI Session Tracking ──────────────────────────────────────────────────
export async function getAICoachUsageThisMonth(userId: string): Promise<number> {
  const month = getCurrentMonth();
  const { data } = await supabase
    .from('usage_logs')
    .select('usage_count')
    .eq('user_id', userId)
    .eq('feature_key', 'ai_coach_session')
    .eq('month', month)
    .single();
  return data?.usage_count ?? 0;
}

export async function incrementAICoachUsage(userId: string): Promise<number> {
  const month = getCurrentMonth();
  const { data } = await supabase
    .from('usage_logs')
    .upsert(
      { user_id: userId, feature_key: 'ai_coach_session', month, usage_count: 1 },
      { onConflict: 'user_id,feature_key,month' }
    )
    .select('usage_count')
    .single();

  // If upsert was an insert, count is 1. Otherwise increment via update.
  const existing = await getAICoachUsageThisMonth(userId);
  if (existing > 0) {
    const { data: updated } = await supabase
      .from('usage_logs')
      .update({ usage_count: existing + 1 })
      .eq('user_id', userId)
      .eq('feature_key', 'ai_coach_session')
      .eq('month', month)
      .select('usage_count')
      .single();
    return updated?.usage_count ?? existing + 1;
  }
  return data?.usage_count ?? 1;
}

export async function canUseAICoach(userId: string, isPremium: boolean): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (isPremium) return { allowed: true, used: 0, limit: Infinity };
  const used = await getAICoachUsageThisMonth(userId);
  return {
    allowed: used < FREE_AI_COACH_MONTHLY_LIMIT,
    used,
    limit: FREE_AI_COACH_MONTHLY_LIMIT,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Human-readable labels
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  ai_coach_basic: 'AI Coach (Basic)',
  ai_coach_unlimited: 'AI Coach (Unlimited)',
  interview_basic: 'Interview Simulator (Basic)',
  interview_advanced: 'Interview Simulator (Advanced)',
  cv_basic: 'CV Builder (Essential)',
  cv_advanced: 'CV Builder (All Features)',
  analytics_monthly: 'Monthly Analytics',
  analytics_realtime: 'Real-Time Analytics',
  portfolio_basic: 'Portfolio (Basic)',
  portfolio_advanced: 'Portfolio Analytics',
};

export const FEATURE_UPGRADE_BENEFITS: Record<FeatureKey, string[]> = {
  ai_coach_unlimited: [
    'Unlimited AI coaching sessions per month',
    'Priority response quality',
    'Personalized career roadmaps',
  ],
  interview_advanced: [
    'Voice interview mode',
    'Industry-specific question banks',
    'Detailed scoring and feedback',
  ],
  cv_advanced: [
    'AI-powered CV optimization',
    'ATS score analysis',
    'Multiple template formats',
  ],
  analytics_realtime: [
    'Live performance dashboard',
    'Skill gap trends',
    'Application funnel tracking',
  ],
  portfolio_advanced: [
    'Advanced portfolio analytics',
    'Engagement and view tracking',
    'AI-generated portfolio summary',
  ],
  // free features — no upgrade needed
  ai_coach_basic: [],
  interview_basic: [],
  cv_basic: [],
  analytics_monthly: [],
  portfolio_basic: [],
};
