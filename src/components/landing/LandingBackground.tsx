import landingBg from "@/assets/landing-bg.png";

export default function LandingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <img
        src={landingBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />
      {/* Subtle warm vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
    </div>
  );
}
