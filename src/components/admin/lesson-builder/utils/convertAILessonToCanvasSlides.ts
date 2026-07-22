import { v4 as uuidv4 } from 'uuid';
import type { Slide, CanvasElementData } from '../types';

/**
 * Convert AI-generated lesson content (object format) into canvas slides
 * with auto-positioned CanvasElementData elements.
 *
 * Supports two DB formats:
 * 1. Full PPP lessons with `slides[]` array (from studio-ai-copilot)
 * 2. Seed-level metadata lessons with `vocabulary`, `grammar_target`, `hook` etc.
 */
export function convertAILessonToCanvasSlides(content: Record<string, any>, lessonTitle?: string): Slide[] {
  // Format 1: has a slides array
  if (content.slides && Array.isArray(content.slides)) {
    return convertSlidesArray(content);
  }
  // Format 2: seed-level metadata (Hello, Pip! style)
  if (content.vocabulary || content.grammar_target || content.hook) {
    return convertSeedMetadata(content, lessonTitle);
  }
  // Unknown — return single blank slide
  return [{ id: uuidv4(), order: 0, type: 'image', teacherNotes: '', keywords: [] }];
}

/* ─── Format 1: Full slides array ─── */
function convertSlidesArray(content: Record<string, any>): Slide[] {
  const vocab = content.presentation?.vocabulary || [];
  const grammar = content.presentation?.grammar_rule || content.presentation?.grammar || null;
  const exercises = content.practice?.exercises || [];
  const gameInfo = content.practice?.game_mechanic || null;

  return content.slides.map((s: any, idx: number) => {
    const elements: CanvasElementData[] = [];
    const slideId = s.id || uuidv4();

    // Phase badge (top-left)
    if (s.phaseLabel) {
      elements.push(textEl(60, 30, 300, 40, s.phaseLabel, 18, '#6366f1', true));
    }

    // Title (large, centered)
    elements.push(textEl(160, 80, 1600, 80, s.title || `Slide ${idx + 1}`, 48, '#1a1a2e', true, 'center'));

    // Content by type
    switch (s.type) {
      case 'title':
        addTitleSlideElements(elements, s, content);
        break;
      case 'vocabulary':
        addVocabSlideElements(elements, s, vocab, idx);
        break;
      case 'grammar':
        addGrammarSlideElements(elements, s, grammar);
        break;
      case 'practice':
        addPracticeSlideElements(elements, s, exercises);
        break;
      case 'dialogue':
        addDialogueSlideElements(elements, s);
        break;
      case 'game':
      case 'activity':
        addGameSlideElements(elements, s, gameInfo);
        break;
      case 'production':
        addProductionSlideElements(elements, s, content.production);
        break;
      default:
        // Generic content text
        if (s.teacherNotes) {
          elements.push(textEl(160, 280, 1600, 200, s.teacherNotes, 24, '#555555'));
        }
        break;
    }

    // Add Pip on title/game slides
    if (s.type === 'title' || s.type === 'game' || s.type === 'activity' || idx === 0) {
      elements.push(pipCharacter(1550, 700));
    }

    return {
      id: slideId,
      order: idx,
      type: 'image' as const,
      teacherNotes: s.teacherNotes || '',
      keywords: [],
      title: s.title || `Slide ${idx + 1}`,
      canvasElements: elements.map((el, i) => ({ ...el, zIndex: i + 1 })),
    };
  });
}

/* ─── Format 2: Seed metadata → generate slides ─── */
function convertSeedMetadata(content: Record<string, any>, lessonTitle?: string): Slide[] {
  const slides: Slide[] = [];
  let order = 0;

  // 1. Title / Hook slide
  slides.push({
    id: uuidv4(), order: order++, type: 'image',
    title: lessonTitle || content.topic || 'Lesson',
    teacherNotes: content.hook || '',
    keywords: content.focus || [],
    canvasElements: [
      textEl(160, 120, 1600, 100, lessonTitle || content.topic || 'Lesson', 56, '#1a1a2e', true, 'center'),
      textEl(160, 280, 1600, 60, content.hook || '', 28, '#555555', false, 'center'),
      textEl(160, 400, 1600, 40, `Theme: ${content.theme || ''} • Unit: ${content.unit_name || ''}`, 20, '#888888', false, 'center'),
      pipCharacter(1550, 650),
    ].map((el, i) => ({ ...el, zIndex: i + 1 })),
  });

  // 2. Grammar target slide
  if (content.grammar_target) {
    slides.push({
      id: uuidv4(), order: order++, type: 'image',
      title: 'Grammar Target',
      teacherNotes: `Grammar: ${content.grammar_target}`,
      keywords: [],
      canvasElements: [
        textEl(160, 80, 1600, 80, '🎯 Grammar Target', 42, '#6366f1', true, 'center'),
        textEl(260, 300, 1400, 120, content.grammar_target, 48, '#1a1a2e', true, 'center'),
        shapeEl(200, 260, 1520, 200, '#eef2ff', 0.6),
        pipCharacter(1550, 700),
      ].map((el, i) => ({ ...el, zIndex: i + 1 })),
    });
  }

  // 3. Vocabulary slides (one per word)
  const vocabItems: string[] = content.vocabulary || [];
  vocabItems.forEach((word: string, idx: number) => {
    slides.push({
      id: uuidv4(), order: order++, type: 'image',
      title: `Vocabulary: ${word}`,
      teacherNotes: `Teach the word "${word}" with actions, visuals, and repetition.`,
      keywords: [word],
      canvasElements: [
        textEl(160, 60, 1600, 50, `Word ${idx + 1} of ${vocabItems.length}`, 18, '#6366f1', true),
        textEl(160, 200, 1600, 120, word, 72, '#1a1a2e', true, 'center'),
        shapeEl(560, 180, 800, 160, '#fef3c7', 0.5),
        textEl(160, 450, 1600, 60, 'Use gestures & images to teach this word', 22, '#888888', false, 'center'),
      ].map((el, i) => ({ ...el, zIndex: i + 1 })),
    });
  });

  // 4. Practice slide
  slides.push({
    id: uuidv4(), order: order++, type: 'image',
    title: 'Practice Time!',
    teacherNotes: 'Practice the vocabulary and grammar target together.',
    keywords: [],
    canvasElements: [
      textEl(160, 120, 1600, 80, '🎮 Practice Time!', 48, '#059669', true, 'center'),
      textEl(160, 350, 1600, 80, 'Use the vocabulary with the grammar pattern:', 28, '#555555', false, 'center'),
      textEl(160, 450, 1600, 80, content.grammar_target || '', 36, '#1a1a2e', true, 'center'),
      pipCharacter(1550, 650),
    ].map((el, i) => ({ ...el, zIndex: i + 1 })),
  });

  // 5. Goodbye slide
  slides.push({
    id: uuidv4(), order: order++, type: 'image',
    title: 'Great Job!',
    teacherNotes: 'Wrap up, review key words, and say goodbye.',
    keywords: [],
    canvasElements: [
      textEl(160, 200, 1600, 100, '⭐ Great Job! ⭐', 56, '#d97706', true, 'center'),
      textEl(160, 400, 1600, 60, 'See you next time!', 32, '#555555', false, 'center'),
      pipCharacter(800, 600),
    ].map((el, i) => ({ ...el, zIndex: i + 1 })),
  });

  return slides;
}

/* ─── Slide-type element builders ─── */

function addTitleSlideElements(elements: CanvasElementData[], s: any, content: any) {
  if (content.cefrLevel) {
    elements.push(textEl(160, 220, 400, 40, `Level: ${content.cefrLevel}`, 22, '#888888'));
  }
  if (content.estimatedDuration) {
    elements.push(textEl(160, 270, 400, 40, `${content.estimatedDuration} min`, 20, '#888888'));
  }
}

function addVocabSlideElements(elements: CanvasElementData[], s: any, vocab: any[], idx: number) {
  // Large word display
  const wordMatch = s.title?.replace(/^Word \d+:\s*/, '') || '';
  elements.push(textEl(160, 280, 1600, 100, wordMatch, 64, '#1a1a2e', true, 'center'));
  // Background card
  elements.push(shapeEl(200, 250, 1520, 350, '#fef3c7', 0.4));
  // Placeholder for image
  elements.push(shapeEl(660, 620, 600, 300, '#e5e7eb', 0.6));
  elements.push(textEl(660, 740, 600, 40, '🖼️ Add image here', 18, '#999999', false, 'center'));
}

function addGrammarSlideElements(elements: CanvasElementData[], s: any, grammar: any) {
  elements.push(shapeEl(200, 250, 1520, 300, '#eef2ff', 0.5));
  if (grammar?.pattern) {
    elements.push(textEl(260, 300, 1400, 80, grammar.pattern, 36, '#4338ca', true, 'center'));
  }
  if (grammar?.examples && Array.isArray(grammar.examples)) {
    grammar.examples.slice(0, 3).forEach((ex: string, i: number) => {
      elements.push(textEl(260, 420 + i * 60, 1400, 50, `• ${ex}`, 24, '#555555'));
    });
  }
}

function addPracticeSlideElements(elements: CanvasElementData[], s: any, exercises: any[]) {
  elements.push(shapeEl(200, 250, 1520, 600, '#f0fdf4', 0.4));
  elements.push(textEl(260, 280, 1400, 50, '✏️ Complete the exercise', 28, '#059669', true));
  if (s.teacherNotes) {
    elements.push(textEl(260, 380, 1400, 150, s.teacherNotes, 22, '#555555'));
  }
}

function addDialogueSlideElements(elements: CanvasElementData[], s: any) {
  elements.push(shapeEl(200, 250, 1520, 500, '#fdf2f8', 0.4));
  elements.push(textEl(260, 280, 1400, 50, '💬 Dialogue Practice', 28, '#db2777', true));
  if (s.teacherNotes) {
    elements.push(textEl(260, 380, 1400, 300, s.teacherNotes, 22, '#555555'));
  }
}

function addGameSlideElements(elements: CanvasElementData[], s: any, gameInfo: any) {
  elements.push(shapeEl(200, 250, 1520, 500, '#fefce8', 0.4));
  elements.push(textEl(260, 280, 1400, 50, '🎮 Game Time!', 36, '#ca8a04', true));
  if (gameInfo?.description) {
    elements.push(textEl(260, 380, 1400, 200, gameInfo.description, 24, '#555555'));
  }
}

function addProductionSlideElements(elements: CanvasElementData[], s: any, production: any) {
  elements.push(shapeEl(200, 250, 1520, 500, '#f5f3ff', 0.4));
  elements.push(textEl(260, 280, 1400, 50, '🎤 Your Turn!', 36, '#7c3aed', true));
  if (production?.creative_task) {
    elements.push(textEl(260, 380, 1400, 200, production.creative_task, 24, '#555555'));
  }
}

/* ─── Element factories ─── */

function textEl(
  x: number, y: number, w: number, h: number,
  text: string, fontSize: number, color: string,
  bold = false, align: 'left' | 'center' | 'right' = 'left',
): CanvasElementData {
  return {
    id: uuidv4(), elementType: 'text', x, y, width: w, height: h,
    rotation: 0, zIndex: 0,
    content: { text, fontSize, bold, italic: false, align, color },
  };
}

function shapeEl(x: number, y: number, w: number, h: number, fill: string, opacity: number): CanvasElementData {
  return {
    id: uuidv4(), elementType: 'shape', x, y, width: w, height: h,
    rotation: 0, zIndex: 0,
    content: { shape: 'rounded', fill, opacity },
  };
}

function pipCharacter(x: number, y: number): CanvasElementData {
  return {
    id: uuidv4(), elementType: 'character', x, y, width: 250, height: 300,
    rotation: 0, zIndex: 0,
    content: { name: 'pip', animation: 'idle', src: '/pip-mascot.png', speechBubble: '' },
  };
}
