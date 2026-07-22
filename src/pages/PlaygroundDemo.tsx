import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Volume2 } from 'lucide-react';
import { usePlaygroundAudio } from '@/hooks/usePlaygroundAudio';
import type { CanvasGameSlide, LivingCanvasSlide, ScaffoldedMediaSlide } from '@/components/creator-studio/shared/canvasSchema';
import engleuphoriaLogo from '@/assets/engleuphoria-logo-dark.png';
import ImmersivePlaygroundShell from '@/components/playground/ImmersivePlaygroundShell';
import {
  MemoryGame, TapOrderGame, HotspotGame, ThumbsGame, SortGame,
  WordBuilderGame, SoundBlendGame, TraceGame, TrailChoiceGame, TrailDragMatchGame,
  MissingLetterGame, PhonicsHuntGame, TrailWordGapGame, VocabGridGame,
  type MemorySlide, type TapOrderSlide, type HotspotSlide, type ThumbsSlide, type SortSlide,
  type WordBuilderSlide, type SoundBlendSlide, type TraceSlide, type MissingLetterSlide, type PhonicsHuntSlide, type TrailWordGapSlide,
  type VocabGridSlide,
} from '@/components/playground-player/playground-games';

/**
 * Playground Engine — content-driven, AI-enhanced mini app.
 *
 * Layers:
 *   🎨 Engine (this file): renderer, navigation, branded UI (Tailwind).
 *   🧩 Content: SLIDES JSON below.
 *   🤖 AI services: ElevenLabs voice via usePlaygroundAudio hook.
 */

// ─── Types — upgraded schema ─────────────────────────────────────────────────
export interface SlideVoice { text: string; autoPlay?: boolean }
export interface SlideFeedback { correct?: string; wrong?: string }

export type Slide =
  | { type: 'intro'; title: string; text?: string; image_url?: string; voice?: SlideVoice }
  | {
      type: 'multiple';
      question: string;
      image_url?: string;
      options: string[];
      answer: string;
      voice?: SlideVoice;
      feedback?: SlideFeedback;
    }
  | {
      type: 'truefalse';
      statement: string;
      image_url?: string;
      answer: boolean;
      voice?: SlideVoice;
      feedback?: SlideFeedback;
    }
  | {
      type: 'fill';
      text: string;
      image_url?: string;
      answer: string;
      voice?: SlideVoice;
      feedback?: SlideFeedback;
    }
  | {
      type: 'drag';
      instruction: string;
      word?: string;
      image_url?: string;
      correctImage?: string;
      distractors?: string[];
      distractorImages?: string[];
      pairs?: { word: string; image_url: string }[];
      voice?: SlideVoice;
      feedback?: SlideFeedback;
    }
  | {
      type: 'match';
      instruction: string;
      pairs: { word: string; image_url: string }[];
      voice?: SlideVoice;
      feedback?: SlideFeedback;
    }
  | { type: 'draw'; prompt: string; image_url?: string; voice?: SlideVoice }
  | {
      type: 'storybook';
      title?: string;
      topic?: string;
      pages: { page_number: number; text: string; image_url?: string; audio_url?: string; image_prompt?: string }[];
      voice?: SlideVoice;
    }
  | {
      type: 'media_player';
      title?: string;
      media_url: string;
      media_kind: 'youtube' | 'audio' | 'video';
      transcript?: string;
      voice?: SlideVoice;
    }
  | {
      type: 'lesson_summary';
      title?: string;
      vocab_recap: string[];
      grammar_recap?: string;
      takeaway?: string;
      voice?: SlideVoice;
    }
  | {
      type: 'vocab_solo';
      word: string;
      definition?: string;
      image_url?: string;
      audio_url?: string;
      voice?: SlideVoice;
    }
  | {
      type: 'phonics_focus';
      phoneme?: string;
      grapheme?: string;
      sound_ipa?: string;
      label?: string;
      example_words?: string[];
      audio_url?: string;
      example_audio?: Record<string, string>;
      voice?: SlideVoice;
    }
  | (MemorySlide & { voice?: SlideVoice })
  | (TapOrderSlide & { voice?: SlideVoice })
  | (HotspotSlide & { voice?: SlideVoice })
  | (ThumbsSlide & { voice?: SlideVoice })
  | (SortSlide & { voice?: SlideVoice })
  | (WordBuilderSlide & { voice?: SlideVoice })
  | (SoundBlendSlide & { voice?: SlideVoice })
  | (TraceSlide & { voice?: SlideVoice })
  | (MissingLetterSlide & { voice?: SlideVoice })
  | (PhonicsHuntSlide & { voice?: SlideVoice })
  | (TrailWordGapSlide & { voice?: SlideVoice })
  | (CanvasGameSlide & { voice?: SlideVoice })
  | (LivingCanvasSlide & { voice?: SlideVoice })
  | (ScaffoldedMediaSlide & { voice?: SlideVoice })
  | (VocabGridSlide & { voice?: SlideVoice });

// ─── Dynamic lesson content ──────────────────────────────────────────────────
const SLIDES: Slide[] = [
  {
    type: 'intro',
    title: '👋 Hello, friend!',
    text: "Let's play and learn English!",
    voice: { text: "Hello friend! Let's play and learn English!", autoPlay: true },
  },
  {
    type: 'phonics_focus',
    phoneme: '/k/',
    grapheme: 'C c',
    label: 'The sound C',
    example_words: ['cat', 'cap', 'cup'],
    voice: { text: 'C makes the sound /k/. Cat. Cap. Cup.', autoPlay: true },
  },
  {
    type: 'vocab_grid',
    instruction: 'New Words — Animals & Things',
    shape: 'circle',
    cards: [
      { word: 'DOG', definition: 'A friendly pet', image_url: 'dog' },
      { word: 'CAT', definition: 'A soft furry pet', image_url: 'cat' },
      { word: 'APPLE', definition: 'A red or green fruit', image_url: 'apple' },
      { word: 'SUN', definition: 'It shines in the sky', image_url: 'sun' },
      { word: 'BALL', definition: 'You can throw it', image_url: 'ball' },
      { word: 'FISH', definition: 'Swims in water', image_url: 'fish' },
    ],
    voice: { text: 'Look at the new words. Tap to listen.', autoPlay: true },
  },
  {
    type: 'sound_blend',
    instruction: 'Tap each sound, then blend them!',
    word: 'cat',
    sounds: ['c', 'a', 't'],
    image_url: 'cat',
    voice: { text: 'Tap each sound, then blend them together!', autoPlay: true },
  },
  {
    type: 'sound_blend',
    instruction: 'Blend the sounds to make a word',
    word: 'sun',
    sounds: ['s', 'u', 'n'],
    image_url: 'sun',
    voice: { text: 'S — U — N. Blend them!', autoPlay: true },
  },
  {
    type: 'word_builder',
    instruction: 'Build the word for the picture',
    word: 'dog',
    image_url: 'dog',
    extras: ['s', 'm', 'a'],
    show_sounds: true,
    voice: { text: 'Build the word: dog', autoPlay: true },
  },
  {
    type: 'missing_letter',
    instruction: 'Fill in the missing letter',
    word: 'cat',
    image_url: 'cat',
    voice: { text: 'What letter is missing?', autoPlay: true },
  } as any,
  {
    type: 'multiple',
    question: 'What is this? 🐶',
    image_url: 'dog',
    options: ['dog', 'cat', 'apple'],
    answer: 'dog',
    voice: { text: 'What is this?', autoPlay: true },
    feedback: { correct: 'Great job! It is a dog!', wrong: 'Try again!' },
  },
  {
    type: 'truefalse',
    statement: 'This is a cat 🐱',
    answer: true,
    voice: { text: 'This is a cat. True or false?', autoPlay: true },
  },
  {
    type: 'memory',
    instruction: 'Flip the cards and find the matching pairs!',
    pairs: [
      { id: 'cat', label: 'cat', emoji: '🐱' },
      { id: 'dog', label: 'dog', emoji: '🐶' },
      { id: 'sun', label: 'sun', emoji: '☀️' },
      { id: 'fish', label: 'fish', emoji: '🐟' },
    ],
    voice: { text: 'Flip the cards and find the matching pairs!', autoPlay: true },
  },
  {
    type: 'sort',
    instruction: 'Sort each word into the right group',
    buckets: [
      { id: 'animals', label: 'Animals', emoji: '🐾' },
      { id: 'things', label: 'Things', emoji: '🎒' },
    ],
    items: [
      { label: 'cat', emoji: '🐱', bucket: 'animals' },
      { label: 'dog', emoji: '🐶', bucket: 'animals' },
      { label: 'fish', emoji: '🐟', bucket: 'animals' },
      { label: 'ball', emoji: '⚽', bucket: 'things' },
      { label: 'apple', emoji: '🍎', bucket: 'things' },
      { label: 'sun', emoji: '☀️', bucket: 'things' },
    ],
    voice: { text: 'Sort each word into the right group', autoPlay: true },
  } as any,
  {
    type: 'tap_order',
    instruction: 'Tap the words in the right order to make a sentence',
    items: [
      { label: 'I' },
      { label: 'see' },
      { label: 'a' },
      { label: 'cat' },
    ],
    voice: { text: 'Make the sentence: I see a cat', autoPlay: true },
  } as any,
  {
    type: 'fill',
    text: 'My name is ____',
    answer: 'Alex',
    voice: { text: 'Say: My name is Alex', autoPlay: true },
  },
  {
    type: 'drag',
    instruction: 'Drag each word onto the right picture',
    pairs: [
      { word: 'APPLE', image_url: 'apple' },
      { word: 'DOG', image_url: 'dog' },
      { word: 'SUN', image_url: 'sun' },
      { word: 'FISH', image_url: 'fish' },
    ],
    voice: { text: 'Drag each word onto the picture', autoPlay: true },
  },
  {
    type: 'match',
    instruction: 'Tap a word, then tap its picture',
    pairs: [
      { word: 'DOG', image_url: 'dog' },
      { word: 'CAT', image_url: 'cat' },
      { word: 'SUN', image_url: 'sun' },
      { word: 'BALL', image_url: 'ball' },
    ],
    voice: { text: 'Match the words to the pictures!', autoPlay: true },
  },
  {
    type: 'thumbs',
    instruction: 'Is this a CAT? 🐱',
    image_url: 'cat',
    answer: true,
    voice: { text: 'Is this a cat? Thumbs up or down!', autoPlay: true },
  } as any,
  {
    type: 'draw',
    prompt: 'Draw your favourite animal!',
    voice: { text: 'Draw your favourite animal!', autoPlay: true },
  },
  {
    type: 'lesson_summary',
    title: 'Great job! 🎉',
    vocab_recap: ['dog', 'cat', 'apple', 'sun', 'ball', 'fish'],
    takeaway: 'You learned the /k/ sound and 6 new words!',
    voice: { text: 'Amazing work! You learned the K sound and six new words!', autoPlay: true },
  },
];

const PLACEHOLDER_IMAGE = '/playground/placeholder-dropzone.svg';

const ensureVoice = (source: any, fallback: string) => ({
  text: source?.voice?.text || source?.instruction || source?.prompt || source?.question || source?.word || source?.title || fallback,
  autoPlay: source?.voice?.autoPlay ?? true,
});

const normalizePairs = (pairs: any[] = []) => pairs.map((p, i) => {
  const word = String(p?.word ?? p?.label ?? p?.left ?? p?.term ?? `Word ${i + 1}`);
  const image = String(p?.image_url ?? p?.image ?? p?.right_image_url ?? p?.right ?? PLACEHOLDER_IMAGE);
  return { word, image_url: image || PLACEHOLDER_IMAGE };
});

const asArray = (value: any): any[] => Array.isArray(value) ? value : [];
const firstText = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return '';
};
const wordFrom = (slide: any, fallback = 'cat') => firstText(
  slide.word,
  slide.target,
  slide.answer,
  slide.answers?.[0],
  slide.items?.[0]?.word,
  slide.items?.[0]?.text,
  slide.items?.[0]?.label,
  fallback,
).toLowerCase();
const soundTilesFor = (slide: any, word: string) => {
  const explicit = asArray(slide.sounds).length ? slide.sounds : asArray(slide.graphemes).length ? slide.graphemes : asArray(slide.letters);
  if (explicit.length) return explicit.map((s) => String(s));
  if (slide.onset || slide.rime) return [slide.onset, slide.rime].filter(Boolean).map(String);
  return word.split('');
};
const imageFrom = (slide: any) => firstText(slide.image_url, slide.image, slide.src, slide.options?.[0]?.image_url, slide.items?.[0]?.image_url) || PLACEHOLDER_IMAGE;
const normalizeMemoryPairs = (items: any[] = []) => (items.length ? items : [{ id: 'cat', label: 'cat', emoji: '🐱' }, { id: 'dog', label: 'dog', emoji: '🐶' }, { id: 'sun', label: 'sun', emoji: '☀️' }]).map((p, i) => {
  const label = firstText(p?.label, p?.word, p?.left, p?.right, p?.text, `Pair ${i + 1}`);
  return { id: firstText(p?.id, label.toLowerCase().replace(/\s+/g, '-'), `pair-${i}`), label, emoji: p?.emoji, image_url: p?.image_url || p?.image || undefined };
});
const normalizeTapItems = (items: any[] = []) => (items.length ? items : ['1', '2', '3', '4']).map((it, i) => ({
  label: firstText(it?.label, it?.text, it?.word, it, String(i + 1)),
  emoji: typeof it === 'object' ? it?.emoji : undefined,
}));
const normalizeHotspotParts = (items: any[] = []) => (items.length ? items : [{ label: 'cat', emoji: '🐱' }, { label: 'dog', emoji: '🐶' }]).map((p, i) => ({
  label: firstText(p?.label, p?.word, p?.text, p?.reveal, `Spot ${i + 1}`),
  emoji: p?.emoji,
  x: p?.x,
  y: p?.y,
  w: p?.w,
  h: p?.h,
}));
const normalizeSortBuckets = (raw: any) => {
  const source = asArray(raw.buckets).length ? raw.buckets : asArray(raw.categories);
  return (source.length ? source : [{ id: 'yes', label: 'Yes', emoji: '✅' }, { id: 'no', label: 'No', emoji: '❌' }]).map((b: any, i: number) => {
    const label = firstText(b?.label, b?.name, b, `Bucket ${i + 1}`);
    return { id: firstText(b?.id, label.toLowerCase().replace(/\s+/g, '-')), label, emoji: b?.emoji };
  });
};
const normalizeSortItems = (raw: any, buckets: { id: string; label: string }[]) => {
  const fromCategories = asArray(raw.categories).flatMap((cat: any, i: number) => asArray(cat?.items).map((item: any) => ({ ...item, bucket: buckets[i]?.id || cat?.id || cat?.label })));
  const source = asArray(raw.items).length ? raw.items : fromCategories;
  return (source.length ? source : [{ label: 'cat', emoji: '🐱', bucket: buckets[0]?.id }, { label: 'dog', emoji: '🐶', bucket: buckets[0]?.id }]).map((it: any, i: number) => ({
    label: firstText(it?.label, it?.word, it?.text, it, `Item ${i + 1}`),
    emoji: it?.emoji,
    image_url: it?.image_url || it?.image,
    bucket: firstText(it?.bucket, it?.bucket_id, it?.answers?.[0], buckets.find((b) => b.label === it?.bucket)?.id, buckets[0]?.id),
  }));
};

/**
 * The lesson agent/importers may emit older Playground names (`matching`,
 * `drag_drop`, `blend_builder`, `cvc_builder`) while the live renderer uses
 * the trail runtime names (`match`, `drag`, `sound_blend`, `word_builder`).
 * Normalize at render-time so generated, imported, and saved lessons never go
 * blank just because one pipeline used the older vocabulary.
 */
export function normalizePlaygroundSlide(input: any): Slide {
  const raw = input || {};
  const interactionData = raw.interaction?.data && typeof raw.interaction.data === 'object' ? raw.interaction.data : {};
  const slide = { ...raw, ...interactionData };
  switch (slide.type) {
    case 'warmup':
      return { ...slide, type: 'intro', title: slide.title || 'Warm up!', text: slide.prompt || slide.text || slide.instruction || '', voice: ensureVoice(slide, 'Warm up') } as Slide;
    case 'phonics_card': {
      const firstExample = asArray(slide.examples)[0] || {};
      return {
        ...slide,
        type: 'phonics_focus',
        phoneme: slide.phoneme,
        grapheme: slide.grapheme,
        label: slide.mouth_hint || slide.instruction || 'Listen to the sound',
        example_words: asArray(slide.examples).map((e: any) => firstText(e?.word, e)).filter(Boolean),
        image_url: firstExample.image_url,
        voice: ensureVoice(slide, slide.grapheme || slide.phoneme || 'Listen'),
      } as Slide;
    }
    case 'poll':
    case 'sound_spotting':
    case 'article_picker':
    case 'audio_to_image_match':
    case 'sound_discrimination':
    case 'minimal_pairs':
    case 'minimal_pair_tap':
    case 'pronunciation_tap':
    case 'beginning_sound':
    case 'ending_sound':
      return {
        ...slide,
        type: 'multiple',
        question: slide.question || slide.prompt || slide.instruction || slide.audio_prompt || `Choose ${slide.correct || slide.answers?.[0] || slide.word || 'the answer'}`,
        image_url: imageFrom(slide),
        options: asArray(slide.options).map((o: any) => firstText(o?.label, o?.word, o?.id, o)).filter(Boolean).length
          ? asArray(slide.options).map((o: any) => firstText(o?.label, o?.word, o?.id, o)).filter(Boolean)
          : asArray(slide.items?.[0]?.options).length ? slide.items[0].options : [firstText(slide.correct, slide.answers?.[0], slide.word, 'cat'), firstText(slide.pair?.[1], 'dog')],
        answer: firstText(slide.correct, slide.answer, slide.answers?.[0], slide.items?.[0]?.answers?.[0], asArray(slide.options)[0]?.word, asArray(slide.options)[0], 'cat'),
        voice: ensureVoice(slide, 'Choose the answer'),
      } as Slide;
    case 'phoneme_tap':
    case 'sound_hunt_words':
    case 'phonics_hunt':
      return {
        ...slide,
        type: 'phonics_hunt',
        instruction: slide.instruction || slide.prompt || `Find words that start with ${slide.letter || slide.grapheme || slide.target_phoneme || 'a'}`,
        letter: firstText(slide.letter, slide.grapheme, slide.target_phoneme, slide.phoneme, 'a').replace(/[\/]/g, '').slice(0, 1),
        items: (asArray(slide.items).length ? slide.items : asArray(slide.options)).map((item: any) => {
          const word = firstText(item?.word, item?.label, item?.text, item, 'apple');
          return {
            word,
            image_url: item?.image_url || item?.image || undefined,
            has_letter: item?.has_letter ?? item?.starts_with ?? word.toLowerCase().startsWith(firstText(slide.letter, slide.grapheme, slide.target_phoneme, 'a').replace(/[\/]/g, '').slice(0, 1).toLowerCase()),
          };
        }),
        voice: ensureVoice(slide, 'Find the sound'),
      } as Slide;
    case 'fill_blank':
      return {
        ...slide,
        type: 'fill',
        text: slide.text || slide.sentence || slide.sentences?.[0]?.text || 'I see a ____',
        answer: firstText(slide.answer, slide.answers?.[0], slide.sentences?.[0]?.answers?.[0], slide.word),
        options: slide.options || slide.tiles,
        voice: ensureVoice(slide, 'Fill the blank'),
      } as Slide;
    case 'missing_letter':
    case 'letter_gap':
    case 'cvc_gap':
      return {
        ...slide,
        type: 'missing_letter',
        instruction: slide.instruction || slide.prompt || 'What letter is missing?',
        word: wordFrom(slide),
        image_url: imageFrom(slide),
        missing_letter: firstText(slide.missing_letter, slide.letter, slide.answer, slide.answers?.[0]),
        missing_position: typeof slide.missing_position === 'number' ? slide.missing_position : typeof slide.missingPosition === 'number' ? slide.missingPosition : undefined,
        voice: ensureVoice(slide, 'Find the missing letter'),
      } as Slide;
    case 'pronunciation':
    case 'echo_repetition':
    case 'listen_and_repeat':
      return {
        ...slide,
        type: 'vocab_solo',
        word: firstText(slide.word, slide.text, slide.items?.[0]?.text, slide.items?.[0]?.word, 'Say it'),
        definition: firstText(slide.tip, slide.ipa, slide.mouth_hint, 'Listen and repeat.'),
        image_url: imageFrom(slide),
        voice: ensureVoice(slide, firstText(slide.word, slide.items?.[0]?.audio_prompt, 'Repeat')),
      } as Slide;
    case 'speaking_mission':
    case 'roleplay':
      return {
        ...slide,
        type: 'intro',
        title: slide.title || 'Speaking Mission',
        text: slide.mission || slide.scene || slide.prompt || 'Say it out loud!',
        voice: ensureVoice(slide, 'Your turn to speak'),
      } as Slide;
    case 'memory':
    case 'memory_match':
      return {
        ...slide,
        type: 'memory',
        instruction: slide.instruction || slide.prompt || 'Find the matching pairs!',
        pairs: normalizeMemoryPairs(slide.pairs || slide.matches || slide.items),
        voice: ensureVoice(slide, 'Find the matching pairs'),
      } as Slide;
    case 'tap_order':
    case 'sequencing':
    case 'audio_sequence':
    case 'tap_the_grapheme':
      return {
        ...slide,
        type: 'tap_order',
        instruction: slide.instruction || slide.prompt || 'Tap them in order!',
        items: normalizeTapItems(slide.items || slide.tiles || slide.answers || slide.calls),
        voice: ensureVoice(slide, 'Tap in order'),
      } as Slide;
    case 'thumbs':
      return {
        ...slide,
        type: 'thumbs',
        instruction: slide.instruction || slide.prompt || 'Do you like it?',
        items: (asArray(slide.items).length ? slide.items : [{ label: 'ice cream', emoji: '🍦', correct: 'like' }, { label: 'spider', emoji: '🕷️', correct: 'dislike' }]).map((it: any) => ({
          label: firstText(it?.label, it?.word, it?.text, 'item'),
          emoji: it?.emoji,
          image_url: it?.image_url || it?.image,
          correct: it?.correct === 'dislike' || it?.answer === 'dislike' || it?.like === false ? 'dislike' : 'like',
        })),
        voice: ensureVoice(slide, 'Choose thumbs up or down'),
      } as Slide;
    case 'sound_hunt':
    case 'phoneme_isolation':
    case 'grapheme_hunt':
    case 'hotspot':
      return {
        ...slide,
        type: 'hotspot',
        instruction: slide.instruction || slide.prompt || `Find ${slide.target_phoneme || slide.target_grapheme || 'the sound'}`,
        image_url: imageFrom(slide),
        parts: normalizeHotspotParts(slide.parts || slide.hotspots || slide.pictures || slide.items || slide.options),
        prompts: asArray(slide.prompts).length ? slide.prompts : normalizeHotspotParts(slide.parts || slide.hotspots || slide.pictures || slide.items || slide.options).filter((p) => p.label).map((p) => p.label),
        voice: ensureVoice(slide, 'Tap the right one'),
      } as Slide;
    case 'sound_sorting':
    case 'grammar_sort':
    case 'sort': {
      const buckets = normalizeSortBuckets(slide);
      return {
        ...slide,
        type: 'sort',
        instruction: slide.instruction || slide.prompt || 'Sort them out!',
        buckets,
        items: normalizeSortItems(slide, buckets),
        voice: ensureVoice(slide, 'Sort them out'),
      } as Slide;
    }
    case 'trace_letter':
    case 'trace_word':
      return {
        ...slide,
        type: 'trace',
        instruction: slide.instruction || slide.prompt || `Trace ${slide.letter || slide.word || slide.example_word || 'the sound'}`,
        letter: slide.letter || slide.word?.[0] || slide.example_word?.[0],
        word: slide.word || slide.example_word,
        phoneme: slide.phoneme,
        image_url: imageFrom(slide),
        voice: ensureVoice(slide, 'Trace it'),
      } as Slide;
    case 'matching':
    case 'matching_pairs':
    case 'vocab_match_board':
    case 'listen_match':
    case 'listen_and_match':
    case 'rhyme_match':
      return {
        ...slide,
        type: 'match',
        instruction: slide.instruction || slide.prompt || 'Tap a word, then tap its picture',
        pairs: normalizePairs(slide.pairs || slide.matches || slide.items),
        voice: ensureVoice(slide, 'Match them!'),
      } as Slide;
    case 'drag_drop':
    case 'drag_word_to_picture':
    case 'word_to_picture': {
      const rawPairs = asArray(slide.pairs).length ? slide.pairs : asArray(slide.matches);
      const pairs = rawPairs.length ? normalizePairs(rawPairs) : undefined;
      return {
        ...slide,
        type: 'drag',
        instruction: slide.instruction || slide.prompt || 'Drag the word onto the picture',
        word: pairs ? undefined : String(slide.word || slide.answer || slide.items?.[0]?.label || 'CAT').toUpperCase(),
        image_url: pairs ? undefined : (slide.image_url || slide.target_image_url || slide.items?.[0]?.image_url || PLACEHOLDER_IMAGE),
        distractors: pairs ? undefined : (slide.distractors || slide.options?.filter?.((o: string) => o !== slide.answer) || []),
        pairs,
        voice: ensureVoice(slide, 'Drag the correct word'),
      } as Slide;
    }
    case 'vocab_grid':
    case 'vocabulary_cards':
    case 'vocab_showcase': {
      const rawCards = asArray(slide.cards).length
        ? slide.cards
        : asArray(slide.items).length
          ? slide.items
          : asArray(slide.vocabulary).length
            ? slide.vocabulary
            : asArray(slide.words).map((w: any) => (typeof w === 'string' ? { word: w } : w));
      const cards = rawCards.map((c: any) => ({
        word: String(c?.word || c?.term || c?.label || c?.text || '').toUpperCase() || 'WORD',
        definition: c?.definition || c?.meaning || c?.translation || undefined,
        image_url: c?.image_url || c?.image || undefined,
      }));
      return {
        ...slide,
        type: 'vocab_grid',
        instruction: slide.instruction || slide.title || 'New Words',
        shape: slide.shape === 'square' ? 'square' : 'circle',
        cards: cards.length ? cards : [{ word: 'WORD' }],
        voice: ensureVoice(slide, 'New words'),
      } as Slide;
    }
    case 'sound_blend':
    case 'blend_builder':
    case 'blending_animation':
      return {
        ...slide,
        type: 'sound_blend',
        instruction: slide.instruction || slide.prompt || 'Tap each sound, then blend!',
        word: wordFrom(slide.do_step || slide),
        sounds: soundTilesFor(slide.do_step || slide, wordFrom(slide.do_step || slide)),
        image_url: imageFrom(slide.do_step || slide),
        voice: ensureVoice(slide, 'Blend the sounds'),
      } as Slide;
    case 'word_builder':
    case 'cvc_builder':
    case 'drag_the_letters':
    case 'decode_the_word':
    case 'onset_rime_builder':
    case 'missing_sound':
    case 'dictation_builder':
      return {
        ...slide,
        type: 'word_builder',
        instruction: slide.instruction || slide.prompt || 'Build the word!',
        word: wordFrom(slide),
        extras: asArray(slide.extras).length ? slide.extras : asArray(slide.distractors),
        show_sounds: slide.show_sounds ?? true,
        image_url: imageFrom(slide),
        voice: ensureVoice(slide, 'Build the word'),
      } as Slide;
    case 'visual_sentence_builder':
    case 'sentence_builder':
    case 'grammar_blocks':
    case 'sentence_transform':
      return {
        ...slide,
        type: 'fill',
        text: slide.text || slide.sentence || slide.prompt || slide.frame || 'I see a ____',
        answer: slide.answer || slide.correct_answer || slide.answers?.[0] || slide.word || '',
        options: slide.options || slide.tokens || slide.blocks || slide.chunks,
        voice: ensureVoice(slide, 'Build the sentence'),
      } as Slide;
    default:
      return slide as Slide;
  }
}

// ─── Animations ──────────────────────────────────────────────────────────────
const correctAnim = { scale: [1, 1.08, 1], transition: { duration: 0.4 } };
const wrongAnim = { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } };

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FE6A2F', '#FFB703', '#FEFBDD', '#FFD166'],
  });
}

// ─── Voice button ────────────────────────────────────────────────────────────
function VoiceButton({ text }: { text?: string }) {
  const { playVoice, isPlaying } = usePlaygroundAudio();
  if (!text) return null;
  return (
    <button
      onClick={() => playVoice(text)}
      className="absolute top-4 right-4 w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg flex items-center justify-center transition-transform active:scale-95"
      aria-label="Listen"
    >
      <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
    </button>
  );
}

// ─── Auto-play wrapper ───────────────────────────────────────────────────────
function useAutoVoice(voice?: SlideVoice) {
  const { playVoice } = usePlaygroundAudio();
  useEffect(() => {
    if (voice?.autoPlay && voice.text) {
      const t = setTimeout(() => playVoice(voice.text), 350);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice?.text, voice?.autoPlay]);
}

// ─── Games ───────────────────────────────────────────────────────────────────
export interface PlaygroundLessonContext {
  lessonTitle?: string;
  level?: string;
  unitNumber?: number | string;
  unitTitle?: string;
  lessonNumber?: number | string;
  hub?: 'playground' | 'academy' | 'success' | 'professional';
}

// Hub bubble palette — matches the homepage brand coating per workspace rules.
const HUB_BUBBLE: Record<string, { bubble: string; accent: string; ring: string; pillBg: string; pillText: string; titleText: string }> = {
  playground: {
    bubble: '#FE6A2F',  // Playground orange
    accent: '#FBBF24',  // warm yellow accent
    ring: 'rgba(254,106,47,0.25)',
    pillBg: 'bg-orange-100',
    pillText: 'text-orange-700',
    titleText: 'text-orange-600',
  },
  academy: {
    bubble: '#6B21A8',  // Academy purple
    accent: '#A855F7',
    ring: 'rgba(107,33,168,0.25)',
    pillBg: 'bg-purple-100',
    pillText: 'text-purple-700',
    titleText: 'text-purple-700',
  },
  success: {
    bubble: '#059669',  // Success emerald
    accent: '#14B8A6',
    ring: 'rgba(5,150,105,0.25)',
    pillBg: 'bg-emerald-100',
    pillText: 'text-emerald-700',
    titleText: 'text-emerald-700',
  },
};
HUB_BUBBLE.professional = HUB_BUBBLE.success;

function Intro({
  slide,
  lessonContext,
}: {
  slide: Extract<Slide, { type: 'intro' }>;
  lessonContext?: PlaygroundLessonContext;
}) {
  useAutoVoice(slide.voice);

  const ctx = lessonContext || {};
  const hub = ctx.hub || 'playground';
  const palette = HUB_BUBBLE[hub] || HUB_BUBBLE.playground;
  const headline = ctx.lessonTitle || slide.title;
  const subtitle = slide.text;

  const unitLessonLine = (() => {
    const parts: string[] = [];
    if (ctx.unitNumber != null) parts.push(`Unit ${ctx.unitNumber}`);
    if (ctx.unitTitle) parts.push(ctx.unitTitle);
    if (ctx.lessonNumber != null) parts.push(`Lesson ${ctx.lessonNumber}`);
    return parts.join(' · ');
  })();

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-white grid grid-cols-1 md:grid-cols-2 min-h-[360px] border"
      style={{ borderColor: `${palette.bubble}22` }}
    >
      {/* LEFT — full-bleed topic image */}
      <div className="relative h-full min-h-[280px] w-full overflow-hidden" style={{ background: `${palette.bubble}10` }}>
        {slide.image_url ? (
          <img
            src={slide.image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-7xl"
            style={{
              background: `linear-gradient(135deg, ${palette.bubble}33, ${palette.accent}33)`,
              color: palette.bubble,
            }}
            aria-hidden
          >
            🎨
          </div>
        )}
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{ background: `linear-gradient(90deg, ${palette.bubble}, ${palette.accent})` }}
        />
      </div>

      {/* RIGHT — metadata panel */}
      <div
        className="relative h-full w-full px-6 md:px-10 py-8 flex flex-col justify-center"
        style={{
          background: `linear-gradient(180deg, #FFFFFF 0%, ${palette.bubble}0D 100%)`,
        }}
      >
        {/* Logo bubble — top-right, hub-coated like the homepage */}
        <div className="absolute top-4 right-5 flex items-center gap-2.5">
          <span
            className="inline-flex items-center justify-center h-11 w-11 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${palette.accent}, ${palette.bubble} 70%)`,
              boxShadow: `0 4px 14px ${palette.ring}, inset 0 -2px 4px rgba(0,0,0,0.08)`,
            }}
            aria-hidden
          >
            <img
              src={engleuphoriaLogo}
              alt=""
              className="h-7 w-7 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </span>
          <span className="text-sm font-extrabold tracking-tight text-slate-800">
            EnglEuphoria
          </span>
        </div>

        <div className="flex flex-col gap-3 max-w-md mt-12 md:mt-0">
          {ctx.level && (
            <span
              className={`inline-flex self-start items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest ${palette.pillBg} ${palette.pillText}`}
            >
              {ctx.level}
            </span>
          )}

          {unitLessonLine && (
            <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {unitLessonLine}
            </p>
          )}

          <h1 className={`font-extrabold text-3xl md:text-4xl lg:text-5xl ${palette.titleText} leading-[1.05] drop-shadow-sm`}>
            {headline}
          </h1>

          {subtitle && (
            <p className="text-base md:text-lg text-slate-700 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}

          <div
            className="mt-2 h-1 w-20 rounded-full"
            style={{ background: `linear-gradient(90deg, ${palette.bubble}, ${palette.accent})` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTIPLE CHOICE — staggered card entrance, lettered badges (A/B/C), image
// support, retry-on-wrong, focus ring for keyboard, success haloing.
// Schema-preserving: still reads `options`, `answer`, optional `image_url`
// and `option_images[]`.
// ─────────────────────────────────────────────────────────────────────────────
function MultipleChoice({ slide }: { slide: Extract<Slide, { type: 'multiple' }> }) {
  // Per project rule: do NOT auto-speak full questions/sentences in Playground.
  const { playCorrect, playWrong, playVoice } = usePlaygroundAudio();
  const [picked, setPicked] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const correct = picked === slide.answer;
  const locked = !!picked && correct;
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handle = (opt: string) => {
    if (locked) return;
    setPicked(opt);
    // Speak the chosen word (only the word, never the full question).
    playVoice(opt);
    if (opt === slide.answer) {
      fireConfetti();
      playCorrect(slide.feedback?.correct);
    } else {
      setAttempts((n) => n + 1);
      playWrong(slide.feedback?.wrong);
      // Reset selection so the learner can retry — modern game feel.
      setTimeout(() => setPicked((p) => (p === opt ? null : p)), 700);
    }
  };

  return (
    <motion.div
      animate={picked ? (correct ? correctAnim : wrongAnim) : undefined}
      className="flex flex-col items-center gap-8 w-full"
    >
      {slide.image_url && (
        <motion.img
          src={slide.image_url}
          alt=""
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-44 h-44 rounded-2xl object-cover shadow-md"
        />
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-center">{slide.question}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        {slide.options.map((opt, i) => {
          const isPicked = picked === opt;
          const isAnswer = opt === slide.answer;
          const optImg = (slide as any).option_images?.[i] as string | undefined;
          const showState = locked || (isPicked && !isAnswer);
          let cls = 'bg-gradient-to-br from-orange-500 to-amber-500 hover:shadow-xl text-white border-orange-700/30';
          if (showState && isAnswer) cls = 'bg-green-500 text-white border-green-700/40 ring-4 ring-green-300';
          else if (showState && isPicked && !isAnswer) cls = 'bg-red-500 text-white border-red-700/40';
          else if (locked) cls = 'bg-orange-200 text-orange-900 border-orange-300';
          return (
            <motion.button
              key={opt}
              onClick={() => handle(opt)}
              disabled={locked}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 240, damping: 22 }}
              whileHover={locked ? undefined : { y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`${cls} relative font-extrabold rounded-2xl shadow-md p-4 transition-all border-2 flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300`}
              aria-label={`Option ${LETTERS[i]}: ${opt}`}
            >
              <span
                aria-hidden
                className="absolute top-2 left-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/25 text-xs font-black"
              >
                {LETTERS[i]}
              </span>
              {optImg && (
                <img src={optImg} alt={opt} className="w-24 h-24 rounded-xl object-cover bg-white/20" />
              )}
              <span className="text-2xl mt-1">{opt}</span>
            </motion.button>
          );
        })}
      </div>
      {attempts > 0 && !locked && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-sm font-bold text-orange-600"
        >
          Try again! You can do it 💪
        </motion.p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUE / FALSE — large tactile cards with iconography, hover lift, locked
// reveal of correct answer, retry-on-wrong (so the moment teaches).
// ─────────────────────────────────────────────────────────────────────────────
function TrueFalse({ slide }: { slide: Extract<Slide, { type: 'truefalse' }> }) {
  useAutoVoice(slide.voice);
  const { playCorrect, playWrong } = usePlaygroundAudio();
  const [picked, setPicked] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const isCorrectPick = picked !== null && picked === slide.answer;
  const locked = isCorrectPick;

  const handle = (val: boolean) => {
    if (locked) return;
    setPicked(val);
    if (val === slide.answer) { fireConfetti(); playCorrect(slide.feedback?.correct); }
    else {
      setAttempts((n) => n + 1);
      playWrong(slide.feedback?.wrong);
      setTimeout(() => setPicked((p) => (p === val ? null : p)), 700);
    }
  };

  const cardCls = (val: boolean) => {
    const isPicked = picked === val;
    const isAnswer = slide.answer === val;
    const base = 'relative flex-1 max-w-[220px] rounded-3xl shadow-md px-8 py-7 font-extrabold text-2xl flex flex-col items-center gap-2 transition-all border-2 focus:outline-none focus-visible:ring-4';
    if (locked && isAnswer) return `${base} bg-green-500 text-white border-green-700/40 ring-4 ring-green-300 focus-visible:ring-green-300`;
    if (isPicked && !isAnswer) return `${base} bg-red-500 text-white border-red-700/40 focus-visible:ring-red-300`;
    if (val) return `${base} bg-gradient-to-br from-green-500 to-emerald-500 text-white border-green-700/30 focus-visible:ring-green-300`;
    return `${base} bg-gradient-to-br from-rose-500 to-red-500 text-white border-red-700/30 focus-visible:ring-rose-300`;
  };

  return (
    <motion.div
      animate={picked !== null ? (isCorrectPick ? correctAnim : wrongAnim) : undefined}
      className="flex flex-col items-center gap-8 w-full"
    >
      {slide.image_url && (
        <motion.img
          src={slide.image_url}
          alt=""
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="w-44 h-44 rounded-2xl object-cover shadow-md"
        />
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-center max-w-2xl leading-snug">
        {slide.statement}
      </h2>
      <div className="flex gap-6 w-full justify-center">
        {[true, false].map((val, i) => (
          <motion.button
            key={String(val)}
            onClick={() => handle(val)}
            disabled={locked}
            initial={{ opacity: 0, y: 12, rotate: val ? -3 : 3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.05 * i, type: 'spring', stiffness: 240, damping: 22 }}
            whileHover={locked ? undefined : { y: -5, scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className={cardCls(val)}
            aria-label={val ? 'True' : 'False'}
          >
            <span className="text-5xl leading-none">{val ? '✓' : '✗'}</span>
            <span>{val ? 'True' : 'False'}</span>
          </motion.button>
        ))}
      </div>
      {attempts > 0 && !locked && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-sm font-bold text-orange-600"
        >
          Not quite — listen again and try once more 🎧
        </motion.p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILL BLANK — inline gap input + optional draggable word-chip mode.
// Schema-preserving: still reads `text`, `answer`, `image_url`, `voice`.
// Bonus: if the lesson JSON supplies `options: string[]` (read loosely), we
// render a tactile chip-into-blank experience instead of a text field.
// ─────────────────────────────────────────────────────────────────────────────
function FillBlank({ slide }: { slide: Extract<Slide, { type: 'fill' }> }) {
  useAutoVoice(slide.voice);
  const { playCorrect, playWrong } = usePlaygroundAudio();
  const loose = slide as unknown as { options?: string[]; image_url?: string };
  const chipMode = Array.isArray(loose.options) && loose.options.length > 0;

  const [val, setVal] = useState('');
  const [chip, setChip] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [parts] = useState(() => {
    // Robust blank detection: any run of 2+ underscores, or the literal token [blank].
    const re = /(_{2,}|\[blank\])/i;
    const raw = slide.text || '';
    if (re.test(raw)) {
      const [before, , after = ''] = raw.split(re);
      return [before ?? '', after];
    }
    // No blank marker found → put the input at the end of the sentence.
    return [raw.replace(/\s+$/, '') + ' ', ''];
  });

  const current = chipMode ? (chip ?? '') : val;
  const correct = current.trim().toLowerCase() === slide.answer.toLowerCase();

  const submit = () => {
    if (!current.trim()) return;
    setSubmitted(true);
    if (correct) { fireConfetti(); playCorrect(slide.feedback?.correct); }
    else playWrong(slide.feedback?.wrong);
  };

  // Auto-submit when a chip is dropped (tactile feedback loop).
  const dropChip = (word: string) => {
    setChip(word);
    setSubmitted(true);
    if (word.trim().toLowerCase() === slide.answer.toLowerCase()) {
      fireConfetti();
      playCorrect(slide.feedback?.correct);
    } else {
      playWrong(slide.feedback?.wrong);
      setTimeout(() => { setChip(null); setSubmitted(false); }, 700);
    }
  };

  const inputW = Math.max(96, Math.min(320, (current.length || slide.answer.length) * 18 + 48));

  return (
    <motion.div
      animate={submitted ? (correct ? correctAnim : wrongAnim) : undefined}
      className="flex flex-col items-center gap-8 w-full"
    >
      {loose.image_url && (
        <img src={loose.image_url} alt="" className="w-44 h-44 rounded-2xl object-cover shadow-md" />
      )}

      <div className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center gap-3 flex-wrap justify-center leading-relaxed">
        <span>{parts[0]}</span>

        {chipMode ? (
          <motion.span
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault(); setOver(false);
              const w = e.dataTransfer.getData('text/plain');
              if (w) dropChip(w);
            }}
            animate={{ scale: over ? 1.08 : 1 }}
            className={`inline-flex items-center justify-center min-w-[120px] min-h-[56px] px-5 rounded-2xl border-4 border-dashed transition-colors font-extrabold ${
              submitted && correct ? 'border-green-500 bg-green-100 text-green-700' :
              submitted && !correct ? 'border-red-400 bg-red-50 text-red-600' :
              over ? 'border-orange-500 bg-orange-100 text-orange-700' :
              chip ? 'border-orange-500 bg-orange-50 text-orange-700' :
              'border-orange-300 bg-orange-50/40 text-orange-400'
            }`}
          >
            {chip ?? '⬇'}
          </motion.span>
        ) : (
          <motion.input
            value={val}
            onChange={(e) => { setVal(e.target.value); setSubmitted(false); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            animate={{ width: inputW }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className={`text-center font-extrabold rounded-2xl px-4 py-2 border-b-4 outline-none transition-all bg-orange-50/60 focus:bg-white focus:shadow-[0_0_0_4px_rgba(254,106,47,0.18)] ${
              submitted
                ? (correct ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-600 bg-red-50')
                : 'border-orange-500 text-orange-600 focus:border-orange-600'
            }`}
            placeholder="…"
            inputMode="text"
            autoComplete="off"
            aria-label="Fill in the blank"
          />
        )}

        <span>{parts[1]}</span>
      </div>

      {chipMode ? (
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl">
          {loose.options!.map((w) => (
            <WordChip key={w} word={w} disabled={chip === w && correct} />
          ))}
        </div>
      ) : (
        <button
          onClick={submit}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold rounded-2xl shadow-md px-8 py-3 active:scale-95 transition"
        >
          Check
        </button>
      )}
    </motion.div>
  );
}

/** Tactile draggable word chip — works on mouse + touch via HTML5 + pointer fallback. */
function WordChip({ word, disabled }: { word: string; disabled?: boolean }) {
  const [grabbed, setGrabbed] = useState(false);
  return (
    <motion.div
      role="button"
      tabIndex={disabled ? -1 : 0}
      draggable={!disabled}
      onDragStart={(e) => {
        (e as unknown as React.DragEvent).dataTransfer.setData('text/plain', word);
        setGrabbed(true);
      }}
      onDragEnd={() => setGrabbed(false)}
      whileTap={{ scale: 0.94 }}
      whileHover={disabled ? undefined : { y: -4, scale: 1.04 }}
      animate={{ opacity: disabled ? 0.4 : 1, scale: grabbed ? 1.05 : 1 }}
      className={`select-none cursor-grab active:cursor-grabbing rounded-2xl px-5 py-3 text-2xl font-extrabold shadow-md border-2 ${
        disabled
          ? 'bg-green-100 text-green-700 border-green-300'
          : 'bg-gradient-to-br from-orange-400 to-amber-500 text-white border-orange-600/40 hover:shadow-lg'
      }`}
    >
      {word}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAG & DROP — pointer-based (works on mouse + touch + stylus), live hover
// ring on the drop-zone, smooth snap, satisfying success state.
// ─────────────────────────────────────────────────────────────────────────────
function DragDrop({ slide }: { slide: Extract<Slide, { type: 'drag' }> }) {
  useAutoVoice(slide.voice);
  const { playCorrect, playWrong } = usePlaygroundAudio();
  const [solved, setSolved] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Build a shuffled chip list: correct + up to 2 distractors. Stable per slide.
  const chips = useMemo(() => {
    const correct = slide.word;
    const dWords = slide.distractors ?? [];
    const dImgs = slide.distractorImages ?? [];
    const extras = dWords
      .map((w, i) => ({ w, img: dImgs[i] ?? '' }))
      .filter(({ w }) => w && w.toUpperCase() !== correct.toUpperCase())
      .slice(0, 2);
    const pool: { w: string; img: string }[] = [{ w: correct, img: slide.correctImage ?? '' }, ...extras];
    // Deterministic shuffle keyed on the correct word so order is stable across renders.
    const seed = correct.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return pool
      .map((c, i) => ({ ...c, k: (i + 1) * 31 + (seed % (i + 2)) }))
      .sort((a, b) => a.k - b.k)
      .map(({ w, img }) => ({ w, img }));
  }, [slide.word, slide.distractors, slide.distractorImages, slide.correctImage]);

  const pointInDrop = (x: number, y: number) => {
    const el = dropRef.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  const onPointerDown = (id: string) => (e: React.PointerEvent) => {
    if (solved) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ id, x: e.clientX, y: e.clientY });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
    setHover(pointInDrop(e.clientX, e.clientY));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const id = drag.id;
    const inside = pointInDrop(e.clientX, e.clientY);
    setDrag(null); setHover(false);
    if (!inside) return;
    if (id.toUpperCase() === slide.word.toUpperCase()) {
      setSolved(true);
      fireConfetti();
      playCorrect(slide.feedback?.correct);
    } else {
      setWrongId(id);
      playWrong(slide.feedback?.wrong);
      setTimeout(() => setWrongId(null), 500);
    }
  };

  const dragOffsetFor = (id: string) => {
    if (!drag || drag.id !== id) return { x: 0, y: 0 };
    const rect = chipRefs.current[id]?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: drag.x - rect.left - rect.width / 2, y: drag.y - rect.top - rect.height / 2 };
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <h2 className="text-3xl font-bold text-slate-800 text-center">{slide.instruction}</h2>

      {/* Picture clue / drop zone */}
      <motion.div
        ref={dropRef}
        animate={wrongId ? wrongAnim : solved ? correctAnim : { scale: hover ? 1.04 : 1 }}
        className={`relative rounded-3xl border-4 border-dashed transition-colors flex flex-col items-center justify-center w-64 h-64 overflow-hidden ${
          solved ? 'border-green-500 bg-green-50' :
          hover ? 'border-orange-600 bg-orange-100 shadow-[0_0_0_8px_rgba(254,106,47,0.18)]' :
          'border-orange-400 bg-orange-50'
        }`}
        aria-label={solved ? `Solved: ${slide.word}` : 'Drop the matching word here'}
      >
        <img
          src={slide.image_url}
          alt={slide.word}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        {solved && (
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xl font-extrabold px-5 py-2 rounded-full shadow-lg"
          >
            {slide.word} ✓
          </motion.div>
        )}
      </motion.div>

      {/* Word chips — student must choose the correct label */}
      {!solved && (
        <div className="flex items-start justify-center gap-3 sm:gap-4 flex-wrap max-w-2xl">
          {chips.map(({ w, img }) => {
            const isWrong = wrongId === w;
            const isDragging = drag?.id === w;
            const off = dragOffsetFor(w);
            return (
              <motion.div
                key={w}
                ref={(el) => { chipRefs.current[w] = el; }}
                onPointerDown={onPointerDown(w)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => { setDrag(null); setHover(false); }}
                animate={isWrong ? wrongAnim : { x: off.x, y: off.y, scale: isDragging ? 1.08 : 1 }}
                transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'spring', stiffness: 320, damping: 26 }}
                whileHover={{ y: -3 }}
                className={`touch-none select-none cursor-grab active:cursor-grabbing flex flex-col items-center gap-2 rounded-2xl shadow-lg p-2 border-2 ${
                  isWrong
                    ? 'bg-gradient-to-br from-red-500 to-rose-500 border-red-700/30'
                    : 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-700/30'
                }`}
                style={{ zIndex: isDragging ? 30 : 1 }}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white/90 border-2 border-white/70 flex items-center justify-center">
                  {img ? (
                    <img src={img} alt={w} draggable={false} className="w-full h-full object-cover pointer-events-none" />
                  ) : (
                    <span className="text-3xl">🖼️</span>
                  )}
                </div>
                <span className="text-white text-xl sm:text-2xl font-extrabold px-2 pb-1">{w}</span>
              </motion.div>
            );
          })}
        </div>
      )}

      {!solved && (
        <p className="text-sm text-slate-500 font-medium text-center">
          Read the words. Drag the <span className="text-orange-600 font-bold">correct</span> one onto the picture.
        </p>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// MATCH GAME — clearer selection state, hover ring on candidates, animated
// solved card, satisfying audio + confetti. Schema unchanged.
// ─────────────────────────────────────────────────────────────────────────────
function MatchGame({ slide }: { slide: Extract<Slide, { type: 'match' }> }) {
  useAutoVoice(slide.voice);
  const { playCorrect, playWrong } = usePlaygroundAudio();
  const matches = useMemo(() => [...slide.pairs].sort(() => Math.random() - 0.5), [slide.pairs]);
  const [selWord, setSelWord] = useState<string | null>(null);
  const [solved, setSolved] = useState<Record<string, true>>({});
  const [shake, setShake] = useState(false);
  const allDone = Object.keys(solved).length === slide.pairs.length;

  const tryPair = (word: string, imageUrl: string) => {
    const ok = slide.pairs.some((p) => p.word === word && p.image_url === imageUrl);
    if (ok) {
      setSolved((s) => ({ ...s, [word]: true }));
      fireConfetti();
      playCorrect();
    } else {
      setShake(true);
      playWrong();
      setTimeout(() => setShake(false), 400);
    }
    setSelWord(null);
  };

  return (
    <motion.div animate={shake ? wrongAnim : allDone ? correctAnim : undefined} className="flex flex-col items-center gap-6 w-full">
      <h2 className="text-3xl font-bold text-slate-800 text-center">{slide.instruction}</h2>
      <div className="grid grid-cols-2 gap-6 md:gap-8 w-full max-w-2xl">
        <div className="flex flex-col gap-3">
          {slide.pairs.map((p) => {
            const isSolved = !!solved[p.word];
            const isSel = selWord === p.word;
            return (
              <motion.button
                key={p.word}
                disabled={isSolved}
                onClick={() => setSelWord(isSel ? null : p.word)}
                whileTap={{ scale: 0.96 }}
                whileHover={isSolved ? undefined : { y: -2 }}
                className={`text-2xl font-bold rounded-full shadow-md py-4 min-h-[64px] transition-colors ${
                  isSolved ? 'bg-green-500 text-white' :
                  isSel ? 'bg-amber-300 text-slate-900 ring-4 ring-orange-500' :
                  'bg-gradient-to-br from-orange-500 to-amber-500 text-white hover:shadow-lg'
                }`}
              >
                {p.word}
              </motion.button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {matches.map((p) => {
            const used = !!solved[p.word];
            return (
              <motion.button
                key={p.image_url + p.word}
                disabled={used || !selWord}
                onClick={() => selWord && tryPair(selWord, p.image_url)}
                whileTap={{ scale: 0.96 }}
                whileHover={!used && selWord ? { y: -2, scale: 1.02 } : undefined}
                animate={used ? { opacity: 0.55 } : undefined}
                className={`self-center rounded-full shadow-sm p-1 transition-colors inline-flex items-center justify-center ${
                  used ? 'bg-green-50 ring-1 ring-green-400' :
                  selWord ? 'bg-amber-100 hover:bg-amber-200 ring-1 ring-amber-300' :
                  'bg-amber-50'
                }`}
              >
                <img
                  src={p.image_url}
                  alt={p.word}
                  className="rounded-full h-20 w-20 object-cover bg-white block"
                  draggable={false}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW GAME / WHITEBOARD — pointer events (mouse + touch + stylus pressure),
// undo, clear, eraser, color picker, optional guide overlay (image_url).
// Pressure-sensitive line width when the device reports it.
// ─────────────────────────────────────────────────────────────────────────────
function DrawGame({ slide }: { slide: Extract<Slide, { type: 'draw' }> }) {
  useAutoVoice(slide.voice);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState<string>('#FE6A2F');
  const PALETTE = ['#FE6A2F', '#0EA5E9', '#22C55E', '#A855F7', '#0F172A'];

  const ctx = () => canvasRef.current?.getContext('2d') ?? null;

  const snapshot = () => {
    const c = canvasRef.current; const x = ctx();
    if (!c || !x) return;
    try {
      history.current.push(x.getImageData(0, 0, c.width, c.height));
      if (history.current.length > 30) history.current.shift();
    } catch { /* tainted canvas — ignore */ }
  };

  const undo = () => {
    const c = canvasRef.current; const x = ctx();
    if (!c || !x || history.current.length === 0) return;
    const last = history.current.pop()!;
    x.putImageData(last, 0, 0);
  };

  const clear = () => {
    const c = canvasRef.current; const x = ctx();
    if (!c || !x) return;
    snapshot();
    x.clearRect(0, 0, c.width, c.height);
  };

  const pointFor = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  };

  const start = (e: React.PointerEvent) => {
    const x = ctx(); if (!x) return;
    snapshot();
    drawing.current = true;
    last.current = pointFor(e);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const x = ctx(); if (!x || !last.current) return;
    const p = pointFor(e);
    const pressure = e.pressure > 0 && e.pointerType !== 'mouse' ? e.pressure : 0.55;
    x.lineCap = 'round';
    x.lineJoin = 'round';
    if (tool === 'eraser') {
      x.globalCompositeOperation = 'destination-out';
      x.strokeStyle = 'rgba(0,0,0,1)';
      x.lineWidth = 28;
    } else {
      x.globalCompositeOperation = 'source-over';
      x.strokeStyle = color;
      x.lineWidth = 4 + pressure * 14;
    }
    x.beginPath();
    x.moveTo(last.current.x, last.current.y);
    x.lineTo(p.x, p.y);
    x.stroke();
    last.current = p;
  };
  const end = () => { drawing.current = false; last.current = null; };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <h2 className="text-3xl font-bold text-slate-800 text-center">{slide.prompt}</h2>

      <div className="relative w-full max-w-3xl" style={{ aspectRatio: '2 / 1' }}>
        {/* Optional guide overlay (lesson-supplied image for tracing letters/shapes) */}
        {slide.image_url && (
          <img
            src={slide.image_url}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-contain opacity-25 pointer-events-none select-none rounded-2xl"
            draggable={false}
          />
        )}
        <canvas
          ref={canvasRef}
          width={1600}
          height={800}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          className="relative bg-white border-4 border-orange-400 rounded-2xl shadow-md touch-none w-full h-full"
          style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setTool('pen')}
          aria-pressed={tool === 'pen'}
          className={`font-bold rounded-xl px-4 py-2 shadow-sm transition active:scale-95 ${
            tool === 'pen' ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 border border-orange-300'
          }`}
        >
          ✏️ Pen
        </button>
        <button
          onClick={() => setTool('eraser')}
          aria-pressed={tool === 'eraser'}
          className={`font-bold rounded-xl px-4 py-2 shadow-sm transition active:scale-95 ${
            tool === 'eraser' ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 border border-orange-300'
          }`}
        >
          🧽 Eraser
        </button>

        <div className="flex items-center gap-1.5 ml-1">
          {PALETTE.map((c) => (
            <button
              key={c}
              aria-label={`color ${c}`}
              onClick={() => { setTool('pen'); setColor(c); }}
              className={`w-8 h-8 rounded-full border-2 transition active:scale-95 ${
                color === c && tool === 'pen' ? 'border-slate-900 scale-110' : 'border-white shadow'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <button
          onClick={undo}
          className="bg-white text-slate-700 border border-orange-300 font-bold rounded-xl px-4 py-2 shadow-sm active:scale-95 transition"
        >
          ↩️ Undo
        </button>
        <button
          onClick={clear}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-4 py-2 shadow-md active:scale-95 transition"
        >
          🗑 Clear
        </button>
      </div>
    </div>
  );
}

// ─── Renderer ────────────────────────────────────────────────────────────────
import { StorybookRenderer } from '@/components/creator-studio/shared/StorybookRenderer';
import { MediaPlayerRenderer } from '@/components/creator-studio/shared/MediaPlayerRenderer';
import { LivingCanvas } from '@/components/creator-studio/shared/LivingCanvas';
import { ScaffoldedPlayer } from '@/components/creator-studio/shared/ScaffoldedPlayer';
import { VisualFlashcard } from '@/components/creator-studio/shared/VisualFlashcard';
import { PhonicsFocusCard } from '@/components/creator-studio/shared/PhonicsFocusCard';

export function SlideRenderer({ slide, onStorybookComplete, onCanvasSolved, onMediaPassed, lessonContext }: {
  slide: Slide;
  onStorybookComplete?: () => void;
  onCanvasSolved?: () => void;
  onMediaPassed?: () => void;
  lessonContext?: PlaygroundLessonContext;
}) {
  const normalized = normalizePlaygroundSlide(slide);
  switch (normalized.type) {
    case 'intro': return <Intro slide={normalized} lessonContext={lessonContext} />;
    case 'multiple': return <TrailChoiceGame slide={normalized as any} />;
    case 'truefalse': return <TrueFalse slide={normalized} />;
    case 'fill': return <TrailWordGapGame slide={normalized as any} />;
    case 'drag': return <TrailDragMatchGame slide={normalized as any} />;
    case 'match': return <TrailDragMatchGame slide={normalized as any} />;
    case 'draw': return <DrawGame slide={normalized} />;
    case 'trace': return <TraceGame slide={normalized} />;
    case 'missing_letter': return <MissingLetterGame slide={normalized} />;
    case 'phonics_hunt': return <PhonicsHuntGame slide={normalized} />;
    case 'memory': return <MemoryGame slide={normalized} />;
    case 'tap_order': return <TapOrderGame slide={normalized} />;
    case 'hotspot': return <HotspotGame slide={normalized} />;
    case 'thumbs': return <ThumbsGame slide={normalized} />;
    case 'sort': return <SortGame slide={normalized} />;
    case 'word_builder': return <WordBuilderGame slide={normalized} />;
    case 'sound_blend': return <SoundBlendGame slide={normalized} />;
    case 'storybook': return <StorybookRenderer slide={normalized as any} hub="playground" onComplete={onStorybookComplete} />;
    case 'media_player': return <MediaPlayerRenderer slide={normalized as any} hub="playground" />;
    case 'canvas_game':
    case 'living_canvas':
      return <LivingCanvas slide={normalized as any} hub="playground" onAllSolved={onCanvasSolved} />;
    case 'scaffolded_media':
      return <ScaffoldedPlayer slide={normalized as any} hub="playground" onAllSegmentsPassed={onMediaPassed} />;
    case 'vocab_solo':
      return <VisualFlashcard slide={normalized as any} hub="playground" />;
    case 'vocab_grid':
      return <VocabGridGame slide={normalized as any} />;
    case 'phonics_focus':
      return <PhonicsFocusCard slide={normalized as any} hub="playground" />;
    case 'lesson_summary': return <PlaygroundSummary slide={normalized} />;
  }
}

function PlaygroundSummary({ slide }: { slide: Extract<Slide, { type: 'lesson_summary' }> }) {
  useEffect(() => {
    const t1 = setTimeout(() => confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#FE6A2F', '#FFB703', '#FFD166', '#10B981'] }), 200);
    const t2 = setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.4 }, colors: ['#FE6A2F', '#FFD166'] }), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex flex-col items-center text-center gap-6 w-full">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
        className="text-8xl drop-shadow-md"
      >
        🏆
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="text-4xl md:text-5xl font-extrabold text-orange-600"
      >
        {slide.title || 'Level Complete!'}
      </motion.h1>

      {slide.vocab_recap?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
          {slide.vocab_recap.slice(0, 5).map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, y: 16, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 260, damping: 18 }}
              whileHover={{ y: -3, scale: 1.05 }}
              className="px-5 py-2.5 rounded-full text-lg font-extrabold text-white shadow-lg cursor-default"
              style={{ background: ['#FE6A2F', '#F59E0B', '#10B981', '#3B82F6', '#A855F7'][i % 5] }}
            >
              {w}
            </motion.span>
          ))}
        </div>
      )}

      {slide.grammar_recap && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
          className="max-w-xl rounded-2xl bg-amber-50 border-2 border-amber-200 px-5 py-4 text-amber-900"
        >
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 mb-1">Grammar</div>
          <p className="text-base font-semibold leading-relaxed">{slide.grammar_recap}</p>
        </motion.div>
      )}

      {slide.takeaway && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          className="text-xl text-slate-700 font-bold max-w-xl"
        >
          {slide.takeaway}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.15, type: 'spring' }}
        className="text-3xl font-extrabold text-amber-600"
      >
        Great job! 🎉
      </motion.div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function PlaygroundDemo() {
  const [i, setI] = useState(0);
  const [storybookDone, setStorybookDone] = useState<Record<number, boolean>>({});
  const [canvasDone, setCanvasDone] = useState<Record<number, boolean>>({});
  const [mediaDone, setMediaDone] = useState<Record<number, boolean>>({});
  const [activityDone, setActivityDone] = useState<Record<number, boolean>>({});

  const slide = SLIDES[i];
  const isStorybook = slide.type === 'storybook';
  const isCanvas = slide.type === 'canvas_game' || slide.type === 'living_canvas';
  const isScaffMedia = slide.type === 'scaffolded_media';
  const isInputActivity =
    slide.type === 'multiple' ||
    slide.type === 'truefalse' ||
    slide.type === 'fill' ||
    slide.type === 'drag' ||
    slide.type === 'match';

  // A scene is "complete" when the appropriate completion signal fires.
  // For free-form scenes (intro, draw, summary), the shell exposes a fallback
  // skip arrow — auto-advance never fires for those.
  const complete =
    (isStorybook && !!storybookDone[i]) ||
    (isCanvas && !!canvasDone[i]) ||
    (isScaffMedia && !!mediaDone[i]) ||
    (isInputActivity && !!activityDone[i]);

  const isLast = i === SLIDES.length - 1;
  const advance = () => {
    if (!isLast) setI((n) => n + 1);
  };

  // Watch DOM for input activities to flip "done" once a correct answer lands.
  // The existing activity components mark the selected option with
  // `aria-pressed` / styling but don't expose a callback, so we detect
  // completion by watching for [data-correct="true"] elements rendered inside
  // the scene canvas (added below via a one-line className helper).
  useEffect(() => {
    setActivityDone((s) => ({ ...s, [i]: false }));
  }, [i]);

  return (
    <ImmersivePlaygroundShell
      sceneKey={i}
      hub="playground"
      complete={complete}
      onAdvance={isLast ? undefined : advance}
      current={i}
      total={SLIDES.length}
    >
      <div
        className="w-full flex flex-col items-center gap-4"
        onClickCapture={(e) => {
          // Lightweight completion detector for input activities: any click
          // that lands on (or inside) an element flagged data-correct="true"
          // counts as scene completion. Activity components opt-in by adding
          // that attribute when the answer matches — no logic change required
          // since the existing components already track correctness in state.
          const target = e.target as HTMLElement | null;
          const hit = target?.closest('[data-correct="true"]');
          if (hit && isInputActivity) {
            setActivityDone((s) => ({ ...s, [i]: true }));
          }
        }}
      >
        <VoiceButton text={slide.voice?.text} />
        <SlideRenderer
          slide={slide}
          onStorybookComplete={() => setStorybookDone((s) => ({ ...s, [i]: true }))}
          onCanvasSolved={() => setCanvasDone((s) => ({ ...s, [i]: true }))}
          onMediaPassed={() => setMediaDone((s) => ({ ...s, [i]: true }))}
        />
      </div>
    </ImmersivePlaygroundShell>
  );
}

