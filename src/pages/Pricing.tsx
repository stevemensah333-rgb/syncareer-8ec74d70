import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { createCheckoutSession } from '@/services/subscriptionService';
import { toast } from 'sonner';

export default function PricingPage() {
  const navigate = useNavigate();
  const { subscription, isPremium, loading } = useSubscription();
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  const pricing = {
    monthly: {
      free: { price: 0, priceId: '' },
      premium: { price: 4.99, priceId: process.env.VITE_STRIPE_PRICE_MONTHLY || '' },
    },
    yearly: {
      free: { price: 0, priceId: '' },
      premium: { price: 49.99, priceId: process.env.VITE_STRIPE_PRICE_YEARLY || '' },
    },
  };

  const features = {
    free: [
      'Basic portfolio creation',
      'Limited AI coach sessions',
      'Interview simulator (basic mode)',
      'CV builder (essential features)',
      'Community access',
      'Monthly analytics report',
    ],
    premium: [
      'Advanced portfolio analytics',
      'Unlimited AI coach sessions',
      'Interview simulator (advanced modes)',
      'CV builder (all features)',
      'Priority support',
      'Real-time analytics dashboard',
      'Early access to new features',
      'Personalized career recommendations',
    ],
  };

  const handleUpgrade = async () => {
    setIsLoadingCheckout(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/');
        return;
      }

      const sessionUrl = await createCheckoutSession(
        user.id,
        pricing[selectedBilling].premium.priceId,
        `${window.location.origin}/subscription-success`
      );

      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('An error occurred during checkout');
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-2 bg-slate-700/50 rounded-full border border-slate-600">
            <span className="text-sm text-slate-300">Transparent Pricing</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-balance">
            Unlock Your Career Potential
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Choose the plan that works for you. Upgrade anytime with no lock-in contracts.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-700/50 rounded-lg p-1 border border-slate-600">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedBilling === 'monthly'
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBilling('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedBilling === 'yearly'
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 inline-block px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Tier */}
          <Card className="bg-slate-800/50 border-slate-700 p-8 flex flex-col justify-between hover:bg-slate-800/70 transition-colors">
            <div>
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-slate-400 mb-6">For those just getting started</p>

              <div className="mb-8">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-400 ml-2">forever</span>
              </div>

              <ul className="space-y-4 mb-8">
                {features.free.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {!isPremium ? (
              <Button
                variant="outline"
                className="w-full bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                disabled
              >
                Current Plan
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
              >
                Downgrade
              </Button>
            )}
          </Card>

          {/* Premium Tier */}
          <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 p-8 flex flex-col justify-between relative ring-2 ring-green-500/50">
            <div className="absolute -top-4 right-4 bg-green-500 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold">
              Recommended
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-slate-300 mb-6">For serious career advancement</p>

              <div className="mb-8">
                <span className="text-4xl font-bold">
                  ${selectedBilling === 'monthly' ? '4.99' : '49.99'}
                </span>
                <span className="text-slate-400 ml-2">
                  {selectedBilling === 'monthly' ? '/month' : '/year'}
                </span>
                {selectedBilling === 'yearly' && (
                  <div className="text-sm text-green-400 mt-2">Save $10/year vs monthly</div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {features.premium.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-100">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={isLoadingCheckout || isPremium}
              className="w-full bg-green-500 text-slate-900 hover:bg-green-600 font-semibold"
            >
              {isLoadingCheckout
                ? 'Processing...'
                : isPremium
                  ? 'Already Premium'
                  : 'Upgrade to Premium'}
            </Button>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto border-t border-slate-700 pt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes! Upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Is there a free trial?',
                a: 'The free tier gives you full access to core features. No trial needed - start using it right away.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit and debit cards through Stripe, your secure payment processor.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 30-day money-back guarantee on annual plans. Contact support for details.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 pt-12 border-t border-slate-700">
          <h3 className="text-2xl font-bold mb-4">Ready to accelerate your career?</h3>
          <p className="text-slate-300 mb-6">Join thousands of professionals transforming their careers with SynCareer.</p>
          <Button
            onClick={handleUpgrade}
            disabled={isPremium}
            size="lg"
            className="bg-green-500 text-slate-900 hover:bg-green-600 font-semibold"
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
}
