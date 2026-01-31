import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if this is a fresh browser session (no sessionStorage marker)
      // and user had "remember me" unchecked
      const wasSessionOnly = localStorage.getItem('syncareer_session_only');
      const currentSessionMarker = sessionStorage.getItem('syncareer_active_session');
      
      // If user didn't check "remember me" and this is a new browser session
      // (sessionStorage is cleared on browser close), sign them out
      if (wasSessionOnly === 'true' && !currentSessionMarker) {
        await supabase.auth.signOut();
        localStorage.removeItem('syncareer_session_only');
        setSession(null);
        setLoading(false);
        return;
      }
      
      // Mark this as an active session
      sessionStorage.setItem('syncareer_active_session', 'true');
      
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    // Redirect to landing page, saving the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
