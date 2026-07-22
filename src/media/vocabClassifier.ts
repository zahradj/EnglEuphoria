/**
 * vocabClassifier — deterministic split of Playground vocab into rendering
 * buckets, used by the media planner to decide if an image should show:
 *   - the THING itself (object: "cat", "apple", "red")  →  no character.
 *   - a CAST CHARACTER doing it (action/expression: "jump", "hello")  →  mascot.
 *
 * Pure, no AI. Seeded for Pre-A1 / A1 Playground scope; extend the lists as
 * the curriculum grows. Anything unknown → "abstract" → falls back to the
 * lead character holding a symbolic prop (see runMediaPlan).
 */

export type VocabKind = 'object' | 'action' | 'expression' | 'abstract';

const OBJECTS = new Set<string>([
  // animals
  'cat','dog','fox','rabbit','bunny','bear','tiger','lion','monkey','duck','duckling','chick','owl','fish','crab','cow','horse','pig','sheep','bird','frog','elephant','giraffe','zebra',
  // food
  'apple','banana','bread','milk','egg','cake','cookie','rice','water','juice','pizza','cheese','fruit',
  // colors
  'red','blue','green','yellow','orange','purple','pink','brown','black','white',
  // clothing / objects
  'hat','shoe','shoes','shirt','sock','bag','book','ball','car','bus','train','bike','chair','table','bed','door','window','toy','pen','pencil','cup',
  // places
  'home','house','school','park','garden','jungle','sea','beach','forest','farm','zoo','room',
  // body parts
  'eye','ear','nose','mouth','hand','foot','head','hair','arm','leg',
  // size (renderable concretely as comparison illustrations)
  'big','small','tall','short','long','little',
]);

const ACTIONS = new Set<string>([
  'run','jump','walk','sit','stand','clap','wave','sing','dance','eat','drink','sleep','play','swim','read','write','draw','look','listen','smile','laugh','cry','hug','point','open','close','push','pull','throw','catch','climb','fly','ride','wash','brush','fall',
]);

const EXPRESSIONS = new Set<string>([
  'hello','hi','goodbye','bye','please','thanks','thank','sorry','yes','no','ok','okay','welcome',
  'happy','sad','angry','scared','tired','sleepy','excited','shy','surprised','hungry','thirsty','cold','hot',
]);

function normalize(word: string): string {
  return word.toLowerCase().trim().replace(/[.,!?'"]/g, '');
}

export function classifyVocab(word: string): VocabKind {
  const w = normalize(word);
  if (!w) return 'abstract';
  if (OBJECTS.has(w)) return 'object';
  if (ACTIONS.has(w)) return 'action';
  if (EXPRESSIONS.has(w)) return 'expression';
  // light morphology — handle "running", "jumped", "hellos"
  const stem = w.replace(/(ing|ed|s)$/i, '');
  if (stem !== w) {
    if (ACTIONS.has(stem)) return 'action';
    if (OBJECTS.has(stem)) return 'object';
    if (EXPRESSIONS.has(stem)) return 'expression';
  }
  return 'abstract';
}

/** True when the vocab item is best illustrated by a cast character acting. */
export function needsCharacter(word: string): boolean {
  const k = classifyVocab(word);
  return k === 'action' || k === 'expression' || k === 'abstract';
}
