/**
 * Video quality & child-safety policy — the ONE place that decides whether a generated video may be paid for.
 *
 * Rules come from research on Veo / image-to-video practice and on AI-video failure modes:
 *  - Image-to-video: the approved still IS the first frame, so the prompt only describes MOTION. Re-describing the
 *    subject confuses the model (Google Veo best-practice guidance, Segmind / VEED Veo 3.x guides).
 *  - Hands, fingers, faces, teeth, crowds, text, reflections and fast complex motion are where artifacts appear
 *    (extra fingers, duplicate limbs, morphing faces, floating objects, background collapse). We avoid them by
 *    construction: calm ambient motion, one or two cartoon subjects, no close-ups, no on-screen text.
 *  - Children's content must stay conservative: no violence, fear, romance, substances, realistic children, etc.
 *  - Every voice a student hears is a recorded, no-accent American voice (see speechPolicy.ts), so video is SILENT.
 *
 * Mirrored byte-identically into supabase/functions/_shared/videoPolicy.ts (Deno cannot import from src/);
 * videoPolicy.test.ts enforces equality. Do not edit one copy only.
 */

/** Longest clip we ever order (Veo 3 clips are 4-8 s; shorter = fewer artifacts and lower cost). */
export const MAX_CLIP_SECONDS = 8;

/** Prompt length window: long enough to be specific, short enough that the model keeps every instruction. */
export const PROMPT_MIN = 40;
export const PROMPT_MAX = 700;

/** Added to every prompt that does not already say it: keeps the look consistent with the lesson art. */
export const STYLE_ANCHOR =
  'Flat 2D children\'s storybook cartoon illustration, soft bright colours, the exact same art style, characters and colours as the start image.';

/** Always sent as the model's negative prompt (what must NOT appear). */
export const NEGATIVE_PROMPT = [
  'extra fingers', 'missing fingers', 'distorted hands', 'extra limbs', 'duplicate limbs', 'extra heads', 'deformed face',
  'morphing', 'warping', 'flickering', 'jittery motion', 'blurry', 'floating objects', 'background shifting',
  'text', 'letters', 'captions', 'subtitles', 'watermark', 'logo', 'speech', 'talking', 'lip sync',
  'realistic human child', 'photorealistic', 'scary', 'violence', 'blood', 'weapon', 'dark', 'creepy',
].join(', ');

/** Added to every Veo prompt: a silent clip with a calm camera. */
export const SAFE_SUFFIX = ' Calm, slow, gentle motion. Steady camera. No text, no letters, no speech or voices, no singing; soft cheerful background music only.';

export type IssueLevel = 'block' | 'warn';
export interface PromptIssue {
  code: string;
  level: IssueLevel;
  message: string;
  match?: string;
}

/** Content that must never be generated for children. Whole-word, case-insensitive. */
const BLOCKED: { code: string; re: RegExp; message: string }[] = [
  { code: 'violence', re: /\b(kill\w*|murder\w*|fight\w*|punch\w*|kick\w*|hit(?:s|ting)?|attack\w*|battle|war|explod\w*|explosion|crash\w*|shoot\w*|gun\w*|knife\w*|sword\w*|weapon\w*|bomb\w*)\b/i, message: 'violent or aggressive action' },
  { code: 'blood-injury', re: /\b(blood\w*|wound\w*|injur\w*|hurt\w*|cry(?:ing)?|crying|scream\w*|pain\w*)\b/i, message: 'injury, pain or distress' },
  { code: 'fear', re: /\b(scary|scare\w*|horror|creepy|spooky|nightmare|monster|ghost|zombie|demon|dark|darkness|evil|haunted|terrif\w*|frighten\w*)\b/i, message: 'fear or darkness' },
  { code: 'death', re: /\b(dead|death|die|dies|dying|funeral|grave|corpse)\b/i, message: 'death' },
  { code: 'adult', re: /\b(sexy|sexual|nude|naked|kiss\w*|romantic|romance|lingerie|bikini|seduc\w*|flirt\w*|dating|boyfriend|girlfriend)\b/i, message: 'romantic or adult content' },
  { code: 'substances', re: /\b(alcohol\w*|beer|wine|whisky|vodka|cigarette\w*|smok(?:e|ing)|vape|drug\w*|cannabis|gambl\w*|casino)\b/i, message: 'alcohol, smoking, drugs or gambling' },
  { code: 'real-people', re: /\b(photorealistic|photo-realistic|hyper-?realistic|realistic (?:child|kid|boy|girl|person|people|human)|real (?:child|kid|boy|girl|person|people)|celebrity|famous (?:person|actor|singer))\b/i, message: 'realistic people or children (cartoon characters only)' },
  { code: 'religion-politics', re: /\b(religio\w*|politic\w*|election|president|terror\w*|flag burning)\b/i, message: 'religion or politics' },
  { code: 'brands', re: /\b(disney|pixar|mickey|pokemon|pok[eé]mon|nintendo|mario|marvel|spider-?man|batman|frozen|peppa|cocomelon|youtube|tiktok|coca-?cola|mcdonald\w*)\b/i, message: 'someone else\'s characters or brands' },
  { code: 'speech', re: /\b(talk\w*|speak\w*|speech|says?|saying|sing\w*|song|lip[- ]?sync|dialogue|narrat\w*|voice\w*|whisper\w*|shout\w*|yell\w*)\b/i, message: 'speech or singing (clips are silent; recorded voices are added separately)' },
  { code: 'on-screen-text', re: /\b(caption\w*|subtitle\w*|title card|on-?screen text|text (?:says|reads)|the word\b|the letters?\b|spelling|written)\b/i, message: 'on-screen text (AI video garbles letters)' },
];

/** Where artifacts are most likely: allowed only as a warning that the human review must look hard at it. */
const RISKY: { code: string; re: RegExp; message: string }[] = [
  { code: 'hands', re: /\b(hand|hands|finger|fingers|thumb|palm|paw|paws|holding|holds|grab\w*|clap\w*|wav(?:e|es|ing))\b/i, message: 'hands/paws and gripping are where extra fingers appear: keep them still and check every frame' },
  { code: 'close-up', re: /\b(close-?up|macro|zoom(?:s|ing)? in|extreme close)\b/i, message: 'close-ups magnify face and hand errors' },
  { code: 'crowd', re: /\b(crowd|many (?:people|children|kids|characters)|group of|audience|everyone)\b/i, message: 'crowds produce duplicated and merged bodies: keep to one or two characters' },
  { code: 'fast-motion', re: /\b(fast|quick\w*|rapid\w*|running|run|runs|jump\w*|spin\w*|twirl\w*|flip\w*|dance\w*|danc\w*|race\w*|chase\w*|whirl\w*)\b/i, message: 'fast or complex motion causes morphing and flicker: use slow, gentle motion' },
  { code: 'reflection', re: /\b(reflect\w*|mirror\w*|water surface|shadow\w*)\b/i, message: 'reflections and shadows often disagree with the subject' },
  { code: 'face-detail', re: /\b(blink\w*|smil\w*|teeth|tongue|eyes?|mouth|facial|expression\w*)\b/i, message: 'face detail can drift: keep faces mostly still, as in the start image' },
];

export interface LintOptions {
  /** True when an approved start image is supplied (image-to-video). */
  hasStartImage: boolean;
  /** Requested clip length in seconds. */
  seconds?: number;
}

/** Lint a video prompt. `ok` is false when any BLOCK issue is present: do not generate, do not spend. */
export function lintVideoPrompt(prompt: string, opts: LintOptions): { ok: boolean; issues: PromptIssue[] } {
  const issues: PromptIssue[] = [];
  const text = (prompt ?? '').trim();
  if (text.length < PROMPT_MIN) issues.push({ code: 'too-short', level: 'block', message: `prompt is too short (${text.length} chars; at least ${PROMPT_MIN}): describe the motion precisely` });
  if (text.length > PROMPT_MAX) issues.push({ code: 'too-long', level: 'block', message: `prompt is too long (${text.length} chars; at most ${PROMPT_MAX}): the model drops instructions in long prompts` });
  if (!opts.hasStartImage) issues.push({ code: 'no-start-image', level: 'block', message: 'no approved start image: text-only video drifts in style and anatomy. Use the approved still as the first frame' });
  if (opts.seconds !== undefined && opts.seconds > MAX_CLIP_SECONDS) issues.push({ code: 'too-long-clip', level: 'block', message: `clip is ${opts.seconds}s; the maximum is ${MAX_CLIP_SECONDS}s (shorter clips have fewer artifacts)` });
  for (const b of BLOCKED) {
    const m = text.match(b.re);
    if (m) issues.push({ code: b.code, level: 'block', message: b.message, match: m[0] });
  }
  for (const r of RISKY) {
    const m = text.match(r.re);
    if (m) issues.push({ code: r.code, level: 'warn', message: r.message, match: m[0] });
  }
  return { ok: !issues.some((i) => i.level === 'block'), issues };
}

/** What the model actually receives: the motion prompt plus the style anchor and the safety suffix (once each). */
export function finalVideoPrompt(prompt: string): string {
  const base = (prompt ?? '').trim();
  const withStyle = /storybook|cartoon|illustration/i.test(base) ? base : `${base} ${STYLE_ANCHOR}`;
  return `${withStyle}${SAFE_SUFFIX}`.replace(/\s+/g, ' ').trim();
}

/**
 * Indicative price list in US dollars per second of video. These are estimates for the budget guard only:
 * check Google's current Veo pricing before a big batch and update here.
 */
export const VEO_USD_PER_SECOND: Record<string, number> = {
  'veo-3.0-fast-generate-001': 0.4,
  'veo-3.0-generate-001': 0.75,
  'veo-2.0-generate-001': 0.35,
};

export function estimateClipCostUsd(model: string, seconds: number): number {
  const rate = VEO_USD_PER_SECOND[model] ?? 0.75;
  return Math.round(rate * seconds * 100) / 100;
}

/** The human review every clip must pass BEFORE it is used or a second clip is ordered. */
export const REVIEW_CHECKLIST: { id: string; check: string }[] = [
  { id: 'hands', check: 'Every hand/paw has the right number of fingers in EVERY frame, and nothing grips or passes through an object.' },
  { id: 'faces', check: 'Faces stay the same character: no melting, swapped features, extra eyes, odd teeth or mouth shapes.' },
  { id: 'bodies', check: 'No extra or missing limbs, heads or tails; no body parts merging into the background or each other.' },
  { id: 'identity', check: 'Characters, colours and art style match the start image and the other lesson art all the way to the last frame.' },
  { id: 'objects', check: 'Nothing floats, appears or vanishes without a reason; props keep their size and shape.' },
  { id: 'background', check: 'The background does not warp, shimmer or change between frames.' },
  { id: 'text', check: 'No letters, numbers or symbols appear anywhere (AI text is garbled).' },
  { id: 'motion', check: 'Motion is slow, smooth and natural; no flicker, jitter or sudden jumps; the first and last frames are clean.' },
  { id: 'audio', check: 'The clip is silent apart from soft music: no voices, singing or strange noises.' },
  { id: 'age', check: 'Everything is safe, calm and friendly for ages 4-12: nothing scary, aggressive, romantic, sad or confusing.' },
  { id: 'teaching', check: 'The clip shows what the lesson says it does and nothing that contradicts the teaching (e.g. the right number of objects).' },
  { id: 'culture', check: 'Clothing, behaviour and settings are modest and culturally conservative; no one is shown in revealing clothes.' },
];

/** The fixed order of work. Each stage is a gate: do not start the next one until the user has approved this one. */
export const VIDEO_STAGES = [
  '1. Brief: one learning purpose, one start image, slow ambient motion (videoBriefs.ts)',
  '2. Preflight: `npm run audit:video` must show no BLOCK issues and the cost estimate',
  '3. Still: the user has seen and approved the start image',
  '4. One clip only: order a single clip of the first brief',
  '5. Human review: every item of REVIEW_CHECKLIST, frame by frame, with the user',
  '6. Only then order the rest, one brief at a time, reviewing each',
] as const;
