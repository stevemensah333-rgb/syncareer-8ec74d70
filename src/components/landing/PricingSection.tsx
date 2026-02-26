import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

interface PricingSectionProps {
  onSignUp: () => void;
  onNavigatePricing: () => void;
}

const plans = [
  {
    name: "Free",
    price: "GH₵ 0",
    period: "forever",
    description: "For exploration and early-stage students.",
    features: [
      "Portfolio projects: 3 uploads max",
      "AI Coach sessions: 5 per month",
      "Mock interviews: 3 per month (basic roles only)",
      "CV downloads: 2 exports per month (PDF only)",
      "Career assessments: 2 full assessments",
      "Job applications tracked: 10 active",
      "Analytics: Monthly summary report only",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "GH₵ 30",
    period: "/month",
    description: "For committed students serious about their careers.",
    features: [
      "Portfolio projects: Unlimited uploads",
      "AI Coach sessions: Unlimited",
      "Mock interviews: Unlimited + advanced roles",
      "CV downloads: Unlimited (multiple formats)",
      "Career assessments: Unlimited retakes",
      "Job applications tracked: Unlimited",
      "Analytics: Real-time dashboard",
      "Personalized AI career recommendations",
      "Priority support & early feature access",
    ],
    cta: "Upgrade to Premium",
    highlighted: true,
  },
];

export default function PricingSection({ onSignUp, onNavigatePricing }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg">
            Start free, upgrade when you're ready to accelerate.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <AnimatedSection key={plan.name} delay={i * 0.12}>
              <div
                className={`rounded-2xl p-7 h-full flex flex-col border ${
                  plan.highlighted
                    ? "border-primary bg-card shadow-xl shadow-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block self-start text-[10px] font-semibold uppercase tracking-widest bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={plan.highlighted ? onNavigatePricing : onSignUp}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full rounded-full h-11"
                >
                  {plan.cta}
                </Button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
