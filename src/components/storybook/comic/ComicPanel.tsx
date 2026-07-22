import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/** A single comic panel: thick black border, off-white inner, image fills. */
export function ComicPanel({
  imageUrl,
  alt = '',
  children,
  className,
}: {
  imageUrl?: string;
  alt?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg min-h-0',
        'border-[3px] border-[hsl(var(--comic-caption-border))]',
        'bg-[hsl(var(--comic-panel-bg))]',
        'shadow-[4px_4px_0_0_hsl(var(--comic-caption-border))]',
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className="absolute inset-0 w-full h-full object-contain bg-[hsl(var(--comic-panel-bg))]"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
          {alt || 'Illustration'}
        </div>
      )}
      {children}
    </div>
  );
}
