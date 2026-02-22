import { UserPlus, Sparkles, Rocket } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Profile",
    description: "Sign up and complete a quick assessment so our AI understands your strengths and goals.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Get AI Insights",
    description: "Receive personalized career recommendations, CV feedback, and skill gap analysis.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Take Action",
    description: "Practice interviews, build your portfolio, and apply with confidence.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Three steps to career clarity
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
          {/* Connector line - desktop only */}
          <div className="hidden md:block absolute top-16 left-[16.5%] right-[16.5%] h-px bg-border" />

          {steps.map((item, i) => (
            <AnimatedSection key={item.step} delay={i * 0.15}>
              <div className="text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-5 relative z-10 bg-card">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-2 block">{item.step}</span>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
