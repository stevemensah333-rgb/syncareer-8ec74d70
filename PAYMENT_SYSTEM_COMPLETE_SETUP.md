# Payment System - Complete Setup Guide

## Status: ✅ Ready for Deployment

Your monetization system has been fully implemented with the following components:

---

## 1. ✅ Database Schema Created
**File**: `supabase/migrations/20260221_monetization_system.sql`

The migration includes:
- `subscriptions` table - Track active subscriptions with status and pricing
- `subscription_events` table - Audit log for all subscription changes
- `stripe_customers` table - Mapping between Supabase users and Stripe customers
- `checkout_sessions` table - Track checkout sessions for fraud prevention
- Row-Level Security (RLS) policies - Ensure users only see their own data

**To apply the migration locally:**
```bash
supabase db push
```

---

## 2. ✅ Stripe Configuration Complete
**Environment Variables Set:**
- `STRIPE_SECRET_KEY` ✓
- `STRIPE_WEBHOOK_SECRET` ✓
- `VITE_STRIPE_PRICE_MONTHLY` ✓
- `VITE_STRIPE_PRICE_YEARLY` ✓

**API Endpoints Available:**
- `POST /api/stripe/customer` - Create/retrieve Stripe customer
- `POST /api/stripe/checkout` - Create checkout session
- `DELETE /api/stripe/subscription/[id]` - Cancel subscription
- `POST /api/stripe/webhooks` - Receive Stripe events
- `GET /api/stripe/verify-session` - Verify checkout completion

---

## 3. ✅ UI Integration Complete
**Navigation Updates:**
- Added "Pricing" button to navbar (visible to all users)
- Added "Subscription" link in user dropdown menu
- Added "Subscription & Billing" tab in Settings page

**New Pages:**
- `/pricing` - Pricing page with monthly/yearly toggle and feature comparison
- `/subscription-success` - Success page after checkout completion

**Components:**
- `SubscriptionManager.tsx` - Manage subscriptions in settings
- `FeatureGate.tsx` - Protect premium features
- `PricingCard.tsx` - Individual pricing plan display

---

## 4. ✅ React Hooks & Services
**Available Hooks:**
- `useSubscription()` - Get real-time subscription data
- `usePremiumFeature()` - Check if feature is available for user

**Services:**
- `subscriptionService.ts` - Core business logic
- `stripeWebhookService.ts` - Process Stripe webhooks

---

## Next Steps: Setup Stripe Webhook

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/webhooks

2. **Add Endpoint:**
   - URL: `https://your-vercel-domain.com/api/stripe/webhooks`
   - Replace `your-vercel-domain` with your actual Vercel deployment URL

3. **Subscribe to Events:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Copy Webhook Signing Secret:**
   - After creating endpoint, Stripe will show the signing secret
   - Update environment variable: `STRIPE_WEBHOOK_SECRET`

---

## Testing Checklist

- [ ] Database migration applied (`supabase db push`)
- [ ] Environment variables configured in Vercel
- [ ] Pricing page loads at `/pricing`
- [ ] Pricing button visible in navbar
- [ ] "Subscribe" button on pricing card opens Stripe checkout
- [ ] After payment, redirected to `/subscription-success`
- [ ] Subscription status visible in Settings > Subscription & Billing
- [ ] Premium features show upgrade prompt for non-subscribers
- [ ] Stripe webhook endpoint configured and receiving events

---

## Pricing Plans

**Free Tier (Default)**
- Limited actions
- Basic analytics
- No AI coaching
- No advanced features

**Premium Tier ($4.99/month or $49.99/year)**
- Unlimited actions
- Advanced analytics
- AI coaching with interview simulation
- Early access to new features
- Priority support

---

## Important Notes

1. **Webhook Testing**: Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   stripe trigger payment_intent.succeeded
   ```

2. **Price IDs**: Ensure `VITE_STRIPE_PRICE_MONTHLY` and `VITE_STRIPE_PRICE_YEARLY` match your Stripe product's price IDs

3. **RLS Security**: All subscription queries are protected by RLS policies - users can only access their own data

4. **Idempotency**: Webhook handler prevents duplicate processing of events

5. **Error Handling**: All endpoints return proper HTTP status codes and error messages

---

## Support

For issues or questions, refer to:
- `MONETIZATION_IMPLEMENTATION.md` - Detailed technical documentation
- Stripe Dashboard - Check webhook logs
- Application logs - Monitor API endpoint execution

---

## Deployment Checklist

Before going live:
- [ ] All environment variables set in Vercel
- [ ] Database migration applied
- [ ] Stripe webhook configured with production endpoint
- [ ] Test payment processed successfully
- [ ] Subscription status updates in real-time
- [ ] Premium features correctly gated
- [ ] Error handling tested (failed payments, canceled subscriptions)
