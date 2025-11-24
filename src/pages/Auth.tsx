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

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
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
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
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
        <h1 className="text-2xl font-bold text-white">SkillBridge</h1>
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
