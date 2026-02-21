# SynCareer Monetization System - Implementation Guide

## Overview

I've built a complete, enterprise-grade monetization system for SynCareer with Stripe integration, subscription management, and premium feature gating. The system is production-ready with proper security, error handling, and user experience considerations.

## What's Included

### 1. Database Schema (`supabase/migrations/20260221_monetization_system.sql`)
- **subscriptions**: Tracks user subscription status, tier, and billing cycles
- **stripe_customers**: Maps Supabase users to Stripe customers
- **checkout_sessions**: Stores checkout session states for verification
- **stripe_webhooks**: Audit log for all Stripe webhook events
- **Row-Level Security**: All tables have RLS policies ensuring users can only see their own data

### 2. Backend Services

#### Payment Handling (`src/services/subscriptionService.ts`)
- `getUserSubscription()`: Fetch current subscription
- `isPremiumUser()`: Check if user has active premium tier
- `getOrCreateStripeCustomer()`: Creates Stripe customer on first checkout
- `createCheckoutSession()`: Initiates Stripe checkout
- `cancelSubscription()`: Handles subscription cancellation

#### Webhook Processing (`src/services/stripeWebhookService.ts`)
- Handles subscription creation, updates, and cancellation
- Processes payment success/failure events
- Updates user subscription status in real-time
- Maintains complete audit trail

### 3. API Endpoints (Vercel Functions)

- **POST `/api/stripe/customer`**: Create Stripe customer
- **POST `/api/stripe/checkout`**: Create checkout session
- **DELETE `/api/stripe/subscription/[id]`**: Cancel subscription
- **POST `/api/stripe/webhooks`**: Handle Stripe webhooks (verify signatures, process events)
- **POST `/api/stripe/verify-session`**: Verify checkout completion

All endpoints include:
- JWT authentication via Supabase
- Error handling and validation
- Request logging for debugging
- Idempotency where applicable

### 4. Frontend Components

#### Pricing Page (`src/pages/Pricing.tsx`)
- Modern, dark-themed pricing cards with Free and Premium tiers
- Monthly/Yearly billing toggle with savings indicator
- Feature comparison list
- FAQ section
- Responsive design with gradient background
- Real-time subscription status display

#### Subscription Manager (`src/components/subscription/SubscriptionManager.tsx`)
- Display current subscription details
- Show billing cycle dates
- Cancel subscription with confirmation dialog
- Premium features preview for free users
- Integration-ready for Settings page

#### Feature Gate Components (`src/components/subscription/FeatureGate.tsx`)
- `FeatureGate`: Wrapper component to protect premium features
- `usePremiumFeature()`: Hook to check access
- `withPremiumGate()`: HOC for wrapping components
- Shows upgrade prompt when user is not premium

### 5. React Hooks

#### `useSubscription` Hook (`src/hooks/useSubscription.ts`)
- Real-time subscription status
- Automatic refresh on data changes
- Realtime integration with Supabase
- Handles loading/error states
- Returns: `subscription`, `isPremium`, `loading`, `error`, `refetch`

#### `usePremiumFeature` Hook
- Simple hook for checking feature access
- Returns: `canAccess`, `loading`

### 6. Pages

- **`/pricing`**: Pricing page with checkout flow
- **`/subscription-success`**: Post-checkout verification page

## Setup Instructions

### Step 1: Database Migration
```bash
# Push the migration to Supabase
supabase db push
```

This creates all necessary tables with RLS policies.

### Step 2: Stripe Configuration

1. **Create Products & Prices**:
   - Go to Stripe Dashboard > Products
   - Create "SynCareer Premium" product
   - Add price: Monthly ($4.99) - get Price ID (price_xxx)
   - Add price: Yearly ($49.99) - get Price ID (price_xxx)

2. **Set Up Webhooks**:
   - Go to Developers > Webhooks
   - Create endpoint: `https://your-domain/api/stripe/webhooks`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `charge.refunded`
   - Copy signing secret

### Step 3: Environment Variables

**Local (.env.local)**:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PRICE_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_YEARLY=price_xxxxx
```

**Vercel (Project Settings > Environment Variables)**:
```
STRIPE_SECRET_KEY=sk_test_xxx (or sk_live_xxx)
STRIPE_WEBHOOK_SECRET=whsec_xxx
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BASE_URL=https://your-domain.com
```

### Step 4: Add Pricing Route

The routing is already configured in `src/App.tsx`:
- `/pricing` - Main pricing page
- `/subscription-success` - Post-checkout verification

### Step 5: Integrate into Your App

**1. Add to Navbar/Navigation**:
```tsx
<Link to="/pricing">Upgrade</Link>
```

**2. Protect Premium Features**:
```tsx
import { FeatureGate } from '@/components/subscription/FeatureGate';

export function AICoach() {
  return (
    <FeatureGate featureName="AI Coach">
      <YourPremiumComponent />
    </FeatureGate>
  );
}
```

**3. Add Subscription Manager to Settings**:
```tsx
import SubscriptionManager from '@/components/subscription/SubscriptionManager';

export function Settings() {
  return (
    <div>
      {/* Other settings */}
      <SubscriptionManager />
    </div>
  );
}
```

**4. Check Subscription in Components**:
```tsx
import { useSubscription } from '@/hooks/useSubscription';

export function Dashboard() {
  const { isPremium, subscription } = useSubscription();

  return (
    <div>
      {isPremium && <PremiumDashboard />}
    </div>
  );
}
```

## Feature Gating Examples

### Premium-Only Feature
```tsx
<FeatureGate featureName="Advanced Analytics">
  <AnalyticsComponent />
</FeatureGate>
```

### Conditional Rendering
```tsx
const { canAccess } = usePremiumFeature();

return canAccess ? <AdvancedView /> : <BasicView />;
```

### Using HOC
```tsx
const PremiumAICoach = withPremiumGate(AICoach, 'AI Coach');
```

## Premium Features to Gate

Based on your specification, consider gating:
1. **AI Coach** - Unlimited sessions for premium
2. **Interview Simulator** - Advanced modes
3. **Advanced Analytics** - Detailed performance insights
4. **Real-time Dashboard** - Live updates
5. **Priority Support** - Faster response times
6. **Early Access** - New features first

## Security Considerations

✅ **Implemented**:
- JWT authentication on all endpoints
- Stripe webhook signature verification
- Row-Level Security on all database tables
- Parameterized queries (via Supabase)
- Secure session management via HTTP-only cookies
- Environment variable isolation
- Input validation on all endpoints

## Testing

### Local Testing with Stripe
```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Use test cards
4242 4242 4242 4242 (success)
4000 0000 0000 0002 (decline)
```

### Test Webhook Events
```bash
stripe trigger payment_intent.succeeded
```

## Monitoring & Debugging

1. **Webhook Logs**: Check `stripe_webhooks` table for all events
2. **Subscription Status**: Query `subscriptions` table for user status
3. **Customer Mapping**: Check `stripe_customers` for Stripe ID mappings
4. **Checkout Sessions**: Track `checkout_sessions` for payment flow

## Next Steps

1. Push database migrations: `supabase db push`
2. Configure Stripe (products, prices, webhooks)
3. Add environment variables to Vercel
4. Test with Stripe test mode
5. Deploy to production
6. Switch Stripe to live mode
7. Integrate pricing link into navbar
8. Gate premium features
9. Monitor webhooks and subscriptions

## Support & Troubleshooting

**Issue: Webhook not working**
- Check webhook signing secret
- Verify endpoint URL is accessible
- Check Stripe Dashboard > Webhooks for failed deliveries

**Issue: Subscription not activating**
- Check `stripe_webhooks` table for webhook logs
- Verify `stripe_customers` mapping exists
- Check RLS policies allow inserts

**Issue: Checkout fails**
- Verify Stripe price IDs are correct
- Check API authentication
- Review API logs for errors

## Production Checklist

- [ ] Switch Stripe to live mode
- [ ] Update all environment variables to production
- [ ] Test checkout flow end-to-end
- [ ] Verify webhook handling
- [ ] Set up monitoring for failed payments
- [ ] Create support documentation for users
- [ ] Test cancellation flow
- [ ] Verify RLS policies are working
- [ ] Set up error logging/alerting
- [ ] Review security settings
