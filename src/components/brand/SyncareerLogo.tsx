import { cn } from '@/lib/utils';

interface SyncareerLogoProps {
  /** Show the wordmark text next to the icon */
  showText?: boolean;
  /** Icon size in pixels */
  iconSize?: number;
  className?: string;
}

/**
 * Native SVG logo mark for Syncareer.
 * Renders as an inline element — no background box, no image block effect.
 */
export function SyncareerLogo({ showText = true, iconSize = 28, className }: SyncareerLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* SVG icon mark — two interlocking arrows representing career synergy */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        {/* Upper-left arrow pointing down-right */}
        <path
          d="M8 8L20 20L14 20L14 28L8 28L8 20L2 20L8 8Z"
          fill="hsl(var(--primary))"
          opacity="0.9"
        />
        {/* Lower-right arrow pointing up-left */}
        <path
          d="M32 32L20 20L26 20L26 12L32 12L32 20L38 20L32 32Z"
          fill="hsl(var(--primary))"
        />
        {/* Connecting bridge element */}
        <path
          d="M14 14L26 14L26 18L18 18L18 26L14 26L14 14Z"
          fill="hsl(var(--foreground))"
          opacity="0.15"
        />
      </svg>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground leading-none">
          Syncareer
        </span>
      )}
    </div>
  );
}
