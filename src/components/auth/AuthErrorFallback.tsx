import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AuthErrorFallbackProps {
  error: string | null;
  onRetry: () => void;
}

export function AuthErrorFallback({ error, onRetry }: AuthErrorFallbackProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            We couldn't load your session. This is usually temporary.
          </p>
        </div>

        {error && (
          <div className="bg-muted rounded-lg p-3 text-left">
            <p className="text-xs font-mono text-muted-foreground break-all">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button onClick={onRetry} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button variant="outline" onClick={handleSignOut} className="w-full gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          If this persists, try clearing your browser cache or using a different browser.
        </p>
      </div>
    </div>
  );
}
