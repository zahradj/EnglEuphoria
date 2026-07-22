/**
 * @placeholder
 * Audio Placeholder Service — manages audio file references for lessons.
 *
 * Status: Placeholder. Real audio playback is not implemented.
 * Pending integration with a TTS provider (ElevenLabs, Google TTS, etc.).
 *
 * This service generates audio filenames and manifest data for batch
 * processing. The `playAudio()` method is a no-op until TTS is wired in.
 */

import { logger } from '@/utils/logger';

export interface AudioPlaceholder {
  id: string;
  filename: string;
  text: string;
  type: 'vocabulary' | 'sentence' | 'dialogue' | 'feedback' | 'ui' | 'phonics';
  speed?: 'slow' | 'normal' | 'fast';
}

export interface AudioManifest {
  lessonId: string;
  totalAudioFiles: number;
  audioFiles: AudioPlaceholder[];
}

class AudioPlaceholderService {
  private audioCache: Map<string, string> = new Map();
  private currentManifest: AudioManifest | null = null;

  audio(filename: string): string {
    return `audio("${filename}")`;
  }

  registerAudio(audio: Omit<AudioPlaceholder, 'id'>): string {
    const id = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const placeholder: AudioPlaceholder = { id, ...audio };
    
    if (this.currentManifest) {
      this.currentManifest.audioFiles.push(placeholder);
      this.currentManifest.totalAudioFiles++;
    }
    
    return this.audio(audio.filename);
  }

  initManifest(lessonId: string): void {
    this.currentManifest = {
      lessonId,
      totalAudioFiles: 0,
      audioFiles: []
    };
  }

  getManifest(): AudioManifest | null {
    return this.currentManifest;
  }

  generateVocabAudio(word: string): { normal: string; slow: string; fast: string } {
    const sanitized = word.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return {
      normal: `vocab-${sanitized}.mp3`,
      slow: `vocab-${sanitized}-slow.mp3`,
      fast: `vocab-${sanitized}-fast.mp3`
    };
  }

  generateSentenceAudio(sentenceIndex: number, slideId: string): string {
    return `sentence-${slideId}-${sentenceIndex}.mp3`;
  }

  generateDialogueAudio(characterName: string, lineIndex: number): string {
    const sanitized = characterName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `dialogue-${sanitized}-${lineIndex}.mp3`;
  }

  generatePhonicsAudio(sound: string): string {
    const sanitized = sound.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `phonics-${sanitized}.mp3`;
  }

  readonly feedbackAudio = {
    correct: 'feedback-correct.mp3',
    incorrect: 'feedback-incorrect.mp3',
    tryAgain: 'feedback-try-again.mp3',
    excellent: 'feedback-excellent.mp3',
    goodJob: 'feedback-good-job.mp3',
    almostThere: 'feedback-almost.mp3'
  };

  readonly uiAudio = {
    buttonClick: 'ui-button-click.mp3',
    slideTransition: 'ui-slide-transition.mp3',
    starEarned: 'ui-star-earned.mp3',
    levelUp: 'ui-level-up.mp3',
    badgeUnlock: 'ui-badge-unlock.mp3',
    celebration: 'ui-celebration.mp3'
  };

  /**
   * @placeholder No-op until TTS integration is complete.
   * TODO: Wire to ElevenLabs / Google TTS / Azure Speech.
   */
  async playAudio(filename: string): Promise<void> {
    logger.debug('[Audio] Playing (placeholder):', filename);
  }

  exportManifest(): string {
    if (!this.currentManifest) {
      throw new Error('No manifest initialized');
    }
    return JSON.stringify(this.currentManifest, null, 2);
  }

  clearManifest(): void {
    this.currentManifest = null;
  }
}

export const audioService = new AudioPlaceholderService();
export const audio = (filename: string) => audioService.audio(filename);
export const generateVocabAudio = (word: string) => audioService.generateVocabAudio(word);
export const generateSentenceAudio = (index: number, slideId: string) => audioService.generateSentenceAudio(index, slideId);
export const generateDialogueAudio = (character: string, line: number) => audioService.generateDialogueAudio(character, line);
