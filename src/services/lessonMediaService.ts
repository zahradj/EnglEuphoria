/**
 * Lesson Media Service — Orchestrates ElevenLabs TTS & Music Generation
 * 
 * Handles:
 * - Phonics audio (isolated phoneme sounds via ElevenLabs TTS)
 * - Vocabulary audio (word pronunciation via ElevenLabs TTS)
 * - Phonics songs (AI-generated music for Lesson 1 & 5 via ElevenLabs Music)
 * - Storage to Supabase "lesson-assets" bucket with structured naming
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────
export interface MediaManifest {
  unitNumber: number;
  lessonNumber: number;
  phonicsTarget?: string;
  vocabularyList?: string[];
  grammarTarget?: string;
  unitTheme?: string;
  cycleType?: string;
}

export interface MediaGenerationResult {
  phonicsAudioUrl?: string;
  vocabAudioUrls: Record<string, string>;
  songUrl?: string;
  errors: string[];
}

export interface MediaGenerationProgress {
  step: string;
  current: number;
  total: number;
}

// ─── Constants ──────────────────────────────────────────────────
const SUPABASE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s';

/**
 * Build a consistent storage path: unit_X/lesson_Y/type_name.mp3
 */
function buildStoragePath(unit: number, lesson: number, type: 'phonics' | 'vocab' | 'song', name?: string): string {
  const safeName = (name || 'audio').toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `unit_${unit}/lesson_${lesson}/${type}_${safeName}.mp3`;
}

/**
 * Check if an audio asset already exists in storage
 */
async function assetExists(path: string): Promise<string | null> {
  const { data } = supabase.storage.from('lesson-assets').getPublicUrl(path);
  if (!data?.publicUrl) return null;

  // Quick HEAD check
  try {
    const res = await fetch(data.publicUrl, { method: 'HEAD' });
    return res.ok ? data.publicUrl : null;
  } catch {
    return null;
  }
}

/**
 * Generate a single TTS audio via the elevenlabs-tts edge function
 */
async function generateTTS(text: string, speed?: number): Promise<Blob | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        text,
        speed: speed || 0.85, // Slightly slower for learners
      }),
    });

    if (!response.ok) {
      console.error(`TTS failed for "${text}":`, response.status);
      return null;
    }

    return await response.blob();
  } catch (err) {
    console.error(`TTS error for "${text}":`, err);
    return null;
  }
}

/**
 * Generate a phonics song via the elevenlabs-music edge function
 */
async function generateSong(prompt: string, duration: number = 30): Promise<Blob | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-music`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ prompt, duration }),
    });

    if (!response.ok) {
      console.error('Music generation failed:', response.status);
      return null;
    }

    // The edge function returns 200 with a JSON `fallback: true` body when
    // ElevenLabs is over quota. Never treat that as audio — it would play as
    // corrupt/non-ElevenLabs data. Only audio/* content types are valid.
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('audio/')) {
      const body = await response.text().catch(() => '');
      console.error('elevenlabs-music returned non-audio response:', body.slice(0, 200));
      return null;
    }

    return await response.blob();
  } catch (err) {
    console.error('Music generation error:', err);
    return null;
  }
}

/**
 * Upload an audio blob to Supabase storage
 */
async function uploadAudio(path: string, blob: Blob): Promise<string | null> {
  const { error } = await supabase.storage
    .from('lesson-assets')
    .upload(path, blob, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (error) {
    console.error(`Upload failed for ${path}:`, error);
    return null;
  }

  const { data } = supabase.storage.from('lesson-assets').getPublicUrl(path);
  return data?.publicUrl || null;
}

/**
 * Determine if this lesson should generate a song
 * Lessons 1 (Intro/Discovery) and 5 (Review) get songs
 */
function shouldGenerateSong(lessonNumber: number, cycleType?: string): boolean {
  if (lessonNumber === 1 || lessonNumber === 5) return true;
  if (cycleType === 'discovery' || cycleType === 'review') return true;
  return false;
}

/**
 * Determine if audio hints should be disabled (Quiz mode)
 */
function isQuizMode(lessonNumber: number, cycleType?: string): boolean {
  if (lessonNumber === 6) return true;
  if (cycleType === 'quiz') return true;
  return false;
}

/**
 * Build the phonics song prompt for ElevenLabs Music
 */
function buildSongPrompt(manifest: MediaManifest): string {
  const phoneme = manifest.phonicsTarget || 's';
  const vocab = manifest.vocabularyList?.slice(0, 4).join(', ') || '';
  const theme = manifest.unitTheme || 'learning';

  if (manifest.lessonNumber === 5) {
    return `A fun, catchy, educational children's review song about the ${phoneme} sound. ` +
      `Include the words: ${vocab}. Style: upbeat pop for kids aged 4-8, ` +
      `with a simple repeating chorus. Theme: ${theme} review and celebration.`;
  }

  return `A fun, catchy children's phonics song about the "${phoneme}" sound. ` +
    `Repeat the sound "${phoneme}-${phoneme}-${phoneme}" in the chorus. ` +
    `Include words: ${vocab}. Style: bright, educational pop for kids aged 4-8. ` +
    `Theme: discovering the ${theme}.`;
}

// ─── Main Orchestrator ──────────────────────────────────────────

/**
 * Generate all media assets for a lesson based on its manifest.
 * Skips assets that already exist in storage.
 * Returns URLs for all generated/existing assets.
 */
export async function generateLessonMedia(
  manifest: MediaManifest,
  onProgress?: (progress: MediaGenerationProgress) => void
): Promise<MediaGenerationResult> {
  const result: MediaGenerationResult = {
    vocabAudioUrls: {},
    errors: [],
  };

  const { unitNumber, lessonNumber, phonicsTarget, vocabularyList } = manifest;

  // Quiz mode: skip all audio generation
  if (isQuizMode(lessonNumber, manifest.cycleType)) {
    onProgress?.({ step: 'Quiz mode — skipping audio generation', current: 1, total: 1 });
    return result;
  }

  const totalSteps =
    (phonicsTarget ? 1 : 0) +
    (vocabularyList?.length || 0) +
    (shouldGenerateSong(lessonNumber, manifest.cycleType) ? 1 : 0);

  let currentStep = 0;

  // ─── 1. Phonics Audio ───────────────────────────────────────
  if (phonicsTarget) {
    currentStep++;
    onProgress?.({ step: `Generating phonics: /${phonicsTarget}/`, current: currentStep, total: totalSteps });

    const storagePath = buildStoragePath(unitNumber, lessonNumber, 'phonics', phonicsTarget);
    const existing = await assetExists(storagePath);

    if (existing) {
      result.phonicsAudioUrl = existing;
    } else {
      // Generate isolated phoneme sound: "s-s-s" repeated slowly
      const phonemeText = `${phonicsTarget}. ${phonicsTarget}. ${phonicsTarget}.`;
      const blob = await generateTTS(phonemeText, 0.7);
      if (blob) {
        const url = await uploadAudio(storagePath, blob);
        if (url) result.phonicsAudioUrl = url;
        else result.errors.push(`Failed to upload phonics audio for /${phonicsTarget}/`);
      } else {
        result.errors.push(`Failed to generate phonics audio for /${phonicsTarget}/`);
      }
    }
  }

  // ─── 2. Vocabulary Audio ────────────────────────────────────
  if (vocabularyList?.length) {
    for (const word of vocabularyList) {
      currentStep++;
      onProgress?.({ step: `Generating vocab: "${word}"`, current: currentStep, total: totalSteps });

      const storagePath = buildStoragePath(unitNumber, lessonNumber, 'vocab', word);
      const existing = await assetExists(storagePath);

      if (existing) {
        result.vocabAudioUrls[word] = existing;
      } else {
        const blob = await generateTTS(word, 0.85);
        if (blob) {
          const url = await uploadAudio(storagePath, blob);
          if (url) result.vocabAudioUrls[word] = url;
          else result.errors.push(`Failed to upload vocab audio for "${word}"`);
        } else {
          result.errors.push(`Failed to generate vocab audio for "${word}"`);
        }
      }
    }
  }

  // ─── 3. Phonics Song (Lesson 1 & 5 only) ───────────────────
  if (shouldGenerateSong(lessonNumber, manifest.cycleType)) {
    currentStep++;
    onProgress?.({ step: 'Generating phonics song...', current: currentStep, total: totalSteps });

    const storagePath = buildStoragePath(unitNumber, lessonNumber, 'song', `phonics_${phonicsTarget || 'theme'}`);
    const existing = await assetExists(storagePath);

    if (existing) {
      result.songUrl = existing;
    } else {
      const prompt = buildSongPrompt(manifest);
      const blob = await generateSong(prompt, lessonNumber === 5 ? 30 : 30);
      if (blob) {
        const url = await uploadAudio(storagePath, blob);
        if (url) result.songUrl = url;
        else result.errors.push('Failed to upload phonics song');
      } else {
        result.errors.push('Failed to generate phonics song');
      }
    }
  }

  return result;
}
