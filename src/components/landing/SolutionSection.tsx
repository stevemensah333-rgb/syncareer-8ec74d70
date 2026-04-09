import { Brain, FileText, Mic, Target, FolderSearch, BarChart3 } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const features = [
  {
    icon: Brain,
    title: "AI Career Recommendations",
    description: "Our 45-question RIASEC assessment maps your personality to high-fit career paths with actionable next steps.",
    accent: "text-primary bg-primary/10",
  },
  {
    icon: FileText,
    title: "CV Optimization",
    description: "Build ATS-friendly resumes with AI suggestions for stronger bullet points and quantified achievements.",
    accent: "text-secondary bg-secondary/10",
  },
  {
    icon: Mic,
    title: "Interview Simulation",
    description: "Practice role-specific interviews with SynAssist and get structured, constructive feedback instantly.",
    accent: "text-accent bg-accent/10",
  },
  {
    icon: Target,
    title: "Skills Gap Detection",
    description: "Identify exactly which skills you need and get course recommendations to close the gap.",
    accent: "text-warning bg-warning/10",
  },
  {
    icon: FolderSearch,
    title: "Portfolio Analysis",
    description: "Get AI-powered feedback on your projects to present them professionally to employers.",
    accent: "text-success bg-success/10",
  },
  {
    icon: BarChart3,
    title: "Career Analytics",
    description: "Track your progress with real-time scores across interviews, skills, and career readiness.",
    accent: "text-primary bg-primary/10",
  },
];

export default function SolutionSection() {
  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-[0.2em]">The Solution</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need to launch your career
          </h2>
          <p className="text-muted-foreground text-lg">
            Syncareer replaces guesswork with data-driven, AI-powered career infrastructure.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={i * 0.08}>
              <div className="group rounded-2xl p-6 h-full border border-border bg-card hover:border-primary/20 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl ${feature.accent.split(" ")[1]} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-5 w-5 ${feature.accent.split(" ")[0]}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
