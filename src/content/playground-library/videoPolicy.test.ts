import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MAX_CLIP_SECONDS, NEGATIVE_PROMPT, PROMPT_MAX, REVIEW_CHECKLIST, estimateClipCostUsd, finalVideoPrompt, lintVideoPrompt } from '@/lib/videoPolicy';
import { VIDEO_BRIEFS } from './videoBriefs';

/** QUALITY AUDIT — "Video" gate (see .claude/skills/video-quality-gate): nothing unsafe or sloppy gets paid for. */
const ok = 'The flowers sway very gently in a soft breeze. Two butterflies drift slowly across the sky. The camera makes a slow, gentle push forward.';
const codes = (p: string, hasStartImage = true) => lintVideoPrompt(p, { hasStartImage }).issues.map((i) => i.code);

describe('video policy: child safety', () => {
  it('accepts a calm ambient-motion prompt with a start image', () => {
    const r = lintVideoPrompt(ok, { hasStartImage: true, seconds: 8 });
    expect(r.ok).toBe(true);
    expect(r.issues.filter((i) => i.level === 'block')).toEqual([]);
  });

  const blocked: [string, string][] = [
    ['A boy kicks a ball and then they fight over it, with a loud explosion.', 'violence'],
    ['The little bunny is crying and screams in pain.', 'blood-injury'],
    ['A scary monster hides in the dark creepy forest.', 'fear'],
    ['The old fox dies in the story and there is a funeral.', 'death'],
    ['A cartoon prince and princess kiss in a romantic garden at night.', 'adult'],
    ['A cartoon man drinks beer and smokes a cigarette in the park.', 'substances'],
    ['A photorealistic child waves and smiles at the camera happily.', 'real-people'],
    ['Mickey Mouse and Pokemon characters dance together in the garden.', 'brands'],
    ['The teacher talks to the children and says hello, then they sing a song.', 'speech'],
    ['The title card says WELCOME in big letters with subtitles shown below.', 'on-screen-text'],
  ];
  for (const [prompt, code] of blocked) {
    it(`blocks ${code}`, () => {
      const r = lintVideoPrompt(prompt, { hasStartImage: true });
      expect(r.ok).toBe(false);
      expect(r.issues.map((i) => i.code)).toContain(code);
    });
  }

  it('blocks text-only video (no approved start image)', () => {
    expect(lintVideoPrompt(ok, { hasStartImage: false }).ok).toBe(false);
    expect(codes(ok, false)).toContain('no-start-image');
  });

  it('blocks prompts that are too short, too long, or ask for a clip over the maximum', () => {
    expect(codes('Flowers sway.')).toContain('too-short');
    expect(codes('x '.repeat(PROMPT_MAX))).toContain('too-long');
    expect(lintVideoPrompt(ok, { hasStartImage: true, seconds: MAX_CLIP_SECONDS + 1 }).ok).toBe(false);
  });

  it('warns (does not block) on the places AI video makes mistakes', () => {
    const r = lintVideoPrompt('The rabbit holds a wand in its hand and spins around quickly in a close-up, with its reflection in the mirror and a crowd of children.', { hasStartImage: true });
    expect(r.ok).toBe(true);
    expect(r.issues.map((i) => i.code)).toEqual(expect.arrayContaining(['hands', 'fast-motion', 'close-up', 'reflection', 'crowd']));
  });

  it('does not flag harmless words that merely contain a blocked word', () => {
    expect(lintVideoPrompt('The daring butterfly lands softly on the dandelion near the white garden gate and sways.', { hasStartImage: true }).issues.map((i) => i.code)).not.toContain('violence');
  });
});

describe('video policy: the final prompt', () => {
  it('always adds the style anchor and the silent / calm suffix, once', () => {
    const f = finalVideoPrompt(ok);
    expect(f).toMatch(/storybook cartoon illustration/i);
    expect(f).toMatch(/no speech or voices/i);
    expect(f.match(/no speech or voices/gi)).toHaveLength(1);
  });
  it('the negative prompt rules out text, speech, extra fingers and scary content', () => {
    for (const w of ['extra fingers', 'text', 'speech', 'scary', 'photorealistic', 'morphing']) expect(NEGATIVE_PROMPT).toContain(w);
  });
});

describe('video policy: cost guard and review', () => {
  it('estimates the cost of a clip', () => {
    expect(estimateClipCostUsd('veo-3.0-fast-generate-001', 8)).toBe(3.2);
    expect(estimateClipCostUsd('unknown-model', 4)).toBe(3);
  });
  it('has a human review checklist that covers hands, faces, text, audio and age-appropriateness', () => {
    const ids = REVIEW_CHECKLIST.map((c) => c.id);
    for (const id of ['hands', 'faces', 'bodies', 'text', 'audio', 'age', 'culture']) expect(ids).toContain(id);
  });
});

describe('approved video briefs', () => {
  it('has at least one brief', () => expect(VIDEO_BRIEFS.length).toBeGreaterThan(0));
  for (const b of VIDEO_BRIEFS) {
    it(`${b.id}: passes the lint, its start image exists, within the clip limit`, () => {
      const r = lintVideoPrompt(b.motion, { hasStartImage: !!b.startImage, seconds: b.seconds });
      expect(r.issues.filter((i) => i.level === 'block'), JSON.stringify(r.issues)).toEqual([]);
      expect(existsSync(join(process.cwd(), 'public', b.startImage))).toBe(true);
      expect(b.seconds).toBeLessThanOrEqual(MAX_CLIP_SECONDS);
    });
  }
  it('a brief is only ready to order once the user has approved its still; at most one is ready until a clip is approved', () => {
    for (const b of VIDEO_BRIEFS) if (b.status !== 'draft') expect(b.stillApproved, `${b.id} is ${b.status} without an approved still`).toBe(true);
    const ready = VIDEO_BRIEFS.filter((b) => b.status === 'ready');
    if (!VIDEO_BRIEFS.some((b) => b.status === 'clip-approved')) expect(ready.length).toBeLessThanOrEqual(1);
  });
});
});

describe('server copy', () => {
  it('supabase/functions/_shared/videoPolicy.ts is byte-identical to src/lib/videoPolicy.ts', () => {
    const eol = (s: string) => s.replace(/\r\n/g, '\n');
    const read = (p: string) => eol(readFileSync(join(process.cwd(), p), 'utf8'));
    expect(read('supabase/functions/_shared/videoPolicy.ts')).toBe(read('src/lib/videoPolicy.ts'));
  });
  it('generate-playground-video runs the gate before it orders anything', () => {
    const src = readFileSync(join(process.cwd(), 'supabase/functions/generate-playground-video/index.ts'), 'utf8');
    const gate = src.indexOf('lintVideoPrompt(');
    expect(gate).toBeGreaterThan(0);
    expect(gate).toBeLessThan(src.indexOf('startVeo(GEMINI_KEY'));
    expect(gate).toBeLessThan(src.indexOf('queue.fal.run') > 0 ? src.indexOf('${FAL_QUEUE}/${model}') : Infinity);
  });
});
