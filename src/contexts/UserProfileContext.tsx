import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// ── Types ──────────────────────────────────────────────────────────

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface StudentDetails {
  year_of_admission: number | null;
  expected_completion: number | null;
  major: string;
  school: string | null;
  degree_type: string;
}

interface EmployerDetails {
  company_name: string;
  company_location: string | null;
  industry: string | null;
  company_size: string | null;
  job_title: string | null;
  company_website: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_description: string | null;
}

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  onboarding_completed: boolean;
  user_type: string | null;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  studentDetails: StudentDetails | null;
  employerDetails: EmployerDetails | null;
  loading: boolean;
  authState: AuthState;
  session: Session | null;
  lastError: string | null;
  refreshProfile: () => Promise<void>;
  retryAuth: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

// ── Timeout wrapper ────────────────────────────────────────────────

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: ${label} exceeded ${ms}ms`));
    }, ms);
    Promise.resolve(promise).then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

// ── Provider ───────────────────────────────────────────────────────

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [employerDetails, setEmployerDetails] = useState<EmployerDetails | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Derived loading for backward compat
  const loading = authState === 'loading';

  // ── Safe profile fetch with auto-creation ─────────────────────

  const fetchProfile = useCallback(async (userId: string, userMeta?: Record<string, unknown>) => {
    try {
      const profileResult = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
          .then(r => r),
        5000,
        'profile_fetch'
      );

      const { data: profileData, error: profileError } = profileResult;

      if (profileError) {
        console.error('[Syncareer] Profile fetch error (possible RLS denial):', {
          code: profileError.code,
          message: profileError.message,
          hint: profileError.hint,
          userId,
        });
        setLastError(`Profile fetch failed: ${profileError.message}`);
        // Don't block — set authenticated with null profile so fallback UI renders
        setProfile(null);
        setAuthState('authenticated');
        return;
      }

      // ── Auto-create profile if missing ──
      if (!profileData) {
        console.warn('[Syncareer] No profile row found, auto-creating for user:', userId);
        const newProfile = {
          id: userId,
          username: (userMeta?.username as string) || null,
          full_name: (userMeta?.full_name as string) || null,
          onboarding_completed: false,
        };

        const createResult = await withTimeout(
          supabase.from('profiles').insert(newProfile).select().single(),
          5000,
          'profile_auto_create'
        );
        const { data: created, error: createError } = createResult;

        if (createError) {
          console.error('[Syncareer] Profile auto-create failed:', createError);
          setLastError(`Profile auto-create failed: ${createError.message}`);
          setProfile(null);
          setAuthState('authenticated');
          return;
        }

        setProfile(created as UserProfile);
        setStudentDetails(null);
        setEmployerDetails(null);
        setAuthState('authenticated');
        return;
      }

      // ── Profile exists — fetch role details ──
      setProfile(profileData as UserProfile);

      if (profileData.user_type === 'student' || profileData.user_type === 'employer') {
        try {
          const [studentResult, employerResult] = await withTimeout(
            Promise.all([
              supabase.from('student_details').select('*').eq('user_id', userId).maybeSingle().then(r => r),
              supabase.from('employer_details').select('*').eq('user_id', userId).maybeSingle().then(r => r),
            ]),
            5000,
            'role_details_fetch'
          );

          if (profileData.user_type === 'student' && studentResult.data) {
            setStudentDetails(studentResult.data as StudentDetails);
            setEmployerDetails(null);
          } else if (profileData.user_type === 'employer' && employerResult.data) {
            setEmployerDetails(employerResult.data as EmployerDetails);
            setStudentDetails(null);
          } else {
            setStudentDetails(null);
            setEmployerDetails(null);
          }
        } catch (detailErr) {
          console.warn('[Syncareer] Role details fetch failed (non-blocking):', detailErr);
          setStudentDetails(null);
          setEmployerDetails(null);
        }
      } else {
        setStudentDetails(null);
        setEmployerDetails(null);
      }

      setLastError(null);
      setAuthState('authenticated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown profile fetch error';
      console.error('[Syncareer] Profile fetch critical error:', message);
      setLastError(message);
      setProfile(null);
      setAuthState('authenticated'); // Still authenticated, just no profile
    }
  }, []);

  // ── Auth initialization ───────────────────────────────────────

  const initAuth = useCallback(async () => {
    setAuthState('loading');
    setLastError(null);

    try {
      const { data: { session: currentSession }, error: sessionError } = await withTimeout(
        supabase.auth.getSession(),
        5000,
        'get_session'
      );

      if (sessionError) {
        console.error('[Syncareer] getSession error:', sessionError);
        setLastError(`Session error: ${sessionError.message}`);
        setAuthState('error');
        return;
      }

      if (!currentSession?.user) {
        setSession(null);
        setProfile(null);
        setStudentDetails(null);
        setEmployerDetails(null);
        setAuthState('unauthenticated');
        return;
      }

      setSession(currentSession);
      await fetchProfile(currentSession.user.id, currentSession.user.user_metadata);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auth initialization failed';
      console.error('[Syncareer] Auth init critical error:', message);
      setLastError(message);
      setAuthState('error');
    }
  }, [fetchProfile]);

  // ── Retry handler ─────────────────────────────────────────────

  const retryAuth = useCallback(() => {
    initAuth();
  }, [initAuth]);

  // ── Refresh profile (public API) ──────────────────────────────

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    setAuthState('loading');
    await fetchProfile(session.user.id, session.user.user_metadata);
  }, [session, fetchProfile]);

  // ── Effects ───────────────────────────────────────────────────

  useEffect(() => {
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[Syncareer] Auth state change:', event);

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setProfile(null);
          setStudentDetails(null);
          setEmployerDetails(null);
          setLastError(null);
          setAuthState('unauthenticated');
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            setSession(newSession);
            await fetchProfile(newSession.user.id, newSession.user.user_metadata);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initAuth, fetchProfile]);

  // ── Hard timeout safety net (15s max loading) ─────────────────

  useEffect(() => {
    if (authState !== 'loading') return;

    const timer = setTimeout(() => {
      console.error('[Syncareer] Auth loading exceeded 15s — forcing error state');
      setLastError('Authentication timed out. Please refresh the page.');
      setAuthState('error');
    }, 15000);

    return () => clearTimeout(timer);
  }, [authState]);

  return (
    <UserProfileContext.Provider value={{
      profile,
      studentDetails,
      employerDetails,
      loading,
      authState,
      session,
      lastError,
      refreshProfile,
      retryAuth,
    }}>
      {children}
    </UserProfileContext.Provider>
  );
};
