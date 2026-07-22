import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches a high-quality image for a slide based on a visual keyword.
 * Uses the ai-image-generation edge function first, falls back to Unsplash.
 */
export async function fetchSlideImage(keyword: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-image-generation', {
      body: {
        prompt: `A flat 2D educational illustration of "${keyword}", clean vector style, bright colors, white background, professional, child-friendly`,
        style: 'flat_2d_educational',
      },
    });

    if (!error && data?.imageUrl) {
      return data.imageUrl;
    }
  } catch (err) {
    console.warn('AI image generation failed, falling back to Unsplash:', err);
  }

  // Fallback: Unsplash source
  return `https://source.unsplash.com/700x500/?${encodeURIComponent(keyword)}`;
}
