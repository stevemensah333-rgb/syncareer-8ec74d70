import { Navigate, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { AuthErrorFallback } from '@/components/auth/AuthErrorFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { authState, lastError, retryAuth } = useUserProfile();
  const location = useLocation();

  // Loading state — show spinner but never indefinitely (context has 15s hard timeout)
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Error state — show fallback with retry
  if (authState === 'error') {
    return <AuthErrorFallback error={lastError} onRetry={retryAuth} />;
  }

  // Not authenticated — redirect to landing
  if (authState === 'unauthenticated') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Authenticated — render children (profile may be null, pages handle that)
  return <>{children}</>;
};

export default ProtectedRoute;
