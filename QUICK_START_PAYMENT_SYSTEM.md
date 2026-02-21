# Quick Start: Complete Payment System in 3 Steps

## Step 1: Apply Database Migration
```bash
# From your project directory, run:
supabase db push

# This creates:
# - subscriptions table
# - subscription_events table
# - stripe_customers table
# - checkout_sessions table
# - RLS policies for security
```

**Verify it worked**: Check Supabase Dashboard > SQL Editor > See new tables

---

## Step 2: Configure Stripe Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add Endpoint"
3. Enter your webhook URL:
   ```
   https://your-project-name.vercel.app/api/stripe/webhooks
   ```
   (Replace `your-project-name` with your actual Vercel project URL)

4. Select events to listen for:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Click "Add Endpoint"
6. You'll see a "Signing Secret" - Copy it
7. Update your Vercel environment variable:
   - Go to Vercel Project Settings > Environment Variables
   - Update `STRIPE_WEBHOOK_SECRET` with the signing secret from step 6
   - Redeploy your project

**Verify it worked**: In Stripe Dashboard, send a test event. Check API logs for successful webhook receipt.

---

## Step 3: Test the Payment Flow

### Local Testing with Stripe CLI:
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:5173/api/stripe/webhooks

# In another terminal:
npm run dev

# Visit: http://localhost:5173/pricing
# Click Subscribe
# Use test card: 4242 4242 4242 4242
# Email: any@example.com
# Date: 12/25, CVC: 123
```

### Production Testing:
1. Visit: `https://your-domain.com/pricing`
2. Click "Subscribe" on Premium plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. You should be redirected to `/subscription-success`
6. Go to Settings > Subscription & Billing
7. You should see "Premium" status

---

## What's Now Live

✅ **Pricing Page**: `/pricing`
- Shows Free and Premium plans
- Monthly/Yearly toggle
- Feature comparison
- Premium badge on current plan (if subscribed)

✅ **Navbar Navigation**:
- "Pricing" button for all users
- "Subscription" link in user dropdown

✅ **Settings Integration**:
- New "Subscription & Billing" tab
- View subscription details
- Cancel subscription button
- Billing history

✅ **Feature Gating**:
- Premium features automatically protected
- Upgrade prompt for free users
- Real-time subscription status

---

## Common Issues & Solutions

### Issue: "Missing environment variables"
**Solution**: Ensure all 4 variables are set in Vercel:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- VITE_STRIPE_PRICE_MONTHLY
- VITE_STRIPE_PRICE_YEARLY

### Issue: Webhook not receiving events
**Solution**: 
1. Verify webhook URL is correct
2. Check Stripe Dashboard for webhook logs
3. Confirm STRIPE_WEBHOOK_SECRET is correct
4. Ensure API endpoint is publicly accessible

### Issue: "Subscription not showing in Settings"
**Solution**:
1. Verify webhook received the event (check Stripe logs)
2. Check Supabase dashboard > subscriptions table
3. Verify user ID matches
4. Hard refresh browser (Ctrl+Shift+R)

### Issue: Stripe checkout returns error
**Solution**:
1. Verify VITE_STRIPE_PRICE_MONTHLY/YEARLY are valid price IDs
2. Check Stripe Dashboard > Products > Your Product > Prices
3. Copy correct Price IDs to environment variables
4. Redeploy

---

## Monitor Your System

### Stripe Dashboard
- Webhooks > Events: See incoming webhook events
- Customers: View created customers
- Subscriptions: Monitor active subscriptions
- Payments: Track successful and failed charges

### Supabase Dashboard
- SQL Editor: Query tables directly
- Logs: View webhook processing logs
- Database: Monitor table activity

### Application Logs
- Check your API endpoint logs
- Monitor for any errors in `/api/stripe/*` endpoints

---

## Next Features (Optional)

Once payment system is live, you can add:

1. **Admin Dashboard**: View all subscriptions, revenue, churn
2. **Trial Periods**: Offer 7-14 day free trials
3. **Usage Tracking**: Track feature usage per subscription tier
4. **Dunning**: Handle failed payment retries
5. **Revenue Insights**: Track MRR, customer LTV, churn rate
6. **Promo Codes**: Create discount codes for marketing
7. **Multiple Products**: Different subscription tiers beyond Premium
8. **Invoicing**: Send detailed invoices to customers

---

## You're All Set! 🎉

Your payment system is ready to process real transactions. The architecture is:

- ✅ Secure (JWT auth + webhook verification + RLS)
- ✅ Scalable (Vercel Functions + Supabase)
- ✅ Reliable (error handling + retry logic + audit logs)
- ✅ User-friendly (smooth checkout + real-time updates)

Now go generate revenue! 💰
