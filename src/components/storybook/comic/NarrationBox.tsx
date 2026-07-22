import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

/** Yellow parchment caption box, classic Western-comic narration. */
export function NarrationBox({ children, position = 'bottom-left', className }: Props) {
  const pos: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };
  return (
    <div
      className={cn(
        'absolute z-10 max-w-[70%] px-4 py-3 rounded-md',
        'bg-[hsl(var(--comic-caption-bg))] border-2 border-[hsl(var(--comic-caption-border))]',
        'shadow-[4px_4px_0_0_hsl(var(--comic-caption-border))]',
        'font-serif italic text-[hsl(var(--comic-caption-fg))] text-base md:text-lg leading-snug',
        pos[position],
        className,
      )}
    >
      {children}
    </div>
  );
}
