import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  character?: string;
  side?: 'left' | 'right';
  emotion?: string;
  className?: string;
}

/** Rounded white speech bubble with a tail. */
export function SpeechBubble({ children, character, side = 'left', emotion, className }: Props) {
  return (
    <div className={cn('flex flex-col', side === 'right' ? 'items-end' : 'items-start', className)}>
      {character && (
        <span className="text-[10px] uppercase tracking-widest font-bold text-[hsl(var(--comic-caption-border))] mb-1 px-2">
          {character}{emotion ? ` · ${emotion}` : ''}
        </span>
      )}
      <div
        className={cn(
          'relative max-w-[85%] px-4 py-3 rounded-3xl',
          'bg-[hsl(var(--comic-bubble-bg))] border-2 border-[hsl(var(--comic-caption-border))]',
          'shadow-[3px_3px_0_0_hsl(var(--comic-caption-border))]',
          'text-base leading-relaxed text-[hsl(var(--comic-caption-fg))]',
        )}
      >
        {/* tail */}
        <span
          aria-hidden
          className={cn(
            'absolute -bottom-2 w-4 h-4 rotate-45 bg-[hsl(var(--comic-bubble-bg))] border-[hsl(var(--comic-caption-border))]',
            side === 'left'
              ? 'left-6 border-l-2 border-b-2'
              : 'right-6 border-r-2 border-b-2',
          )}
        />
        {children}
      </div>
    </div>
  );
}
