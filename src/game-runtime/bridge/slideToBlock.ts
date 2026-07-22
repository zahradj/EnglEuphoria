/**
 * Slide → LessonBlock adapter.
 *
 * The Slide union (src/pages/PlaygroundDemo.tsx) is the legacy authoring shape.
 * The Unified Engine speaks LessonBlock. This is the ONLY place Slide knowledge
 * touches the engine — Phaser scenes never see Slide.
 */
import type { Slide } from '@/pages/PlaygroundDemo';
import type { LessonBlock } from '../engine/types';

export interface BridgeResult {
  block: LessonBlock | null;
  /** Reason the slide was not playable (only set when block === null). */
  skipReason?: string;
}

/** Best-effort 1:1 map. Returns null for slide types the runtime cannot play yet. */
export function slideToBlock(slide: Slide): BridgeResult {
  switch (slide.type) {
    case 'intro':
      return {
        block: {
          type: 'intro',
          title: slide.title || 'Welcome',
          subtitle: slide.text,
        },
      };

    case 'phonics_focus': {
      const examples = Array.isArray((slide as any).example_words) ? (slide as any).example_words : [];
      return {
        block: {
          type: 'phonics_focus',
          sound: slide.phoneme || slide.sound_ipa || slide.grapheme || '/?/',
          examples: examples.slice(0, 6),
          audio: slide.audio_url || slide.voice?.text,
        },
      };
    }

    case 'vocab_solo':
      return {
        block: {
          type: 'vocab_solo',
          word: slide.word,
          definition: slide.definition || '',
          image: slide.image_url,
          audio: slide.audio_url,
        },
      };

    case 'multiple': {
      const idx = slide.options.findIndex((o) => o === slide.answer);
      return {
        block: {
          type: 'multiple_choice',
          question: slide.question,
          options: slide.options,
          answerIndex: idx >= 0 ? idx : 0,
        },
      };
    }

    case 'truefalse':
      return {
        block: {
          type: 'multiple_choice',
          question: slide.statement,
          options: ['True', 'False'],
          answerIndex: slide.answer ? 0 : 1,
        },
      };

    case 'fill':
      return {
        block: {
          type: 'fill_in_blank',
          sentence: slide.text,
          options: [slide.answer],
          answer: slide.answer,
        },
      };

    case 'drag':
      return {
        block: {
          type: 'drag_and_drop',
          prompt: slide.instruction,
          items: [{ id: 'w', label: slide.word }],
          targets: [{ id: 't', label: slide.word, accepts: 'w' }],
        },
      };

    case 'match':
      return {
        block: {
          type: 'match',
          prompt: slide.instruction,
          pairs: slide.pairs.map((p) => ({ left: p.word, right: p.image_url || p.word })),
        },
      };

    case 'storybook':
      return {
        block: {
          type: 'storybook',
          title: slide.title || 'Storybook',
          pages: slide.pages.map((p) => ({ text: p.text, image: p.image_url })),
        },
      };

    case 'lesson_summary':
      return {
        block: {
          type: 'lesson_summary',
          title: slide.title || 'Lesson Complete',
          bullets: slide.vocab_recap?.length
            ? slide.vocab_recap
            : [slide.takeaway || 'Great work!'].filter(Boolean),
        },
      };

    default:
      return { block: null, skipReason: (slide as any).type };
  }
}
