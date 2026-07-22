import React, { useState, useEffect, useRef } from 'react';
import { imageGenerationService } from '@/services/imageGeneration';
import { Loader2 } from 'lucide-react';

interface VocabularyImageProps {
  prompt: string;
  alt: string;
  style?: 'educational' | 'cartoon' | 'kawaii-chibi' | 'minimalist' | 'realistic' | 'hand-drawn' | 'flat2d';
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4';
  className?: string;
  fallbackSrc?: string;
  /** Enable Picsart background removal + enhancement (default: true for flat2d/minimalist) */
  postProcess?: boolean;
  /** Anti-cheating: ensures the AI never embeds the literal answer in the image. */
  testSafe?: boolean;
}

// Module-level URL cache keyed by the exact prompt sent to Gemini.
// Survives component remounts so question changes don't refetch the same image.
const URL_CACHE = new Map<string, string>();
const INFLIGHT = new Map<string, Promise<string | null>>();

const ANTI_CHEAT_PREFIX =
  'CRITICAL SYSTEM RULE: This image is for a test. DO NOT include any text, letters, or words in the image. DO NOT reveal the literal answer. Create a generalized, ambiguous visual context only. ';

export const VocabularyImage: React.FC<VocabularyImageProps> = ({
  prompt,
  alt,
  style = 'educational',
  aspectRatio = '1:1',
  className = '',
  fallbackSrc,
  postProcess,
  testSafe = false,
}) => {
  const finalPrompt = testSafe ? `${ANTI_CHEAT_PREFIX}${prompt}` : prompt;
  const cacheKey = `${finalPrompt}::${style}::${aspectRatio}`;

  const [imageUrl, setImageUrl] = useState<string | null>(() => URL_CACHE.get(cacheKey) ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(() => !URL_CACHE.has(cacheKey));
  const [error, setError] = useState<string | null>(null);
  const lastKeyRef = useRef<string | null>(null);

  // Only fetch when the cacheKey changes AND we don't already have it cached.
  useEffect(() => {
    // Skip if we've already handled this exact key in this component instance.
    if (lastKeyRef.current === cacheKey) return;
    lastKeyRef.current = cacheKey;

    // Cache hit — done.
    const cached = URL_CACHE.get(cacheKey);
    if (cached) {
      setImageUrl(cached);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const shouldPostProcess = postProcess ?? (style === 'flat2d' || style === 'minimalist');

    // De-dup parallel callers for the same prompt.
    let p = INFLIGHT.get(cacheKey);
    if (!p) {
      p = imageGenerationService
        .generateImage({
          prompt: finalPrompt,
          style,
          aspectRatio,
          postProcess: shouldPostProcess,
        })
        .then((r) => {
          if (r?.url) URL_CACHE.set(cacheKey, r.url);
          return r?.url ?? null;
        })
        .catch((err) => {
          console.error('[VocabularyImage] generation failed:', err);
          return null;
        })
        .finally(() => {
          INFLIGHT.delete(cacheKey);
        });
      INFLIGHT.set(cacheKey, p);
    }

    p.then((url) => {
      if (cancelled) return;
      if (url) {
        setImageUrl(url);
      } else {
        setError('Failed to generate image');
        if (fallbackSrc) setImageUrl(fallbackSrc);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, finalPrompt, style, aspectRatio, postProcess, fallbackSrc]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg p-4 ${className}`}>
        <p className="text-sm text-muted-foreground text-center">Image unavailable</p>
      </div>
    );
  }

  return (
    <img
      src={imageUrl || ''}
      alt={alt}
      className={`rounded-lg object-cover ${className}`}
      onError={() => {
        if (fallbackSrc && imageUrl !== fallbackSrc) setImageUrl(fallbackSrc);
      }}
    />
  );
};
