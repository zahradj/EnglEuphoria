import { supabase } from '@/integrations/supabase/client';

export interface ImageGenerationResult {
  slideId: string;
  imageUrl: string | null;
  error?: string;
}

/**
 * Generate a single AI image for a slide using the ai-image-generation edge function.
 */
export async function generateSlideImage(
  slideId: string,
  prompt: string,
  style: string = 'educational'
): Promise<ImageGenerationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-image-generation', {
      body: { prompt, style },
    });

    if (error) {
      console.warn(`Image gen failed for ${slideId}:`, error.message);
      return { slideId, imageUrl: null, error: error.message };
    }

    return { slideId, imageUrl: data?.imageUrl || null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.warn(`Image gen error for ${slideId}:`, msg);
    return { slideId, imageUrl: null, error: msg };
  }
}

/**
 * Generate images for multiple slides sequentially (to respect rate limits).
 * Calls onProgress after each image.
 */
export async function generateLessonImages(
  slides: Array<{ id: string; mediaPrompt: string; mediaType?: string }>,
  onProgress?: (completed: number, total: number, current: string) => void
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();
  const total = slides.length;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    onProgress?.(i, total, slide.mediaPrompt);

    const style = slide.mediaType === 'real_photography' ? 'realistic'
      : slide.mediaType === 'cartoon' || slide.mediaType === 'illustration' ? 'cartoon'
      : 'educational';

    const result = await generateSlideImage(slide.id, slide.mediaPrompt, style);

    if (result.imageUrl) {
      imageMap.set(slide.id, result.imageUrl);
    }

    // Small delay between requests to avoid rate limiting
    if (i < slides.length - 1) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  onProgress?.(total, total, 'Done');
  return imageMap;
}
