import { cn } from '@/lib/utils';
import syncareerLogo from '@/assets/syncareer-logo.png';

interface SyncareerLogoProps {
  /** Height of the logo icon in pixels */
  height?: number;
  /** Whether to show the wordmark text */
  showText?: boolean;
  className?: string;
}

/**
 * Syncareer logo — renders the S icon mark from the brand image
 * with CSS cropping, plus system-font wordmark.
 * mix-blend-multiply removes the white background so it feels native.
 */
export function SyncareerLogo({ height = 30, showText = true, className }: SyncareerLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Crop container: only shows the left icon portion of the full logo image */}
      <div
        className="overflow-hidden shrink-0"
        style={{ height, width: height }}
      >
        <img
          src={syncareerLogo}
          alt=""
          style={{ height: height * 1.6, width: 'auto', marginTop: -height * 0.1, marginLeft: -height * 0.05 }}
          className="object-contain mix-blend-multiply dark:brightness-0 dark:invert select-none"
          draggable={false}
        />
      </div>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground leading-none">
          Syncareer
        </span>
      )}
    </div>
  );
}
