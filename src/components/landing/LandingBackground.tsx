export default function LandingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background image */}
      <img
        src="/images/landing-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Subtle glow at center-top */}
      <div
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.08]"
        style={{ background: "radial-gradient(ellipse, hsl(181, 100%, 40%), transparent 70%)" }}
      />
    </div>
  );
}
