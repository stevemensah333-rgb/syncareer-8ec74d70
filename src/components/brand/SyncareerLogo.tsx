import { cn } from '@/lib/utils';
import syncareerBrand from '@/assets/syncareer-brand.png';

interface SyncareerLogoProps {
  /** Height of the logo in pixels */
  height?: number;
  className?: string;
}

/**
 * Syncareer brand logo — icon + wordmark rendered as a single image.
 * Uses mix-blend-multiply to eliminate white background on light themes
 * and mix-blend-screen + invert for dark themes, making it feel native.
 */
export function SyncareerLogo({ height = 28, className }: SyncareerLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={syncareerBrand}
        alt="Syncareer"
        style={{ height, width: 'auto' }}
        className="object-contain mix-blend-multiply dark:mix-blend-screen dark:invert shrink-0 select-none"
        draggable={false}
      />
    </div>
  );
}
