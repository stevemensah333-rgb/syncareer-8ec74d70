import { cn } from "@/lib/utils";

interface SyncareerLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Interlinked S-shape mark */}
      <path
        d="M50 8L22 24v24l28 16 28-16V24L50 8z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M30 34c0-8 6-14 14-14h12c8 0 14 6 14 14v4c0 4-2 7.5-5.5 10L42 62c-3.5 2.5-5.5 6-5.5 10v4c0 8 6 14 14 14h12c8 0 14-6 14-14"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M70 66c0 8-6 14-14 14H44c-8 0-14-6-14-14v-4c0-4 2-7.5 5.5-10L58 38c3.5-2.5 5.5-6 5.5-10v-4c0-8-6-14-14-14H37c-8 0-14 6-14 14"
        stroke="hsl(var(--primary))"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const sizeMap = {
  sm: { icon: "h-6 w-6", text: "text-base", gap: "gap-2" },
  md: { icon: "h-7 w-7", text: "text-lg", gap: "gap-2.5" },
  lg: { icon: "h-8 w-8", text: "text-xl", gap: "gap-3" },
};

export default function SyncareerLogo({
  size = "md",
  showWordmark = true,
  className,
}: SyncareerLogoProps) {
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "flex items-center",
        s.gap,
        "group transition-opacity duration-200 hover:opacity-100 opacity-95",
        className
      )}
    >
      <LogoIcon className={cn(s.icon, "text-foreground shrink-0")} />
      {showWordmark && (
        <span
          className={cn(
            s.text,
            "font-semibold text-foreground tracking-tight leading-none select-none"
          )}
          style={{ letterSpacing: "0.01em" }}
        >
          Syncareer
        </span>
      )}
    </div>
  );
}
