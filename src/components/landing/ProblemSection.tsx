import { AlertTriangle, FileX, Compass, Puzzle } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const problems = [
  {
    icon: Compass,
    title: "No Career Direction",
    description: "Students graduate without knowing which careers match their strengths or interests.",
  },
  {
    icon: FileX,
    title: "Weak CVs",
    description: "Most student CVs fail ATS filters and lack the structure employers expect.",
  },
  {
    icon: AlertTriangle,
    title: "Poor Interview Skills",
    description: "Without practice and feedback, interviews become a source of anxiety, not confidence.",
  },
  {
    icon: Puzzle,
    title: "Skills Mismatch",
    description: "The gap between academic learning and industry demand leaves graduates unprepared.",
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="py-24">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-[0.2em]">The Problem</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Career guidance is broken
          </h2>
          <p className="text-white/50 text-lg">
            Students are expected to make life-defining career choices with almost no support.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {problems.map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 0.1}>
              <div className="group rounded-2xl p-6 h-full border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
