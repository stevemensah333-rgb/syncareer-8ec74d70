import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Users, 
  Brain, 
  TrendingUp,
  ChevronDown,
  Play
} from "lucide-react";
import skillbridgeLogo from "@/assets/skillbridge-logo.png";
import heroImage from "@/assets/hero-landing.jpg";
import AuthDialog from "@/components/auth/AuthDialog";
import VideoModal from "@/components/landing/VideoModal";
import { supabase } from "@/integrations/supabase/client";
import { getHomeRouteForRole } from "@/components/auth/RoleRoute";

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [videoOpen, setVideoOpen] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect authenticated users to their role-appropriate dashboard
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, onboarding_completed')
          .eq('id', session.user.id)
          .single();
        
        if (!profile?.onboarding_completed) {
          navigate('/onboarding');
        } else {
          navigate(getHomeRouteForRole(profile?.user_type || null));
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const openSignIn = () => {
    setAuthMode('signin');
    setAuthOpen(true);
  };

  const openSignUp = () => {
    setAuthMode('signup');
    setAuthOpen(true);
  };

  const stats = [
    { value: "10K+", label: "Active Job Seekers" },
    { value: "500+", label: "Partner Companies" },
    { value: "95%", label: "Career Success Rate" },
    { value: "50+", label: "Industries Covered" },
  ];

  const features = [
    {
      icon: Briefcase,
      title: "Smart Job Matching",
      description: "AI-powered recommendations that connect you with roles that match your skills, experience, and career aspirations."
    },
    {
      icon: Brain,
      title: "Interview Preparation",
      description: "Practice with AI-powered mock interviews tailored to your target role and receive instant feedback."
    },
    {
      icon: Users,
      title: "Career Assessment",
      description: "Discover your strengths with our 45-question RIASEC assessment and get personalized career recommendations."
    },
    {
      icon: TrendingUp,
      title: "Portfolio Builder",
      description: "Showcase your projects and achievements to stand out from the competition."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Transparent on Hero */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={skillbridgeLogo} alt="Syncareer" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold text-white">Syncareer</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#purpose" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
              Our Purpose
            </a>
            <a href="#features" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
              Features
            </a>
            <a href="#stats" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
              Impact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={openSignIn}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              Login
            </Button>
            <Button 
              onClick={openSignUp}
              className="bg-white text-black hover:bg-white/90"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Bleed */}
      <section className="relative h-screen w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 max-w-5xl leading-tight">
            Launch Your Dream Career
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-10">
            Where ambition meets opportunity. Your journey to professional excellence starts here.
          </p>
          <div className="flex gap-4">
            <Button 
              size="lg" 
              onClick={openSignUp}
              className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 rounded-full"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setVideoOpen(true)}
              className="border-white text-white hover:bg-white/20 text-lg px-8 py-6 rounded-full"
            >
              <Play className="h-5 w-5 mr-2" />
              Watch Video
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 flex flex-col items-center animate-bounce">
          <span className="text-sm mb-2">Scroll to explore</span>
          <ChevronDown className="h-6 w-6" />
        </div>
      </section>

      {/* Purpose Section */}
      <section id="purpose" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Purpose</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              At Syncareer, we believe everyone deserves access to meaningful career opportunities. 
              Our platform combines cutting-edge AI technology with human insight to help you 
              discover your potential, develop your skills, and connect with employers who value what you bring.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section - Inspired by Ashesi */}
      <section id="stats" className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-5xl md:text-6xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Syncareer?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From finding opportunities to preparing for interviews, we've got you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="bg-background p-8 rounded-2xl border hover:shadow-lg transition-shadow"
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-12 md:p-20 text-center text-primary-foreground">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Begin?</h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10">
              Join thousands of professionals who have transformed their careers with Syncareer.
            </p>
            <Button 
              size="lg" 
              onClick={openSignUp}
              className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-6 rounded-full"
            >
              Create Your Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={skillbridgeLogo} alt="Syncareer" className="h-8 w-8 object-contain" />
                <span className="text-xl font-semibold">Syncareer</span>
              </div>
              <p className="text-muted-foreground">
                Empowering careers, connecting futures.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Candidates</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Browse Jobs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Career Advice</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Resume Builder</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Post a Job</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Browse Resumes</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing Plans</a></li>
              </ul>
            </div>
          <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>Follow us</span>
              <a
                href="https://www.tiktok.com/@syncareer?_r=1&_t=ZS-943Wv7vHgCT"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/syncareer?igsh=ZHRtc3Q2dzVxdnJs&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
            </div>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Syncareer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authOpen} 
        onOpenChange={setAuthOpen} 
        defaultMode={authMode}
      />

      {/* Video Modal */}
      <VideoModal 
        open={videoOpen} 
        onOpenChange={setVideoOpen} 
      />
    </div>
  );
}
