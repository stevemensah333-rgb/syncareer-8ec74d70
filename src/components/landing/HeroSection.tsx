import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onSignUp: () => void;
  onWatchVideo: () => void;
}

export default function HeroSection({ onSignUp, onWatchVideo }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-primary/80 mb-6">
            AI-Powered Career Intelligence
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6">
            Turn Uncertainty Into{" "}
            <span className="relative inline-block">
              <span className="text-primary">Career Clarity</span>
              <motion.span
                className="absolute -inset-x-4 -inset-y-2 bg-primary/10 rounded-lg -z-10"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-10 max-w-2xl mx-auto">
            Get AI-driven career recommendations, optimize your CV, and practice interviews — all in one platform built for students and early professionals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={onSignUp}
              className="rounded-full px-8 h-12 text-base gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      </motion.div>
    </section>
  );
}
