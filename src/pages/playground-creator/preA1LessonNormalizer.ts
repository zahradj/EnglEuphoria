import type { PlaygroundLessonContent, PlaygroundPage } from '@/playground-blueprint/types';

const isPreA1 = (cefr?: string | null) => /pre[-_ ]?a1/i.test(String(cefr ?? ''));

const isGreetingLesson = (lesson: PlaygroundLessonContent, unitTopic?: string | null) => {
  const text = [
    unitTopic,
    (lesson as any).unit_theme,
    (lesson as any).communication_goal,
    (lesson as any).grammar_target,
    (lesson as any).focus_label,
    ...(lesson.vocab ?? []),
  ].join(' ').toLowerCase();
  return /\b(greet|greeting|hello|hi|introduc|my name|nice to meet|goodbye|bye)\b/.test(text);
};

const unique = (values: unknown[], fallback: string[]) => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out.length ? out : fallback;
};

const image = (id: string, label: string, subject: string) => ({ kind: 'image' as const, id, label, subject });
const audio = (id: string, label: string, text: string, voice = 'pip') => ({ kind: 'audio' as const, id, label, text, voice });
const text = (id: string, label: string, value: string) => ({ kind: 'text' as const, id, label, value });
const activity = (id: string, label: string, type: string, config: Record<string, unknown>) => ({ kind: 'activity' as const, id, label, type, config });

function sentenceFor(frame: string, word: string) {
  return frame.includes('___') ? frame.replace('___', word.replace(/\.$/, '')) : `${frame} ${word}.`;
}

function buildSafeLessonOnePages(lesson: PlaygroundLessonContent, unitTopic?: string | null): PlaygroundPage[] {
  const greeting = isGreetingLesson(lesson, unitTopic);
  const vocab = unique(
    lesson.vocab ?? [],
    greeting ? ['hello', 'hi', 'goodbye', 'my name is'] : ['cat', 'dog', 'fish'],
  ).slice(0, greeting ? 4 : 5);
  const phonic = lesson.phonic ?? { letter: 'a', sound: '/a/', words: ['ant', 'apple', 'axe'] };
  const modelLines = greeting
    ? ['Hello!', 'Hi!', 'My name is Pip.', 'Goodbye!']
    : vocab.slice(0, 3).map((word) => sentenceFor(String((lesson as any).grammar_target || 'It is a ___.'), word));
  const pairs = vocab.map((word) => ({ word, image: '', image_url: '', audio_word: word }));
  const page = (phase_id: string, title: string, blocks: PlaygroundPage['blocks']): PlaygroundPage => ({
    id: `l1.${phase_id}`,
    phase_id,
    title,
    blocks,
  });

  return [
    page('warmup', 'Hello routine', [
      text('l1.warmup.goal', 'Goal', greeting ? 'Say hello.' : 'Listen first.'),
      image('l1.warmup.img', 'Pip waves', greeting ? 'Pip waves hello with a friendly smile, no text' : `Pip points to ${vocab[0]}, no text`),
      audio('l1.warmup.aud-1', greeting ? 'Hello' : 'Listen', greeting ? 'Hello!' : `Listen. ${vocab[0]}.`),
      audio('l1.warmup.aud-2', greeting ? 'Hi' : 'Point', greeting ? 'Hi!' : `Point to ${vocab[0]}.`),
    ]),
    page('vocabulary', 'Picture words', vocab.flatMap((word, index) => [
      image(`l1.vocabulary.img-${index}`, word, greeting ? `${word} greeting gesture, no text` : word),
      audio(`l1.vocabulary.aud-${index}`, word, word),
    ])),
    page('flashcards', 'Listen and tap', [
      text('l1.flashcards.goal', 'Objective', 'Hear then tap.'),
      activity('l1.flashcards.act', 'Listen and tap', 'hotspot', {
        prompt: 'Listen. Tap picture.',
        objective: 'Recognize the sound from a picture.',
        words: vocab,
        prompts: vocab,
        pairs,
        reinforcement_target: { skill_key: 'listening_vocab', target_words: vocab },
      }),
    ]),
    page('listen_and_point', 'Listen and point', [
      text('l1.listen.goal', 'Objective', 'Point to sound.'),
      ...vocab.map((word, index) => image(`l1.listen.img-${index}`, word, greeting ? `${word} as a greeting action, no text` : word)),
      activity('l1.listen.act', 'Listen and point', 'hotspot', {
        prompt: 'Listen. Point.',
        objective: 'Connect audio to one picture.',
        words: vocab,
        prompts: vocab,
        pairs,
        reinforcement_target: { skill_key: 'audio_picture_match', target_words: vocab },
      }),
    ]),
    page('modeling', greeting ? 'Model: hello' : 'Model: say it', [
      image('l1.modeling.scene', 'Model scene', greeting ? 'Pip and Bella wave hello and introduce themselves, no speech bubbles, no text' : `Pip shows ${vocab[0]} to Bella, no text`),
      ...modelLines.map((line, index) => audio(`l1.modeling.line-${index}`, `Line ${index + 1}`, line, index % 2 === 0 ? 'pip' : 'bella')),
      text('l1.modeling.goal', 'Objective', greeting ? 'Listen. Wave. Repeat.' : 'Listen. Repeat.'),
    ]),
    page('match_word', 'Sound match', [
      text('l1.match.goal', 'Objective', 'Match sound.'),
      activity('l1.match.act', 'Sound match', 'match', {
        prompt: 'Match sound picture.',
        objective: 'Review vocabulary by sound, not reading.',
        pairs: vocab.slice(0, 4).map((word) => ({ left: word, right: word, image_url: '' })),
        reinforcement_target: { skill_key: 'vocab_review', target_words: vocab.slice(0, 4) },
      }),
    ]),
    page('practice', 'Drag pictures', [
      text('l1.practice.goal', 'Objective', 'Drag to match.'),
      activity('l1.practice.act', 'Drag picture', 'drag_drop', {
        prompt: 'Drag to picture.',
        objective: 'Use one active matching game after listening practice.',
        words: vocab,
        pairs,
        reinforcement_target: { skill_key: 'vocab_picture_match', target_words: vocab },
      }),
    ]),
    page('memory_match', 'Memory pictures', [
      text('l1.memory.goal', 'Objective', 'Find a pair.'),
      activity('l1.memory.act', 'Memory pictures', 'memory_match', {
        prompt: 'Find a pair.',
        objective: 'Review vocabulary with picture memory.',
        words: vocab,
        pairs,
        reinforcement_target: { skill_key: 'vocab_recall', target_words: vocab },
      }),
    ]),
    page('phonics', 'Sound play', [
      text('l1.phonics.goal', 'Objective', 'Hear the sound.'),
      audio('l1.phonics.sound', 'Focus sound', `${phonic.sound || phonic.letter}.`),
      ...(phonic.words ?? []).slice(0, 3).flatMap((word, index) => [
        image(`l1.phonics.img-${index}`, word, word),
        audio(`l1.phonics.aud-${index}`, word, word),
      ]),
    ]),
    page('sentence', greeting ? 'Say my name' : 'Say it', [
      text('l1.sentence.goal', 'Objective', greeting ? 'Say your name.' : 'Say one line.'),
      image('l1.sentence.img', 'Speaking turn', greeting ? 'Pip points to himself, then waves to Bella, no text' : `Pip points to ${vocab[0]}, no text`),
      audio('l1.sentence.model', 'Model', greeting ? 'My name is Pip.' : modelLines[0]),
      activity('l1.sentence.act', 'Tap and say', 'hotspot', {
        prompt: 'Tap. Say it.',
        objective: greeting ? 'Repeat the name chunk with support.' : 'Repeat one model sentence with support.',
        words: greeting ? ['Pip', 'Bella'] : vocab.slice(0, 3),
        prompts: greeting ? ['My name is Pip.'] : modelLines.slice(0, 3),
        reinforcement_target: { skill_key: greeting ? 'speaking_chunk' : 'guided_sentence', target_words: vocab },
      }),
    ]),
    page('spelling', 'Trace and say', [
      text('l1.spelling.goal', 'Objective', 'Move and say.'),
      image('l1.spelling.img', 'Air trace', `Pip air-traces the ${phonic.letter || 'a'} sound, no text`),
      audio('l1.spelling.aud', 'Say the sound', `${phonic.sound || phonic.letter}. ${((phonic.words ?? [])[0]) || vocab[0]}.`),
    ]),
    page('cooldown', 'Goodbye', [
      image('l1.cooldown.img', 'Goodbye', 'Pip and Bella wave goodbye, smiling, no text'),
      audio('l1.cooldown.aud', 'Goodbye', greeting ? 'Goodbye!' : 'Great work! Goodbye!'),
    ]),
  ];
}

export function normalizePreA1LessonForCreator(
  lesson: PlaygroundLessonContent,
  cefr?: string | null,
  unitTopic?: string | null,
): PlaygroundLessonContent {
  if (!isPreA1(cefr) || Number(lesson.lesson_number) !== 1) return lesson;
  const greeting = isGreetingLesson(lesson, unitTopic);
  const vocab = unique(
    lesson.vocab ?? [],
    greeting ? ['hello', 'hi', 'goodbye', 'my name is'] : ['cat', 'dog', 'fish'],
  ).slice(0, greeting ? 4 : 5);
  const grammarTarget = greeting ? 'My name is ___.' : String((lesson as any).grammar_target || 'It is a ___.');
  const sentenceModels = greeting
    ? ['Hello!', 'Hi!', 'My name is Pip.', 'Goodbye!']
    : vocab.slice(0, 3).map((word) => sentenceFor(grammarTarget, word));
  return {
    ...lesson,
    vocab,
    grammar_target: grammarTarget,
    sentence_models: sentenceModels,
    key_phrases: sentenceModels,
    pages: buildSafeLessonOnePages({ ...lesson, vocab, grammar_target: grammarTarget } as PlaygroundLessonContent, unitTopic),
  } as PlaygroundLessonContent;
}