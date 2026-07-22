import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  /** Emoji shown in the fallback gradient panel when the image fails to load. */
  fallbackEmoji?: string;
  /** Optional gradient class override for the fallback panel. */
  fallbackGradient?: string;
  /** Optional label rendered under the emoji. */
  fallbackLabel?: string;
}

/**
 * Image with a graceful gradient + emoji fallback.
 * If the <img> fires onError, we hide it and reveal a friendly panel —
 * the lesson never shows a broken image icon to a child.
 */
export const SafeSlideImage: React.FC<Props> = ({
  fallbackEmoji = '🎨',
  fallbackGradient = 'from-amber-200 via-pink-200 to-violet-200',
  fallbackLabel,
  className,
  alt = '',
  ...rest
}) => {
  const [errored, setErrored] = useState(false);

  if (errored || !rest.src) {
    return (
      <div
        role="img"
        aria-label={fallbackLabel || alt || 'Illustration'}
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br shadow-md',
          fallbackGradient,
          className,
        )}
      >
        <span className="text-6xl drop-shadow-sm" aria-hidden>
          {fallbackEmoji}
        </span>
        {fallbackLabel && (
          <span className="mt-2 text-sm font-bold text-slate-700/80">{fallbackLabel}</span>
        )}
      </div>
    );
  }

  return (
    <img
      {...rest}
      alt={alt}
      onError={() => setErrored(true)}
      className={className}
    />
  );
};
