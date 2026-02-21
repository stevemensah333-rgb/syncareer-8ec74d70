import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
          setStatus('error');
          setMessage('No session ID provided');
          return;
        }

        // Call API to verify subscription
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        // Verify session with backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/verify-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify subscription');
        }

        setStatus('success');
        setMessage('Your subscription has been activated!');

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('Subscription verification error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    verifySubscription();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center space-y-6 max-w-md">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-white">Verifying your subscription...</h2>
            <p className="text-slate-300">This should only take a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Subscription Activated!</h2>
            <p className="text-slate-300">{message}</p>
            <p className="text-sm text-slate-400">Redirecting to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-red-500">!</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-slate-300">{message}</p>
            <Button
              onClick={() => navigate('/pricing')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Back to Pricing
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
