import { v4 as uuidv4 } from 'uuid';
import { WizardFormData, GeneratedSlide, PPPLessonPlan, HubType, SlideVisuals, SlideInteraction, AnimationType } from './types';
import { HUB_CONFIGS, resolveHub, HubConfig } from './hubConfig';
import { supabase } from '@/integrations/supabase/client';

/* ──────────────────────────────────────────────────
   Topic-specific content banks
   ────────────────────────────────────────────────── */

export interface VocabEntry {
  word: string;
  definition: string;
  exampleSentence: string;
  fillBlank: string;
  imageKeywords: string;
  emoji?: string;
}

export interface TopicPack {
  vocabulary: VocabEntry[];
  grammarTarget: string;
  grammarExamples: string[];
  warmUpQuestion: string;
  warmUpSong?: string;
  objectives: string[];
  dialogueLines: string[];
  gameDescription: string;
  productionTask: string;
  songOrChant: string;
}

/* ── AI-Powered TopicPack Generation ── */

export async function generateTopicPackWithAI(
  topic: string,
  lessonPrompt: string | undefined,
  level: string,
  ageGroup: string,
  hub: HubConfig
): Promise<TopicPack> {
  const { data, error } = await supabase.functions.invoke('ai-lesson-content-generator', {
    body: {
      topic,
      lessonPrompt: lessonPrompt || '',
      level,
      ageGroup,
      hub: hub.hub,
      vocabularyCount: hub.vocabularyCount,
    },
  });

  if (error) {
    console.error('AI generation error:', error);
    const detailedMsg = data?.error || error.message || 'Failed to generate lesson content';
    throw new Error(detailedMsg);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.topicPack as TopicPack;
}

/* ── Image URL with hub-specific style ── */

function buildImageUrl(_keyword: string): string {
  return '';
}

function buildMediaPrompt(keyword: string, hub: HubConfig): string {
  return `${keyword}, ${hub.imageStyleSuffix}`;
}

function pickAnimation(hub: HubConfig, index: number): AnimationType {
  const anims = hub.animations;
  return anims[index % anims.length];
}

function buildVisuals(keyword: string, hub: HubConfig, index: number, layout: 'split' | 'centered' | 'bento' = 'split'): SlideVisuals {
  return {
    image_prompt: buildMediaPrompt(keyword, hub),
    animation_style: pickAnimation(hub, index),
    layout,
  };
}

function buildInteraction(type: string, question?: string, options?: string[], correctAnswer?: string, extra?: Record<string, any>): SlideInteraction {
  return {
    type,
    data: {
      question,
      options,
      correct_answer: correctAnswer,
      ...extra,
    },
  };
}

/* ══════════════════════════════════════════════════════
   STRICT 4-SKILL PROGRESSIVE SLIDE GENERATOR
   
   Every lesson follows the Scaffolded Mastery Structure:
   
   SLIDE 1 (Listening)  → Sound Intro — "Listen and find the sound"
   SLIDE 2 (Speaking)   → Mimic — Microphone + Phonetic Waveform
   SLIDE 3 (Reading)    → Word Prime — Flat 2.0 Visual Asset, no distracting bg
   SLIDE 4 (Grammar)    → Builder — Draggable Grammar Blocks
   SLIDE 5 (Writing)    → Memory Trace — Ghost Vector + Letter Tracing
   SLIDE 6 (Cool-Off)   → Brain Break / Celebration
   
   STYLE OVERRIDE: Flat 2.0 Vector, white background, no 3D, no shadows.
   ══════════════════════════════════════════════════════ */

const FLAT_NEGATIVE = 'No 3D, no render, no depth, no shadows, no gradients, no photorealism, no Octane Render, no Unreal Engine.';

function flatImagePrompt(subject: string, hub: HubConfig): string {
  if (hub.hub === 'professional') {
    return `${subject}, Minimalist editorial photography, luxury corporate aesthetic, natural soft lighting, neutral tones --ar 16:9`;
  }
  return `${subject}, Isolated 2D Vector, Flat Illustration, White Background, clean bold outlines, solid pastel colors --ar 16:9. NEGATIVE: ${FLAT_NEGATIVE}`;
}

export function buildPPPLessonFromPack(formData: WizardFormData, pack: TopicPack): PPPLessonPlan {
  const { topic, level, ageGroup, lessonPrompt } = formData;
  const hub = HUB_CONFIGS[resolveHub(ageGroup)];
  const slides: GeneratedSlide[] = [];
  let order = 0;

  const cefrMap: Record<string, string> = { beginner: 'Pre-A1 / A1', intermediate: 'B1', advanced: 'C1' };
  const cefrLevel = cefrMap[level] || 'A1';

  const promptContext = lessonPrompt ? `\n\n📋 Lesson Focus: ${lessonPrompt}` : '';

  const sanitizeTone = (text: string): string => {
    if (hub.hub !== 'professional' || !hub.forbiddenWords) return text;
    let result = text;
    hub.forbiddenWords.forEach(w => {
      result = result.replace(new RegExp(`\\b${w}\\b`, 'gi'), 'effective');
    });
    return result;
  };

  const mkSlide = (
    phase: GeneratedSlide['phase'],
    phaseLabel: string,
    slideType: GeneratedSlide['slideType'],
    type: GeneratedSlide['type'],
    title: string,
    imgKeywords: string,
    content: GeneratedSlide['content'],
    teacherNotes: string,
    keywords: string[],
    activityType?: GeneratedSlide['activityType'],
    layout: 'split' | 'centered' | 'bento' = 'split',
    interaction?: SlideInteraction,
    skillOverrides?: Partial<GeneratedSlide>,
  ): GeneratedSlide => {
    const idx = order;
    return {
      id: uuidv4(),
      order: order++,
      phase,
      phaseLabel,
      slideType,
      type,
      title: sanitizeTone(title),
      imageUrl: buildImageUrl(imgKeywords),
      imageKeywords: imgKeywords,
      mediaPrompt: flatImagePrompt(imgKeywords, hub),
      mediaType: hub.mediaType,
      animation: pickAnimation(hub, idx),
      activityType,
      visuals: buildVisuals(imgKeywords, hub, idx, layout),
      interaction,
      content: content ? {
        ...content,
        prompt: content.prompt ? sanitizeTone(content.prompt) : undefined,
      } : undefined,
      teacherNotes: sanitizeTone(teacherNotes),
      keywords,
      // Skill flags default to false unless overridden
      has_listening: false,
      has_speaking: false,
      has_reading: false,
      has_writing: false,
      has_phonics: false,
      has_audio_match: false,
      has_grammar_blocks: false,
      ...skillOverrides,
    };
  };

  // Extract first vocab word and its first letter for tracing
  const primaryWord = pack.vocabulary[0];
  const tracingLetter = primaryWord?.word?.charAt(0)?.toUpperCase() || 'A';
  const phonemeTarget = primaryWord?.word ? `/${primaryWord.word.charAt(0).toLowerCase()}/` : '/a/';

  // ═══════════════════════════════════════════════════
  // SLIDE 1: WARM-UP — Get Ready + AI Song
  // ═══════════════════════════════════════════════════
  slides.push(mkSlide('presentation', '🎵 Warm-Up', 'warmup', 'title',
    hub.hub === 'playground' ? `🎵 Let's Learn: ${topic}!` : `🎯 ${topic}`,
    flatImagePrompt(`${topic} welcome scene, friendly`, hub),
    {
      prompt: hub.hub === 'playground'
        ? `Welcome, little learners! 🌟\n\nToday Pip has a SUPER adventure for you!\n\n${pack.warmUpQuestion}${promptContext}`
        : `${pack.warmUpQuestion}${promptContext}`,
    },
    'Play the AI Song placeholder. Get students ready. Build excitement!',
    [topic, 'warm-up', 'song'],
    undefined, 'centered',
    undefined,
    { has_listening: true, skillFocus: 'listening' },
  ));

  // OBJECTIVES
  slides.push(mkSlide('presentation', '🎯 Objectives', 'warmup', 'title',
    hub.hub === 'playground' ? '🎯 Today We Will Learn...' : '📋 Session Objectives',
    'learning objectives checklist',
    { prompt: pack.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n') },
    `Read each objective aloud. Level: ${cefrLevel}. Duration: 30 minutes.`,
    ['objectives', 'goals'],
    undefined, 'centered',
    undefined,
    { has_reading: true },
  ));

  // WARM-UP SONG (if generated)
  if (pack.warmUpSong && pack.warmUpSong.trim()) {
    slides.push(mkSlide('presentation', '🎵 Warm-Up Song', 'warmup', 'image',
      '🎵 Let\'s Sing & Move!',
      'kids singing music classroom cartoon colorful joyful',
      { prompt: pack.warmUpSong },
      'Sing/chant the warm-up song 2-3 times. Add clapping, stomping, or actions.',
      ['song', 'warm-up', 'music'],
      undefined, 'centered',
      undefined,
      { has_listening: true, has_speaking: true, skillFocus: 'listening' },
    ));
  }

  // ═══════════════════════════════════════════════════
  // SLIDE 2: LISTENING FOCUS — "The Sound Intro"
  // Play the phoneme sound isolated from the word.
  // ═══════════════════════════════════════════════════
  slides.push(mkSlide('presentation', '👂 Listening', 'activity', 'image',
    hub.hub === 'playground' ? `👂 Listen! Can you hear the sound?` : `👂 Sound Focus: ${phonemeTarget}`,
    flatImagePrompt(`ear listening to sound waves, phonics, ${topic}`, hub),
    {
      prompt: `🔊 Listen carefully!\n\nCan you hear the sound ${phonemeTarget} in "${primaryWord?.word}"?\n\nTap the Play button to hear it again!`,
      phonemeTarget,
    },
    `Play the isolated phoneme ${phonemeTarget}. Students listen and identify the sound in the word "${primaryWord?.word}".`,
    ['listening', 'phonics', 'sound'],
    'sound_spotting', 'centered',
    buildInteraction('sound_spotting', `Find the sound ${phonemeTarget}`, [primaryWord?.word || topic], primaryWord?.word),
    {
      has_listening: true,
      has_audio_match: true,
      has_phonics: true,
      skillFocus: 'listening',
      phonemeTarget,
    },
  ));

  // ═══════════════════════════════════════════════════
  // SLIDE 3: SPEAKING FOCUS — "The Mimic"
  // Microphone + Phonetic Waveform for pronunciation
  // ═══════════════════════════════════════════════════
  slides.push(mkSlide('practice', '🎤 Speaking', 'activity', 'roleplay',
    hub.hub === 'playground' ? `🎤 Say it! "${primaryWord?.word}"` : `🎤 Pronunciation: ${primaryWord?.word}`,
    flatImagePrompt(`microphone waveform phonetic pronunciation, ${topic}`, hub),
    {
      prompt: `🎤 Your Turn!\n\nSay: "${primaryWord?.word}"\n\nListen to the waveform — does your voice match?`,
      phonemeTarget,
    },
    `Students record themselves saying "${primaryWord?.word}". Compare waveform to model. Target: pronunciation accuracy.`,
    ['speaking', 'pronunciation', 'mimic'],
    'phonics_slider', 'centered',
    buildInteraction('phonics_slider', `Say "${primaryWord?.word}" clearly`, [primaryWord?.word || ''], primaryWord?.word),
    {
      has_speaking: true,
      has_phonics: true,
      skillFocus: 'speaking',
      phonemeTarget,
    },
  ));

  // ═══════════════════════════════════════════════════
  // SLIDE 4: READING FOCUS — "The Word Prime"
  // Visual Only — Flat 2.0 Asset, NO distracting backgrounds
  // ═══════════════════════════════════════════════════
  pack.vocabulary.slice(0, hub.vocabularyCount).forEach((vocab, idx) => {
    slides.push(mkSlide('presentation', '📖 Reading', 'vocabulary', 'vocabulary',
      hub.hub === 'playground'
        ? `📖 Word ${idx + 1}: ${vocab.word} ✨`
        : `📖 Term ${idx + 1}: ${vocab.word}`,
      flatImagePrompt(`${vocab.imageKeywords}, isolated subject, white background`, hub),
      {
        word: vocab.word,
        definition: vocab.definition,
        sentence: vocab.exampleSentence,
      },
      `Show the Flat 2.0 image ONLY first. No text distractions. Then reveal: "${vocab.word}" = "${vocab.definition}". Students repeat 3x.`,
      [vocab.word.toLowerCase(), 'vocabulary', 'reading'],
      undefined, 'split',
      undefined,
      {
        has_reading: true,
        skillFocus: 'reading',
      },
    ));
  });

  // ═══════════════════════════════════════════════════
  // SLIDE 5: GRAMMAR/READING — "The Builder"
  // Grammar Building Blocks — drag words to form sentences
  // ═══════════════════════════════════════════════════
  const grammarSentence = pack.grammarExamples[0] || `It is a ${primaryWord?.word?.toLowerCase()}.`;
  const grammarWords = grammarSentence.replace(/[.!?]/g, '').split(' ');
  const grammarBlockItems = grammarWords.map(w => w.trim()).filter(Boolean);

  slides.push(mkSlide('practice', '🧱 Grammar', 'activity', 'sorting',
    hub.hub === 'playground' ? `🧱 Build the Sentence!` : `🧱 Structure: ${pack.grammarTarget}`,
    flatImagePrompt(`grammar building blocks sentence construction, ${topic}`, hub),
    {
      prompt: `🧱 Drag the blocks to build:\n\n"${grammarSentence}"`,
      grammarPattern: pack.grammarTarget,
      grammarSlots: grammarBlockItems.map((word, i) => ({
        label: `Slot ${i + 1}`,
        correctAnswer: word,
        filled: null,
      })),
      grammarBlocks: [...grammarBlockItems].sort(() => Math.random() - 0.5),
      options: [...grammarBlockItems].sort(() => Math.random() - 0.5),
      correctAnswer: grammarSentence,
    },
    `Students drag grammar blocks to form: "${grammarSentence}". Target structure: ${pack.grammarTarget}.`,
    ['grammar', 'building-blocks', 'reading'],
    'grammar_blocks', 'bento',
    buildInteraction('grammar_blocks', `Build the sentence: "${grammarSentence}"`,
      grammarBlockItems, grammarSentence),
    {
      has_reading: true,
      has_grammar_blocks: true,
      skillFocus: 'reading',
      grammarSlots: grammarBlockItems.map((word, i) => ({
        label: `Slot ${i + 1}`,
        correctAnswer: word,
        filled: null,
      })),
      grammarBlocks: [...grammarBlockItems].sort(() => Math.random() - 0.5),
    },
  ));

  // Additional grammar practice: Article Picker (Playground) or Sentence Transform (Academy/Pro)
  if (hub.hub === 'playground') {
    slides.push(mkSlide('practice', '🧱 Grammar', 'activity', 'quiz',
      '🅰️ A or An?',
      flatImagePrompt(`articles a an grammar kids, ${topic}`, hub),
      {
        quizQuestion: `Which one? ___ ${primaryWord?.word?.toLowerCase()}`,
        quizOptions: [
          { text: `a ${primaryWord?.word?.toLowerCase()}`, isCorrect: !/^[aeiou]/i.test(primaryWord?.word || '') },
          { text: `an ${primaryWord?.word?.toLowerCase()}`, isCorrect: /^[aeiou]/i.test(primaryWord?.word || '') },
        ],
      },
      `Article practice: "a" vs "an" with "${primaryWord?.word}".`,
      ['grammar', 'articles'],
      'article_picker', 'centered',
      buildInteraction('article_picker', `Choose the correct article for "${primaryWord?.word}"`,
        ['a', 'an'], /^[aeiou]/i.test(primaryWord?.word || '') ? 'an' : 'a'),
      { has_grammar_blocks: true, has_reading: true },
    ));
  } else {
    const transformSentence = pack.grammarExamples[1] || pack.grammarExamples[0] || `They use ${topic} daily.`;
    slides.push(mkSlide('practice', '🔄 Grammar', 'activity', 'sorting',
      '🔄 Transform the Sentence',
      flatImagePrompt(`sentence transformation grammar, ${topic}`, hub),
      {
        originalSentence: transformSentence,
        transformType: 'statement_to_question',
        prompt: `Transform this statement into a question:\n\n"${transformSentence}"`,
      },
      `Students transform: "${transformSentence}" → question form.`,
      ['grammar', 'transform'],
      'sentence_transform', 'centered',
      buildInteraction('sentence_transform', `Transform: "${transformSentence}"`,
        undefined, undefined),
      { has_grammar_blocks: true, has_reading: true },
    ));
  }

  // ═══════════════════════════════════════════════════
  // SLIDE 6: WRITING FOCUS — "The Memory Trace"
  // Ghost Vector (Silhouette) + Letter Tracing Canvas
  // ═══════════════════════════════════════════════════
  slides.push(mkSlide('production', '✍️ Writing', 'activity', 'image',
    hub.hub === 'playground'
      ? `✍️ Trace the Letter: ${tracingLetter}`
      : `✍️ Write: ${primaryWord?.word}`,
    flatImagePrompt(`ghost silhouette outline of ${primaryWord?.word}, dotted tracing path for letter ${tracingLetter}, white background`, hub),
    {
      prompt: hub.hub === 'playground'
        ? `✍️ Trace the letter "${tracingLetter}"!\n\nCan you see the shadow of the ${primaryWord?.word}? Trace over the dotted line!`
        : `✍️ Write your answer:\n\nUse the word "${primaryWord?.word}" in a complete sentence using ${pack.grammarTarget}.`,
    },
    `Writing activity: Students trace letter "${tracingLetter}" (Playground) or write sentences (Academy/Pro). Ghost vector silhouette of ${primaryWord?.word} visible.`,
    ['writing', 'tracing', 'memory'],
    'tactile_tracing', 'centered',
    buildInteraction('tactile_tracing', `Trace the letter "${tracingLetter}"`,
      [tracingLetter], tracingLetter),
    {
      has_writing: true,
      skillFocus: 'writing',
      tracingLetter,
      ghostVectorSubject: primaryWord?.word,
    },
  ));

  // Letter Hunt — Writing/Recall (find the missing letter)
  slides.push(mkSlide('production', '🔍 Writing', 'activity', 'quiz',
    `🔍 Find the Missing Letter!`,
    flatImagePrompt(`missing letter puzzle, ghost vector silhouette, ${topic}`, hub),
    {
      prompt: `Which letter is missing?\n\n${primaryWord?.word?.replace(primaryWord.word[0], '_')}`,
      phonemeTarget,
      targetLetterIndex: 0,
      distractors: ['B', 'D', 'P', 'M'].filter(l => l !== tracingLetter).slice(0, 3),
    },
    `Letter Hunt: Students identify the missing letter in "${primaryWord?.word}". Ghost Vector silhouette visible.`,
    ['writing', 'letter-hunt', 'recall'],
    'letter_hunt', 'centered',
    buildInteraction('letter_hunt', `What letter is missing?`,
      [tracingLetter, 'B', 'D', 'P'].sort(() => Math.random() - 0.5), tracingLetter),
    {
      has_writing: true,
      skillFocus: 'writing',
      tracingLetter,
      ghostVectorSubject: primaryWord?.word,
    },
  ));

  // ═══════════════════════════════════════════════════
  // PRACTICE PHASE — Additional Vocabulary Activities
  // ═══════════════════════════════════════════════════

  // Word Builder — Spell the word
  if (pack.vocabulary.length > 1) {
    const wordToSpell = pack.vocabulary[1];
    slides.push(mkSlide('practice', '🔤 Vocabulary', 'activity', 'sorting',
      `🔤 Spell It: ${wordToSpell.word}`,
      flatImagePrompt(`${wordToSpell.imageKeywords}, isolated, white background`, hub),
      {
        prompt: `Arrange the letters to spell: ${wordToSpell.word}`,
        options: wordToSpell.word.split('').sort(() => Math.random() - 0.5),
        correctAnswer: wordToSpell.word,
      },
      `Students spell "${wordToSpell.word}" by arranging letter tiles.`,
      ['vocabulary', 'spelling'],
      'word_builder', 'centered',
      buildInteraction('word_builder', `Spell "${wordToSpell.word}"`,
        wordToSpell.word.split(''), wordToSpell.word),
      { has_reading: true, has_writing: true },
    ));
  }

  // Dialogue Practice
  slides.push(mkSlide('practice', '💬 Dialogue', 'dialogue', 'roleplay',
    hub.hub === 'playground' ? '💬 Talk with Pip!' : '💬 Conversation Practice',
    flatImagePrompt(`${topic} dialogue conversation`, hub),
    { prompt: pack.dialogueLines.join('\n') },
    'Model the dialogue. Students practice in pairs.',
    ['dialogue', 'speaking', 'practice'],
    undefined, 'split',
    undefined,
    { has_speaking: true, has_listening: true },
  ));

  // Hub-specific interactive activity
  if (hub.hub === 'playground') {
    slides.push(mkSlide('practice', '🎮 Game', 'game', 'drag-drop',
      '🎯 Drag & Drop!',
      flatImagePrompt(`${topic} drag drop game kids`, hub),
      {
        prompt: pack.gameDescription,
        dragItems: pack.vocabulary.map(v => ({ text: v.word, target: v.definition, emoji: v.emoji || '🔤', imageKeywords: v.imageKeywords })),
      },
      'Interactive drag & drop: students drag words to matching pictures.',
      ['drag-drop', 'activity', 'game'],
      'drag_and_drop_image', 'bento',
      buildInteraction('drag_and_drop_image', 'Drag each word to the matching picture!',
        pack.vocabulary.map(v => v.word), pack.vocabulary[0].word),
      { has_reading: true },
    ));
  } else if (hub.hub === 'academy') {
    const quizWord = pack.vocabulary[0];
    slides.push(mkSlide('practice', '⚡ Quiz', 'activity', 'quiz',
      '⚡ Speed Quiz!',
      flatImagePrompt(`quiz question neon teen, ${topic}`, hub),
      {
        quizQuestion: `What does "${quizWord.word}" mean?`,
        quizOptions: [
          { text: quizWord.definition, isCorrect: true },
          { text: pack.vocabulary.length > 1 ? pack.vocabulary[1].definition : 'Something unrelated', isCorrect: false },
          { text: pack.vocabulary.length > 2 ? pack.vocabulary[2].definition : 'A different concept', isCorrect: false },
          { text: 'None of the above', isCorrect: false },
        ].sort(() => Math.random() - 0.5),
      },
      `Speed Quiz: Correct answer is "${quizWord.definition}".`,
      ['quiz', 'speed'],
      'speed_quiz', 'centered',
      buildInteraction('speed_quiz', `What does "${quizWord.word}" mean?`,
        [quizWord.definition, 'Something unrelated'], quizWord.definition),
      { has_reading: true },
    ));
  } else {
    slides.push(mkSlide('practice', '📊 Case Study', 'activity', 'roleplay',
      '📊 Case Study Analysis',
      flatImagePrompt(`${topic} case study business corporate`, hub),
      {
        prompt: `Scenario:\nA company is facing challenges with ${topic}. As a consultant, analyze and recommend.\n\nConsider: Key issues, data needed, recommendation.`,
        caseStudy: `A mid-size corporation needs to improve their ${topic} strategy.`,
      },
      'Present the case study. Give participants 5 minutes to analyze.',
      ['case-study', 'analysis'],
      'case_study_analysis', 'split',
      buildInteraction('case_study_analysis', `Analyze the ${topic} case study.`),
      { has_reading: true, has_writing: true, has_speaking: true },
    ));
  }

  // ═══════════════════════════════════════════════════
  // PRODUCTION PHASE — Free Speaking
  // ═══════════════════════════════════════════════════
  slides.push(mkSlide('production', '🎤 Production', 'speaking', 'roleplay',
    hub.hub === 'playground' ? '🎤 Your Turn to Talk!' : '🎤 Express Yourself!',
    flatImagePrompt(`${topic} speaking presenting`, hub),
    {
      prompt: hub.hub === 'playground'
        ? `Use these words:\n${pack.vocabulary.map(v => `✅ ${v.word}`).join('\n')}\n\nTry to use "${pack.grammarTarget}"!`
        : `Share your opinion about ${topic} using at least 3 new terms.`,
    },
    'Free speaking practice. Monitor and note errors for feedback.',
    ['speaking', 'production'],
    undefined, 'centered',
    undefined,
    { has_speaking: true, skillFocus: 'speaking' },
  ));

  // ═══════════════════════════════════════════════════
  // COOL-OFF — Brain Break + Celebration
  // ═══════════════════════════════════════════════════
  slides.push(mkSlide('production', '📋 Summary', 'summary', 'title',
    hub.hub === 'playground' ? '📋 What Did We Learn? 🌟' : '📋 Key Takeaways',
    'review summary checklist',
    { prompt: pack.objectives.map((o, i) => `${i + 1}. ✅ ${o}`).join('\n') },
    'Review each objective. Celebrate progress!',
    ['review', 'summary'],
    undefined, 'centered',
  ));

  slides.push(mkSlide('production', '⭐ XP Reward', 'summary', 'quiz',
    hub.hub === 'playground' ? '⭐ You Earned XP!' : '🏆 Rate Your Progress',
    'achievement reward stars celebration',
    {
      quizQuestion: hub.hub === 'playground' ? 'How well did you learn today?' : 'Rate your understanding:',
      quizOptions: [
        { text: '⭐⭐⭐ I can do it perfectly! (+30 XP)', isCorrect: true },
        { text: '⭐⭐ I can do it with some help (+20 XP)', isCorrect: true },
        { text: '⭐ I need more practice (+10 XP)', isCorrect: true },
      ],
    },
    'All answers valid. This builds metacognition.',
    ['self-assessment', 'xp'],
    undefined, 'centered',
  ));

  slides.push(mkSlide('production', '👋 Goodbye', 'goodbye', 'title',
    hub.hub === 'playground' ? '👋 Great Job! See You Next Time! 🌟' : '👋 See You Next Session',
    `${topic} goodbye farewell`,
    {
      prompt: hub.hub === 'playground'
        ? 'Goodbye, everyone! You are INCREDIBLE! 🌟\n\nPip says: "See you next time, friends!" 🐣💛\n\n+50 XP earned! 🎉'
        : `Great work on ${topic} today!\n\nKeep practicing — you\'re making real progress!\n\n+40 XP earned! 🏆`,
    },
    'Celebrate! High-fives, stickers, or stamps.',
    ['goodbye', 'celebration'],
    undefined, 'centered',
  ));

  return {
    lessonMeta: {
      title: `${topic} — ${hub.label} Lesson`,
      hub: hub.hub,
      level: cefrLevel,
      estimatedMinutes: 30,
    },
    topic,
    level,
    ageGroup,
    slides,
    generatedAt: new Date().toISOString(),
  };
}

// Legacy synchronous wrapper
export function generatePPPLesson(formData: WizardFormData): PPPLessonPlan {
  const hub = HUB_CONFIGS[resolveHub(formData.ageGroup)];
  const mainWord = formData.topic.split(' ').filter(w => w.length > 2)[0] || formData.topic;
  const cap = mainWord.charAt(0).toUpperCase() + mainWord.slice(1);

  const fallbackPack: TopicPack = {
    vocabulary: [
      { word: cap, definition: `A key word about ${formData.topic}`, exampleSentence: `I like ${mainWord}.`, fillBlank: `I like ____.`, imageKeywords: `${formData.topic} illustration`, emoji: '🌟' },
      { word: 'Learn', definition: 'To get new knowledge', exampleSentence: `Let's learn about ${formData.topic}!`, fillBlank: `Let's ____ about ${formData.topic}!`, imageKeywords: 'learning education', emoji: '📚' },
      { word: 'Practice', definition: 'To do something again and again to improve', exampleSentence: 'Practice makes perfect!', fillBlank: '____ makes perfect!', imageKeywords: 'practice training', emoji: '🎯' },
      { word: 'Understand', definition: 'To know the meaning of something', exampleSentence: `I understand ${formData.topic} now!`, fillBlank: `I ____ ${formData.topic} now!`, imageKeywords: 'understanding knowledge', emoji: '💡' },
    ],
    grammarTarget: 'Simple Present',
    grammarExamples: [`I like ${formData.topic}.`, `You learn about ${formData.topic}.`],
    warmUpQuestion: `What do you know about ${formData.topic}?`,
    objectives: [`Learn key vocabulary about ${formData.topic}`, 'Practice using new words in sentences', 'Complete interactive activities', 'Express ideas about the topic'],
    dialogueLines: [`A: What is ${formData.topic}?`, `B: ${formData.topic} is interesting!`, 'A: Tell me more.', 'B: Let me explain...'],
    gameDescription: `Match the ${formData.topic} vocabulary with their definitions!`,
    productionTask: `Create a short presentation about ${formData.topic} using the new vocabulary.`,
    songOrChant: '',
  };

  return buildPPPLessonFromPack(formData, fallbackPack);
}
