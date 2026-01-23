import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { z } from 'zod';

// Validation schemas
const signUpSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const signInSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const ensureProfileRow = async (userId: string) => {
    // Ensures a profiles row exists so onboarding status can be persisted/read.
    // Only inserts the minimal required field (id) to avoid overwriting any existing profile data.
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId }, { onConflict: 'id' });

    if (error) throw error;
  };

  useEffect(() => {
    const checkOnboardingStatus = async (userId: string) => {
      try {
        await ensureProfileRow(userId);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;

        navigate(profile?.onboarding_completed === true ? '/' : '/onboarding');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        navigate('/onboarding');
      }
    };

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkOnboardingStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        toast.success('Successfully logged in!');
        // Avoid Supabase calls directly inside the auth callback.
        setTimeout(() => checkOnboardingStatus(session.user.id), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with zod schema
    const result = signUpSchema.safeParse({ 
      fullName: fullName.trim(), 
      email: email.trim(), 
      password 
    });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName.trim()
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        // If a session is created immediately (e.g. auto-confirm enabled), ensure profiles row exists.
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          try {
            await ensureProfileRow(session.user.id);
          } catch (e) {
            // Non-blocking: user can still complete onboarding; this just prevents repeated onboarding later.
            console.error('Error ensuring profile row after sign up:', e);
          }
        }
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred with Google sign in');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with zod schema
    const result = signInSchema.safeParse({ email: email.trim(), password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6">
        <h1 className="text-2xl font-bold text-white">Synconnect</h1>
        <nav className="flex gap-8">
          <Link to="/" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
            HOME
          </Link>
          <Link to="/" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
            ABOUT US
          </Link>
          <Link to="/" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
            CONTACT
          </Link>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-white underline underline-offset-4"
          >
            {isSignUp ? 'LOG IN' : 'SIGN UP'}
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Side - Dark Background with 3D Elements */}
        <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center">
          {/* Decorative gradient orbs */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          {/* Welcome Text */}
          <div className="relative z-10 px-16">
            <h2 className="text-6xl font-bold text-white leading-tight">
              {isSignUp ? 'Welcome!' : 'Welcome Back!'}
            </h2>
          </div>
        </div>

        {/* Right Side - Form Card */}
        <div className="w-[500px] bg-white flex items-center justify-center p-12">
          <Card className="w-full max-w-md border-0 shadow-none">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-black">
                {isSignUp ? 'Sign up' : 'Log in'}
              </h2>

              {!isSignUp ? (
                /* Login Form */
                <form onSubmit={handleSignIn} className="space-y-6">
                  {/* Username/Email Input */}
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-12 bg-muted/50 border-none rounded-xl"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-12 pr-12 h-12 bg-muted/50 border-none rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-muted-foreground cursor-pointer">
                        Remember Me
                      </Label>
                    </div>
                    <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Log in Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-black text-white hover:bg-black/90 rounded-xl font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Log in'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Google Sign In Button */}
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="w-full h-12 border-border hover:bg-muted/50 rounded-xl font-medium"
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Sign up Button */}
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setIsSignUp(true)}
                    className="w-full h-12 bg-muted/50 text-foreground hover:bg-muted rounded-xl font-medium"
                  >
                    Sign up
                  </Button>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={handleSignUp} className="space-y-6">
                  {/* Full Name Input */}
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Full Name
                    </Label>
                    <Input
                      type="text"
                      placeholder="Daniel Gallego"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-12 bg-muted/50 border-none rounded-xl"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      placeholder="hello@reallygreatsite.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-muted/50 border-none rounded-xl"
                    />
                  </div>

                  {/* Password Fields Side by Side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-2 block">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="h-12 bg-muted/50 border-none rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-foreground mb-2 block">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="h-12 bg-muted/50 border-none rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Create Account Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-black text-white hover:bg-black/90 rounded-xl font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Google Sign Up Button */}
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="w-full h-12 border-border hover:bg-muted/50 rounded-xl font-medium"
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Log in Button */}
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setIsSignUp(false)}
                    className="w-full h-12 bg-muted/50 text-foreground hover:bg-muted rounded-xl font-medium"
                  >
                    Log in
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
