import { supabase } from '@/integrations/supabase/client';

export interface ImageGenerationOptions {
  prompt: string;
  style?: 'educational' | 'cartoon' | 'kawaii-chibi' | 'minimalist' | 'realistic' | 'hand-drawn' | 'flat2d' | 'cinematic' | 'editorial';
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4';
  quality?: 'high' | 'medium' | 'low';
  background?: 'transparent' | 'white' | 'colored';
  negativePrompt?: string;
  /** Enable Picsart background removal + upscaling */
  postProcess?: boolean;
  /** Persist final image to Supabase Storage */
  persist?: boolean;
  /** Storage path when persist=true (e.g. "unit_1/lesson_2/lion.png") */
  storagePath?: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  cached?: boolean;
  picsartApplied?: boolean;
  persisted?: boolean;
}

class ImageGenerationService {
  private cache = new Map<string, GeneratedImage>();
  
  private generateCacheKey(options: ImageGenerationOptions): string {
    return `${options.prompt}-${options.style}-${options.aspectRatio}-${options.postProcess ? 'pp' : 'raw'}`;
  }

  async generateImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
    const cacheKey = this.generateCacheKey(options);
    
    if (this.cache.has(cacheKey)) {
      return { ...this.cache.get(cacheKey)!, cached: true };
    }

    try {
      const fullPrompt = `${options.prompt}, educational illustration for English learning`;

      
      const response = await supabase.functions.invoke('ai-image-generation', {
        body: {
          prompt: fullPrompt,
          style: options.style || 'educational',
          aspectRatio: options.aspectRatio || '1:1',
          negativePrompt: options.negativePrompt || undefined,
          postProcess: options.postProcess ?? false,
          persist: options.persist ?? false,
          storagePath: options.storagePath,
        }
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to generate image');
      }

      if (!response.data?.imageUrl) {
        console.error('No image URL in response:', response.data);
        throw new Error('No image URL returned from API');
      }

      const result: GeneratedImage = {
        url: response.data.imageUrl,
        prompt: options.prompt,
        style: options.style || 'educational',
        cached: false,
        picsartApplied: response.data.picsartApplied || false,
        persisted: response.data.persisted || false,
      };

      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Image generation failed:', error);
      return {
        url: `https://via.placeholder.com/400x400/e3e3e3/666666?text=${encodeURIComponent(options.prompt.slice(0, 20))}`,
        prompt: options.prompt,
        style: options.style || 'educational',
        cached: false,
      };
    }
  }

  generateContextualPrompt(slideContent: {
    prompt: string;
    type: string;
    level: string;
    topic?: string;
  }): string {
    const { prompt, type, level } = slideContent;
    
    let contextPrompt = `Educational illustration for ${level} level English learning: `;
    
    switch (type) {
      case 'vocabulary':
        contextPrompt += `Visual representation of "${prompt}" for vocabulary learning`;
        break;
      case 'grammar':
        contextPrompt += `Grammar concept illustration showing "${prompt}"`;
        break;
      case 'reading':
        contextPrompt += `Reading comprehension visual aid for "${prompt}"`;
        break;
      case 'listening':
        contextPrompt += `Audio/listening activity illustration for "${prompt}"`;
        break;
      default:
        contextPrompt += prompt;
    }
    
    return contextPrompt;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const imageGenerationService = new ImageGenerationService();
