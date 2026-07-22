// Central schema map for all 22 arcade catalog games.
// Used by GameMaker (starter content + validation + AI prompt shape) and the
// edge function `generate-game-content` (shape descriptions).
//
// Each entry is intentionally small and JSON-first so a creator can hand-edit
// without a custom editor per type.

export interface GameContentSchema {
  /** Hint for AI / creators describing the required JSON shape. */
  shape: string;
  /** Minimal valid starter content. */
  starter: any;
  /** Return array of human-readable errors (empty = valid). */
  validate: (raw: any) => string[];
}

const isArr = (x: any) => Array.isArray(x);
const need = (cond: boolean, msg: string, out: string[]) => { if (!cond) out.push(msg); };

export const GAME_CONTENT_SCHEMAS: Record<string, GameContentSchema> = {
  // ── Foundational ─────────────────────────────────────────────────────
  matching_pairs: {
    shape: '{"pairs":[{"left":"...","right":"..."}, ...]} 4-8 pairs',
    starter: { pairs: [{ left: 'cat', right: '🐱' }, { left: 'dog', right: '🐶' }, { left: 'fish', right: '🐟' }, { left: 'bird', right: '🐦' }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.pairs) && r.pairs.length >= 3, 'pairs[] needs ≥3', e);
      (r?.pairs || []).forEach((p: any, i: number) => need(!!p?.left && !!p?.right, `pairs[${i}] missing left/right`, e));
      return e;
    },
  },
  drag_drop_sort: {
    shape: '{"buckets":["A","B"],"items":[{"word":"...","bucket":"A"}, ...]} 2-3 buckets, 6-12 items',
    starter: { buckets: ['Nouns', 'Verbs'], items: [{ word: 'cat', bucket: 'Nouns' }, { word: 'run', bucket: 'Verbs' }, { word: 'book', bucket: 'Nouns' }, { word: 'eat', bucket: 'Verbs' }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.buckets) && r.buckets.length >= 2, 'buckets[] needs ≥2', e);
      need(isArr(r?.items) && r.items.length >= 4, 'items[] needs ≥4', e);
      (r?.items || []).forEach((it: any, i: number) => {
        need(!!it?.word, `items[${i}].word required`, e);
        need(isArr(r?.buckets) && r.buckets.includes(it?.bucket), `items[${i}].bucket must be in buckets`, e);
      });
      return e;
    },
  },
  sentence_builder: {
    shape: '{"sentences":[{"words":["..."],"answer":["..."]}, ...]} 5-8 sentences; answer = correct order of the same words',
    starter: { sentences: [{ words: ['I', 'love', 'learning', 'English'], answer: ['I', 'love', 'learning', 'English'] }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.sentences) && r.sentences.length >= 1, 'sentences[] required', e);
      (r?.sentences || []).forEach((s: any, i: number) => {
        need(isArr(s?.words) && s.words.length >= 2, `sentences[${i}].words needs ≥2`, e);
        need(isArr(s?.answer) && s.answer.length === (s?.words?.length || 0), `sentences[${i}].answer length must match words`, e);
      });
      return e;
    },
  },
  spelling_race: {
    shape: '{"words":[{"word":"...","hint":"..."}, ...]} 6-12 words',
    starter: { words: [{ word: 'apple', hint: 'a red fruit' }, { word: 'school', hint: 'where students learn' }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.words) && r.words.length >= 4, 'words[] needs ≥4', e);
      (r?.words || []).forEach((w: any, i: number) => need(typeof w?.word === 'string' && w.word.length >= 2, `words[${i}].word required`, e));
      return e;
    },
  },
  phonics_challenge: {
    shape: '{"items":[{"sound":"/æ/","word":"cat","options":["cat","cup","cot"],"correct":0}, ...]} 5-8 items',
    starter: { items: [{ sound: '/æ/', word: 'cat', options: ['cat', 'cup', 'cot'], correct: 0 }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.items) && r.items.length >= 3, 'items[] needs ≥3', e);
      (r?.items || []).forEach((it: any, i: number) => {
        need(!!it?.sound, `items[${i}].sound required`, e);
        need(isArr(it?.options) && it.options.length >= 2, `items[${i}].options needs ≥2`, e);
        need(typeof it?.correct === 'number' && it.correct >= 0 && it.correct < (it?.options?.length || 0), `items[${i}].correct invalid index`, e);
      });
      return e;
    },
  },
  listening_hunt: {
    shape: '{"items":[{"transcript":"...","prompt":"What did you hear?","options":["a","b","c"],"correct":0}, ...]} 4-8 items',
    starter: { items: [{ transcript: 'I have a red apple.', prompt: 'What color is the apple?', options: ['red', 'green', 'blue'], correct: 0 }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.items) && r.items.length >= 3, 'items[] needs ≥3', e);
      (r?.items || []).forEach((it: any, i: number) => {
        need(!!it?.transcript, `items[${i}].transcript required`, e);
        need(isArr(it?.options) && it.options.length >= 2, `items[${i}].options needs ≥2`, e);
        need(typeof it?.correct === 'number', `items[${i}].correct required`, e);
      });
      return e;
    },
  },
  song_chant: {
    shape: '{"title":"...","lines":["..."],"target_words":["..."]} 4-8 lines',
    starter: { title: 'Days of the Week', lines: ['Monday, Tuesday,', 'Wednesday, Thursday,', 'Friday, Saturday,', 'Sunday too!'], target_words: ['Monday', 'Friday'] },
    validate: (r) => {
      const e: string[] = []; need(!!r?.title, 'title required', e);
      need(isArr(r?.lines) && r.lines.length >= 3, 'lines[] needs ≥3', e);
      return e;
    },
  },
  timeline_race: {
    shape: '{"events":[{"text":"...","time":"yesterday|now|tomorrow"}, ...]} 5-10 events',
    starter: { events: [{ text: 'I ate breakfast', time: 'yesterday' }, { text: 'I am studying', time: 'now' }, { text: 'I will sleep', time: 'tomorrow' }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.events) && r.events.length >= 3, 'events[] needs ≥3', e);
      (r?.events || []).forEach((ev: any, i: number) => {
        need(!!ev?.text, `events[${i}].text required`, e);
        need(!!ev?.time, `events[${i}].time required`, e);
      });
      return e;
    },
  },

  // ── Alphabet & Phonics Blocks (Playground foundational) ──────────────
  alphabet_blocks_order: {
    shape: '{"mode":"order_alphabet","letters":["A","B","C","D","E","F"]} 4-12 uppercase letters in TARGET order',
    starter: { mode: 'order_alphabet', letters: ['A', 'B', 'C', 'D', 'E', 'F'] },
    validate: (r) => {
      const e: string[] = [];
      need(r?.mode === 'order_alphabet', 'mode must be "order_alphabet"', e);
      need(isArr(r?.letters) && r.letters.length >= 3 && r.letters.length <= 26, 'letters[] needs 3–26 items', e);
      (r?.letters || []).forEach((l: any, i: number) => need(typeof l === 'string' && /^[A-Za-z]$/.test(l), `letters[${i}] must be a single A–Z letter`, e));
      return e;
    },
  },
  letter_sounds_blocks: {
    shape: '{"mode":"letter_sounds","items":[{"letter":"A","sound":"ah"}, ...]} 4-12 items; sound is optional phonic hint (e.g. "ah", "buh", "/æ/")',
    starter: { mode: 'letter_sounds', items: [
      { letter: 'A', sound: 'ah' }, { letter: 'B', sound: 'buh' },
      { letter: 'C', sound: 'kuh' }, { letter: 'D', sound: 'duh' },
      { letter: 'S', sound: 'sss' }, { letter: 'M', sound: 'mmm' },
    ] },
    validate: (r) => {
      const e: string[] = [];
      need(r?.mode === 'letter_sounds', 'mode must be "letter_sounds"', e);
      need(isArr(r?.items) && r.items.length >= 3, 'items[] needs ≥3', e);
      (r?.items || []).forEach((it: any, i: number) => need(typeof it?.letter === 'string' && /^[A-Za-z]$/.test(it.letter), `items[${i}].letter must be a single A–Z letter`, e));
      return e;
    },
  },
  phonics_word_blocks: {
    shape: '{"mode":"spell_word","words":[{"word":"cat","image":"🐱","hint":"a furry pet"}, ...]} 3-8 short CVC/CVCC words',
    starter: { mode: 'spell_word', words: [
      { word: 'cat', image: '🐱', hint: 'a furry pet' },
      { word: 'sun', image: '☀️', hint: 'shines in the sky' },
      { word: 'dog', image: '🐶', hint: 'says woof' },
      { word: 'hat', image: '🎩', hint: 'you wear it on your head' },
    ] },
    validate: (r) => {
      const e: string[] = [];
      need(r?.mode === 'spell_word', 'mode must be "spell_word"', e);
      need(isArr(r?.words) && r.words.length >= 2, 'words[] needs ≥2', e);
      (r?.words || []).forEach((w: any, i: number) => {
        need(typeof w?.word === 'string' && w.word.length >= 2 && /^[A-Za-z]+$/.test(w.word), `words[${i}].word must be alphabetic (≥2 letters)`, e);
      });
      return e;
    },
  },



  // ── Communication ────────────────────────────────────────────────────
  roleplay_mission: {
    shape: '{"scenario":"...","roles":["A","B"],"turns":[{"role":"A","line":"..."}, ...]} 4-10 turns',
    starter: { scenario: 'Ordering coffee', roles: ['Customer', 'Barista'], turns: [{ role: 'Barista', line: 'Hi! What can I get you?' }, { role: 'Customer', line: 'A small latte, please.' }] },
    validate: (r) => {
      const e: string[] = []; need(!!r?.scenario, 'scenario required', e);
      need(isArr(r?.roles) && r.roles.length === 2, 'roles[] needs exactly 2', e);
      need(isArr(r?.turns) && r.turns.length >= 3, 'turns[] needs ≥3', e);
      return e;
    },
  },
  pronunciation_quest: {
    shape: '{"items":[{"target":"...","ipa":"...","hint":"..."}, ...]} 4-8 items',
    starter: { items: [{ target: 'thought', ipa: '/θɔːt/', hint: 'tongue between teeth' }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.items) && r.items.length >= 3, 'items[] needs ≥3', e);
      (r?.items || []).forEach((it: any, i: number) => need(!!it?.target, `items[${i}].target required`, e));
      return e;
    },
  },
  fluency_round: {
    shape: '{"prompts":[{"topic":"...","seconds":60,"starter":"..."}, ...]} 3-6 prompts',
    starter: { prompts: [{ topic: 'My weekend', seconds: 60, starter: 'Last weekend I…' }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.prompts) && r.prompts.length >= 2, 'prompts[] needs ≥2', e);
      return e;
    },
  },
  story_continuation: {
    shape: '{"opening":"...","characters":["..."],"continuation_hints":["..."]}',
    starter: { opening: 'It was a dark and stormy night when…', characters: ['Maya', 'The cat'], continuation_hints: ['Describe what Maya saw', 'What did the cat do?'] },
    validate: (r) => {
      const e: string[] = []; need(!!r?.opening, 'opening required', e);
      need(isArr(r?.continuation_hints) && r.continuation_hints.length >= 2, 'continuation_hints[] needs ≥2', e);
      return e;
    },
  },
  debate_battle: {
    shape: '{"motion":"...","pro_points":["..."],"con_points":["..."]} 3-5 points each',
    starter: { motion: 'Remote work is better than office work.', pro_points: ['Flexibility', 'No commute'], con_points: ['Less social contact', 'Distractions'] },
    validate: (r) => {
      const e: string[] = []; need(!!r?.motion, 'motion required', e);
      need(isArr(r?.pro_points) && r.pro_points.length >= 2, 'pro_points[] needs ≥2', e);
      need(isArr(r?.con_points) && r.con_points.length >= 2, 'con_points[] needs ≥2', e);
      return e;
    },
  },
  business_sim: {
    shape: '{"scenario":"...","role":"...","tasks":[{"prompt":"...","sample_response":"..."}, ...]} 3-5 tasks',
    starter: { scenario: 'Q3 status meeting with your manager', role: 'Project lead', tasks: [{ prompt: 'Give a 30-second project update.', sample_response: 'We are on track. Phase 1 is complete…' }] },
    validate: (r) => {
      const e: string[] = []; need(!!r?.scenario, 'scenario required', e);
      need(isArr(r?.tasks) && r.tasks.length >= 2, 'tasks[] needs ≥2', e);
      return e;
    },
  },

  // ── Review ───────────────────────────────────────────────────────────
  memory_quest: {
    shape: '{"items":[{"prompt":"...","answer":"..."}, ...]} 6-12 items',
    starter: { items: [{ prompt: 'Past of "go"', answer: 'went' }, { prompt: 'Plural of "child"', answer: 'children' }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.items) && r.items.length >= 4, 'items[] needs ≥4', e);
      (r?.items || []).forEach((it: any, i: number) => { need(!!it?.prompt, `items[${i}].prompt required`, e); need(!!it?.answer, `items[${i}].answer required`, e); });
      return e;
    },
  },
  grammar_boss: {
    shape: '{"boss_name":"...","rounds":[{"question":"...","options":["a","b","c"],"correct":0,"explanation":"..."}, ...]} 5-10 rounds',
    starter: { boss_name: 'The Tense Titan', rounds: [{ question: 'She ___ to school every day.', options: ['go', 'goes', 'going'], correct: 1, explanation: 'Third person singular adds -s.' }] },
    validate: (r) => {
      const e: string[] = []; need(!!r?.boss_name, 'boss_name required', e);
      need(isArr(r?.rounds) && r.rounds.length >= 3, 'rounds[] needs ≥3', e);
      (r?.rounds || []).forEach((q: any, i: number) => {
        need(!!q?.question, `rounds[${i}].question required`, e);
        need(isArr(q?.options) && q.options.length >= 2, `rounds[${i}].options needs ≥2`, e);
        need(typeof q?.correct === 'number', `rounds[${i}].correct required`, e);
      });
      return e;
    },
  },
  vocab_tournament: {
    shape: '{"bracket":[{"word":"...","definition":"...","distractors":["a","b","c"]}, ...]} 8-16 words',
    starter: { bracket: [{ word: 'happy', definition: 'feeling joy', distractors: ['sad', 'angry', 'tired'] }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.bracket) && r.bracket.length >= 4, 'bracket[] needs ≥4', e);
      (r?.bracket || []).forEach((b: any, i: number) => {
        need(!!b?.word && !!b?.definition, `bracket[${i}] needs word+definition`, e);
        need(isArr(b?.distractors) && b.distractors.length >= 2, `bracket[${i}].distractors needs ≥2`, e);
      });
      return e;
    },
  },
  fluency_streak: {
    shape: '{"prompts":[{"text":"...","answer":"..."}, ...]} 8-15 quick prompts',
    starter: { prompts: [{ text: 'Translate: "house"', answer: 'house' }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.prompts) && r.prompts.length >= 5, 'prompts[] needs ≥5', e);
      return e;
    },
  },

  // ── Social ───────────────────────────────────────────────────────────
  team_mission: {
    shape: '{"mission":"...","stages":[{"goal":"...","prompt":"..."}, ...]} 3-5 stages',
    starter: { mission: 'Plan a class trip together', stages: [{ goal: 'Pick a destination', prompt: 'Each team member proposes one place and explains why.' }] },
    validate: (r) => { const e: string[] = []; need(!!r?.mission, 'mission required', e); need(isArr(r?.stages) && r.stages.length >= 2, 'stages[] needs ≥2', e); return e; },
  },
  classroom_battle: {
    shape: '{"questions":[{"q":"...","options":["a","b","c","d"],"correct":0,"time_seconds":20}, ...]} 8-15 questions',
    starter: { questions: [{ q: 'Past of "see"?', options: ['saw', 'seen', 'see', 'sees'], correct: 0, time_seconds: 15 }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.questions) && r.questions.length >= 5, 'questions[] needs ≥5', e);
      (r?.questions || []).forEach((q: any, i: number) => {
        need(!!q?.q, `questions[${i}].q required`, e);
        need(isArr(q?.options) && q.options.length >= 2, `questions[${i}].options needs ≥2`, e);
      });
      return e;
    },
  },
  leaderboard_event: {
    shape: '{"theme":"...","questions":[{"q":"...","options":["a","b","c"],"correct":0,"points":10}, ...]} 10-20 questions',
    starter: { theme: 'Travel vocab week', questions: [{ q: 'A place to sleep when travelling?', options: ['hotel', 'kitchen', 'street'], correct: 0, points: 10 }] },
    validate: (r) => {
      const e: string[] = []; need(!!r?.theme, 'theme required', e);
      need(isArr(r?.questions) && r.questions.length >= 5, 'questions[] needs ≥5', e);
      return e;
    },
  },
  coop_challenge: {
    shape: '{"challenge":"...","steps":[{"role":"A|B","prompt":"..."}, ...]} 4-8 steps',
    starter: { challenge: 'Plan a birthday party for a friend', steps: [{ role: 'A', prompt: 'Ask about the budget.' }, { role: 'B', prompt: 'Suggest a venue.' }] },
    validate: (r) => { const e: string[] = []; need(!!r?.challenge, 'challenge required', e); need(isArr(r?.steps) && r.steps.length >= 3, 'steps[] needs ≥3', e); return e; },
  },

  // ── Legacy types kept for the original 4 GameMaker games ─────────────
  verb_trio: {
    shape: '{"verbs":[{"present":"go","past":"went","participle":"gone"}, ...]} 6-10 IRREGULAR verbs',
    starter: { verbs: [{ present: 'go', past: 'went', participle: 'gone' }, { present: 'see', past: 'saw', participle: 'seen' }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.verbs) && r.verbs.length >= 2, 'verbs[] needs ≥2', e);
      (r?.verbs || []).forEach((v: any, i: number) => need(!!v?.present && !!v?.past && !!v?.participle, `verbs[${i}] missing fields`, e));
      return e;
    },
  },
  interview: {
    shape: '{"avatar":"🧑‍💼","turns":[{"question":"...","options":["a","b","c"],"correct":0}, ...]} 5-8 turns',
    starter: { avatar: '🧑‍💼', turns: [{ question: "Hi! What's your name?", options: ['My name is Anna.', 'I name Anna.', 'I am name Anna.'], correct: 0 }] },
    validate: (r) => {
      const e: string[] = []; need(isArr(r?.turns) && r.turns.length >= 1, 'turns[] required', e);
      (r?.turns || []).forEach((t: any, i: number) => {
        need(!!t?.question, `turns[${i}].question required`, e);
        need(isArr(t?.options) && t.options.length >= 2, `turns[${i}].options needs ≥2`, e);
        need(typeof t?.correct === 'number' && t.correct >= 0 && t.correct < (t?.options?.length || 0), `turns[${i}].correct invalid`, e);
      });
      return e;
    },
  },
  sorting: {
    shape: '{"buckets":["A","B"],"items":[{"word":"...","bucket":"A"}, ...]} same as drag_drop_sort',
    starter: { buckets: ['Nouns', 'Verbs'], items: [{ word: 'run', bucket: 'Verbs' }, { word: 'cat', bucket: 'Nouns' }] },
    validate: (r) => GAME_CONTENT_SCHEMAS.drag_drop_sort.validate(r),
  },
};

export function getStarter(id: string): any {
  return GAME_CONTENT_SCHEMAS[id]?.starter ?? {};
}
export function validateGameContent(id: string, raw: any): string[] {
  const s = GAME_CONTENT_SCHEMAS[id];
  if (!s) return [`Unknown game type "${id}"`];
  if (!raw || typeof raw !== 'object') return ['Content must be a JSON object.'];
  return s.validate(raw);
}
export function getShapeHint(id: string): string {
  return GAME_CONTENT_SCHEMAS[id]?.shape ?? 'free-form JSON';
}
