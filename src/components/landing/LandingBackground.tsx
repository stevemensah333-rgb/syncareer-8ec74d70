/**
 * Fixed dark background with animated grid/wireframe mesh pattern
 * inspired by Opux's landing page aesthetic.
 * This stays fixed while content scrolls over it.
 */
export default function LandingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "hsl(220, 20%, 8%)" }}>
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Perspective grid floor */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%]" style={{ perspective: "500px" }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(181, 100%, 40%, 0.12) 1px, transparent 1px),
              linear-gradient(90deg, hsl(181, 100%, 40%, 0.12) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            transform: "rotateX(60deg)",
            transformOrigin: "bottom center",
          }}
        />
      </div>

      {/* Mountain-like wireframe silhouette using gradients */}
      <svg
        className="absolute bottom-[15%] left-0 right-0 w-full opacity-20"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        style={{ height: "30%" }}
      >
        <polyline
          points="0,200 80,160 160,140 240,120 320,100 400,80 480,110 560,60 640,90 720,50 800,70 880,40 960,80 1040,60 1120,100 1200,80 1280,120 1360,140 1440,200"
          fill="none"
          stroke="hsl(181, 100%, 40%)"
          strokeWidth="1"
        />
        <polyline
          points="0,200 100,170 200,150 300,130 400,90 500,120 600,70 700,100 800,60 900,80 1000,50 1100,90 1200,70 1300,110 1440,200"
          fill="none"
          stroke="hsl(181, 100%, 40%)"
          strokeWidth="0.5"
          opacity="0.5"
        />
        {/* Vertical lines from peaks */}
        {[560, 720, 880, 1040].map((x) => (
          <line
            key={x}
            x1={x}
            y1={60}
            x2={x}
            y2={200}
            stroke="hsl(181, 100%, 40%)"
            strokeWidth="0.3"
            opacity="0.3"
          />
        ))}
      </svg>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,20%,8%)] via-transparent to-[hsl(220,20%,8%)] opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,20%,8%)] via-transparent to-[hsl(220,20%,8%)] opacity-40" />

      {/* Subtle glow at center-top */}
      <div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(ellipse, hsl(181, 100%, 40%), transparent 70%)" }}
      />
    </div>
  );
}
