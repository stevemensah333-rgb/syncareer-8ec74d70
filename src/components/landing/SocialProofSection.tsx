import AnimatedSection from "./AnimatedSection";

const testimonials = [
  {
    quote: "Syncareer helped me discover that UX design was my ideal career path. I never would have considered it without the RIASEC assessment.",
    name: "Ama K.",
    role: "UX Design Intern",
  },
  {
    quote: "The CV builder completely transformed my resume. I started getting callbacks within a week of updating it.",
    name: "Kwame O.",
    role: "Computer Science Graduate",
  },
  {
    quote: "Practicing interviews with SynAssist gave me the confidence I needed. I aced my final interview.",
    name: "Esi M.",
    role: "Marketing Associate",
  },
];

export default function SocialProofSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-12">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-[0.2em]">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Trusted by ambitious students
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 0.1}>
              <div className="rounded-2xl p-6 h-full flex flex-col border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <p className="text-sm text-white/60 leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                <div>
                  <p className="font-medium text-white text-sm">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
