import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Briefcase, 
  Users, 
  Brain, 
  TrendingUp,
  ArrowRight,
  Search,
  MapPin,
  Monitor,
  Heart,
  DollarSign,
  Megaphone
} from "lucide-react";
import skillbridgeLogo from "@/assets/skillbridge-logo.png";
import AuthDialog from "@/components/auth/AuthDialog";

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openSignIn = () => {
    setAuthMode('signin');
    setAuthOpen(true);
  };

  const openSignUp = () => {
    setAuthMode('signup');
    setAuthOpen(true);
  };

  const categories = [
    { icon: Monitor, title: "Technology", count: "1,200+ open roles", color: "bg-primary/10 text-primary" },
    { icon: Heart, title: "Healthcare", count: "850+ open roles", color: "bg-red-100 text-red-600" },
    { icon: DollarSign, title: "Finance", count: "640+ open roles", color: "bg-amber-100 text-amber-600" },
    { icon: Megaphone, title: "Marketing", count: "420+ open roles", color: "bg-purple-100 text-purple-600" },
  ];

  const featuredJobs = [
    {
      company: "Stripe",
      logo: "💳",
      title: "Senior Product Designer",
      location: "San Francisco, CA (Remote)",
      tags: ["Design", "Figma", "SaaS"],
      salary: "$140k - $190k",
      type: "FULL-TIME",
      typeColor: "bg-primary/10 text-primary",
      posted: "2 days ago"
    },
    {
      company: "Coinbase",
      logo: "🪙",
      title: "Senior Backend Engineer",
      location: "London, UK",
      tags: ["Go", "Kubernetes", "Web3"],
      salary: "$160k - $210k",
      type: "REMOTE",
      typeColor: "bg-green-100 text-green-600",
      posted: "4 hours ago"
    },
    {
      company: "Spotify",
      logo: "🎵",
      title: "Technical Product Manager",
      location: "New York, NY",
      tags: ["Product", "Agile", "Strategy"],
      salary: "$150k - $200k",
      type: "FULL-TIME",
      typeColor: "bg-primary/10 text-primary",
      posted: "Just now"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={skillbridgeLogo} alt="Syncareer" className="h-8 w-8 object-contain" />
            <span className="text-xl font-semibold">Syncareer</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Find Jobs
            </a>
            <a href="#employers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              For Employers
            </a>
            <a href="#advice" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Career Advice
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="default" onClick={openSignUp}>
              Sign Up
            </Button>
            <Button variant="ghost" onClick={openSignIn}>
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-muted/30" />
        <div className="container mx-auto px-4 relative">
          <Card className="bg-card/80 backdrop-blur border shadow-lg overflow-hidden">
            <CardContent className="p-8 lg:p-16">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Find Your Next Career Move
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Connecting top talent with industry-leading companies worldwide.<br />
                  Browse thousands of job openings.
                </p>
                
                {/* Search Bar */}
                <div className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Job title, keywords, or company" 
                      className="pl-10 h-12 bg-background"
                    />
                  </div>
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="City, state, or remote" 
                      className="pl-10 h-12 bg-background"
                    />
                  </div>
                  <Button size="lg" className="h-12 px-8">
                    Search Jobs
                  </Button>
                </div>

                {/* Popular Searches */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                  <span>Popular:</span>
                  <Button variant="link" className="text-foreground p-0 h-auto">Product Designer</Button>
                  <Button variant="link" className="text-foreground p-0 h-auto">Software Engineer</Button>
                  <Button variant="link" className="text-foreground p-0 h-auto">Project Manager</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="py-16" id="jobs">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Trending Categories</h2>
            <Button variant="link" className="text-primary gap-1">
              View all categories <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card key={category.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold">Featured Jobs</h2>
              <p className="text-muted-foreground">Discover top-tier opportunities at global leaders.</p>
            </div>
            <Button variant="outline">Browse All Jobs</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {featuredJobs.map((job) => (
              <Card key={job.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                      {job.logo}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${job.typeColor}`}>
                      {job.type}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{job.company} • {job.location}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{job.salary}</span>
                    <span className="text-muted-foreground">{job.posted}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" id="employers">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Syncareer?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From finding opportunities to preparing for interviews, we've got you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Job Matching</h3>
                <p className="text-sm text-muted-foreground">AI-powered job recommendations tailored to your skills.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Interview Prep</h3>
                <p className="text-sm text-muted-foreground">Practice with AI-powered mock interviews.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Communities</h3>
                <p className="text-sm text-muted-foreground">Connect with peers and industry professionals.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Portfolio Builder</h3>
                <p className="text-sm text-muted-foreground">Showcase your projects to potential employers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30" id="about">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={skillbridgeLogo} alt="Syncareer" className="h-6 w-6 object-contain" />
                <span className="font-semibold">Syncareer</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The leading employment platform for future-forward companies and talented individuals seeking their next big break.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Candidates</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Browse Jobs</a></li>
                <li><a href="#" className="hover:text-foreground">Job Alerts</a></li>
                <li><a href="#" className="hover:text-foreground">Career Advice</a></li>
                <li><a href="#" className="hover:text-foreground">Resume Builder</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Post a Job</a></li>
                <li><a href="#" className="hover:text-foreground">Browse Resumes</a></li>
                <li><a href="#" className="hover:text-foreground">Employer Branding</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing Plans</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Syncareer. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authOpen} 
        onOpenChange={setAuthOpen} 
        defaultMode={authMode}
      />
    </div>
  );
}
