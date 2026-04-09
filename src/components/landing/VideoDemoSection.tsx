import AnimatedSection from "./AnimatedSection";

const DEMO_VIDEO_URL = "https://fsorkxlcasekndigezlx.supabase.co/storage/v1/object/public/videos/demo-video.mp4";

export default function VideoDemoSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            See Syncareer in Action
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            From career assessment to interview practice in under 5 minutes
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="max-w-5xl mx-auto">
            {/* Browser mockup frame */}
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl shadow-black/40">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white/5 rounded-md px-3 py-1.5 text-xs text-white/40 max-w-md mx-auto text-center">
                    syncareer.lovable.app
                  </div>
                </div>
              </div>
              {/* Video */}
              <div className="relative aspect-video bg-black">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src={DEMO_VIDEO_URL} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
