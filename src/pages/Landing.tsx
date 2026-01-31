import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Users, 
  Brain, 
  Target, 
  MessageCircle, 
  TrendingUp,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import skillbridgeLogo from "@/assets/skillbridge-logo.png";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Briefcase,
      title: "Job Opportunities",
      description: "Discover curated job listings matched to your skills and career goals."
    },
    {
      icon: Brain,
      title: "AI Interview Prep",
      description: "Practice with AI-powered mock interviews tailored to your target role."
    },
    {
      icon: Users,
      title: "Communities",
      description: "Connect with peers, mentors, and industry professionals in focused communities."
    },
    {
      icon: Target,
      title: "Skill Tracking",
      description: "Track your skill development and get personalized learning recommendations."
    },
    {
      icon: MessageCircle,
      title: "Career Counselling",
      description: "Book sessions with experienced career counsellors for guidance."
    },
    {
      icon: TrendingUp,
      title: "Portfolio Builder",
      description: "Showcase your projects and achievements to potential employers."
    }
  ];

  const benefits = [
    "AI-powered career matching",
    "Expert career counsellors",
    "Active professional communities",
    "Interview simulation tools",
    "Personalized learning paths"
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Launch Your Career with{" "}
            <span className="text-primary">Confidence</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            The all-in-one platform connecting students and professionals with opportunities, 
            mentorship, and the tools to succeed in today's competitive job market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              I'm an Employer
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From finding opportunities to preparing for interviews, we've got you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose Syncareer?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of students and professionals who are advancing their careers 
                with our comprehensive platform.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8" onClick={() => navigate("/auth")}>
                Join Now
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">1000+</div>
                  <p className="text-muted-foreground">Active Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Create your free account today and start building your career with Syncareer.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => navigate("/auth")}
            className="gap-2"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={skillbridgeLogo} alt="Syncareer" className="h-6 w-6 object-contain" />
              <span className="font-semibold">Syncareer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Syncareer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
