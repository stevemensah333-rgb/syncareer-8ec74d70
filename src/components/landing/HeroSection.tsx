import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, FileText, Mic, Target } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onSignUp: () => void;
  onWatchVideo: () => void;
}

export default function HeroSection({ onSignUp, onWatchVideo }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium mb-6 border border-primary/30">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Career Intelligence
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Turn Uncertainty Into{" "}
              <span className="text-primary">
                Career Clarity
              </span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-md">
              Get AI-driven career recommendations, optimize your CV, and practice interviews — all in one platform built for students and early professionals.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={onSignUp} className="rounded-full px-7 h-12 text-base gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onWatchVideo}
                className="rounded-full px-7 h-12 text-base gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <Play className="h-4 w-4" />
                See How It Works
              </Button>
            </div>
          </motion.div>

          {/* Right - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-primary/10 p-6">
              {/* Fake dashboard header */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="ml-3 text-xs text-white/50">Syncareer Dashboard</span>
              </div>
              {/* Mockup cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <DashboardCard icon={<Target className="h-4 w-4 text-primary" />} label="Career Match" value="92%" />
                <DashboardCard icon={<FileText className="h-4 w-4 text-primary" />} label="CV Score" value="78/100" />
                <DashboardCard icon={<Mic className="h-4 w-4 text-primary" />} label="Interviews" value="3 done" />
                <DashboardCard icon={<Sparkles className="h-4 w-4 text-primary" />} label="Skills" value="12 mapped" />
              </div>
              <div className="h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/40">
                Career progress chart
              </div>
            </div>
            {/* Floating accent card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-lg p-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">New match found</p>
                <p className="text-[10px] text-white/50">UX Designer at Andela</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
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

function DashboardCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
      <div className="flex items-center gap-2 mb-1.5">{icon}<span className="text-[11px] text-white/50">{label}</span></div>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
