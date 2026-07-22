import { supabase } from '@/integrations/supabase/client';

// Cache for generated audio
const audioCache = new Map<string, string>();

export const ttsService = {
  /**
   * Generate speech from text using OpenAI TTS
   */
  async generateSpeech(text: string, voice: string = 'nova'): Promise<string> {
    const cacheKey = `${text}-${voice}`;
    
    // Check cache first
    if (audioCache.has(cacheKey)) {
      return audioCache.get(cacheKey)!;
    }

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) throw error;

      const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
      
      // Cache the audio
      audioCache.set(cacheKey, audioUrl);
      
      return audioUrl;
    } catch (error) {
      console.error('Audio generation failed:', error);
      throw error;
    }
  },

  /**
   * Play audio from base64 or URL
   */
  playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(reject);
    });
  },

  /**
   * Clear audio cache
   */
  clearCache() {
    audioCache.clear();
  }
};
