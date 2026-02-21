# Monetization System Environment Variables

Add these environment variables to your Vercel project and local `.env.local` file:

## Client-Side Variables (Vite)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_API_URL=http://localhost:3000 (or your deployed API URL)
VITE_STRIPE_PRICE_MONTHLY=price_xxxxx (Stripe price ID for monthly plan)
VITE_STRIPE_PRICE_YEARLY=price_xxxxx (Stripe price ID for yearly plan)
```

## Server-Side Variables (Vercel Functions)
```
STRIPE_SECRET_KEY=sk_test_xxxx or sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx (from Stripe Dashboard > Webhooks)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key (for admin operations)
BASE_URL=https://your-domain.com (for production)
```

## Setting Up Stripe

1. Go to https://dashboard.stripe.com/
2. Create a Premium price in Products:
   - Product Name: SynCareer Premium
   - Price: Create both monthly ($4.99) and yearly ($49.99)
   - Copy the Price IDs to your environment variables
3. Set up webhooks:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain/api/stripe/webhooks`
   - Select events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed, charge.refunded
   - Copy the signing secret to STRIPE_WEBHOOK_SECRET

## Database Migration

Run this command in your project to apply the monetization schema:
```bash
supabase db push
```

This creates the necessary tables:
- `subscriptions` - Stores user subscription data
- `stripe_customers` - Maps users to Stripe customers
- `stripe_webhooks` - Logs all webhook events for debugging
- `checkout_sessions` - Tracks checkout session states
