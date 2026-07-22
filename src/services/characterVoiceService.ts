import { supabase } from '@/integrations/supabase/client';

export type CharacterType = 
  | 'friendly_teacher'
  | 'story_narrator'
  | 'game_host'
  | 'student_friend'
  | 'playful_character'
  | 'animal_friend'
  | 'magical_guide'
  | 'pronunciation_coach'
  | 'vocabulary_helper'
  | 'default';

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface CharacterVoiceOptions {
  text: string;
  characterType?: CharacterType;
  settings?: VoiceSettings;
}

class CharacterVoiceService {
  private audioCache: Map<string, string> = new Map();

  async generateCharacterVoice(options: CharacterVoiceOptions): Promise<string | null> {
    const { text, characterType = 'default', settings } = options;
    
    // Create cache key
    const cacheKey = `${characterType}:${text}`;
    
    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-character-voices', {
        body: { text, characterType, settings }
      });

      if (error) {
        console.error('Character voice generation error:', error);
        return null;
      }

      if (data?.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        
        // Cache the result
        this.audioCache.set(cacheKey, audioUrl);
        
        return audioUrl;
      }

      return null;
    } catch (error) {
      console.error('Error generating character voice:', error);
      return null;
    }
  }

  async playCharacterVoice(options: CharacterVoiceOptions): Promise<void> {
    const audioUrl = await this.generateCharacterVoice(options);
    
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      await audio.play();
    }
  }

  clearCache(): void {
    this.audioCache.clear();
  }
}

export const characterVoiceService = new CharacterVoiceService();
