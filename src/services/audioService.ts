/**
 * audioService — routes every classroom reward / UI sound through the
 * ElevenLabs SFX bank (cached MP3 stingers). Falls back to the local WebAudio
 * synth (`soundEffectsService`) if ElevenLabs is unavailable so the UI is
 * never silent. A single mute flag controls both backends.
 *
 * NOTE: Audio playback in browsers is gated by a user-gesture requirement.
 * The SFX bank handles that internally — calls before the first click are
 * queued and replayed automatically once the user interacts.
 */

import { logger } from '@/utils/logger';
import { soundEffectsService } from '@/services/soundEffectsService';
import { elevenLabsSfxBank, type SfxKey } from '@/services/elevenLabsSfxBank';

let isMuted = false;

function play(key: SfxKey, fallback: () => void) {
  if (isMuted) return;
  elevenLabsSfxBank
    .play(key)
    .then((ok) => {
      if (!ok && elevenLabsSfxBank.isUnlocked()) {
        // Only invoke the WebAudio fallback after first gesture; before that
        // the bank queues the call and will replay on unlock.
        try { fallback(); } catch (err) { logger.debug('audio fallback failed', err); }
      }
    })
    .catch((err) => {
      logger.debug(`SFX "${key}" failed, using fallback`, err);
      try { fallback(); } catch { /* noop */ }
    });
}

export const audioService = {
  playButtonClick: () =>
    play('click', () => soundEffectsService.playButtonClick()),

  playSuccessSound: () =>
    play('success', () => soundEffectsService.playCorrect()),

  playErrorSound: () =>
    play('error', () => soundEffectsService.playIncorrect()),

  /** Tier-aware reward sound — louder + more triumphant the more points awarded. */
  playRewardSound: (points: number = 10) => {
    if (points <= 5) play('reward_small', () => soundEffectsService.playDing());
    else if (points <= 15) play('reward_medium', () => soundEffectsService.playStarEarned());
    else if (points <= 30) play('reward_big', () => soundEffectsService.playPerfectStreak());
    else play('celebration', () => soundEffectsService.playCelebration());
  },

  playCelebrationSound: () =>
    play('celebration', () => soundEffectsService.playCelebration()),

  /** Sticker / badge reveal stinger. */
  playStickerSound: () =>
    play('badge', () => soundEffectsService.playPowerUp()),

  /** Per-emoji reaction sound (clap, laugh, party, thumbs-up, etc.). */
  playEmojiSound: (emoji: string) => {
    const map: Record<string, SfxKey> = {
      '👏': 'emoji_clap',
      '😂': 'emoji_laugh',
      '🎉': 'emoji_party',
      '👍': 'emoji_thumbsup',
      '❤️': 'emoji_heart',
      '❤': 'emoji_heart',
    };
    const key = map[emoji] ?? 'badge';
    play(key, () => soundEffectsService.playPowerUp());
  },

  /** Single-star earned (top bar pop). */
  playStarSound: () =>
    play('star', () => soundEffectsService.playStarEarned()),

  /** Dice roll clatter. */
  playDiceSound: () =>
    play('dice', () => soundEffectsService.playWhoosh()),

  /** Timer near-end warning. */
  playTimerWarningSound: () =>
    play('timer_warning', () => soundEffectsService.playTimerWarning()),

  /** Timer reached zero. */
  playTimerDoneSound: () =>
    play('timer_done', () => soundEffectsService.playDing()),

  playPronunciation: (word: string) => {
    if (isMuted) return;
    logger.debug('Playing pronunciation for:', word);
  },

  // Voice generation handled by elevenlabs-tts function elsewhere.
  hasElevenLabsKey: (): boolean => true,
  setElevenLabsApiKey: (_key: string) => {
    logger.debug('ElevenLabs API key set (server-managed, no-op)');
  },
  generateVoiceMessage: async (message: string, voiceId?: string | number): Promise<void> => {
    logger.debug('Generating voice for (stub):', message, voiceId);
  },

  isSoundMuted: (): boolean => isMuted,

  setMuted: (muted: boolean) => {
    isMuted = muted;
    soundEffectsService.setMuted(muted);
  },

  /** Manually warm the ElevenLabs SFX cache. */
  prefetchSfx: () =>
    elevenLabsSfxBank.prefetch([
      'click', 'star', 'badge', 'dice', 'timer_warning', 'timer_done',
      'reward_small', 'reward_medium', 'reward_big', 'celebration',
      'success', 'error',
    ]),

  /** Wipe the local SFX cache (forces regeneration on next play). */
  clearSfxCache: () => elevenLabsSfxBank.clearCache(),
};
