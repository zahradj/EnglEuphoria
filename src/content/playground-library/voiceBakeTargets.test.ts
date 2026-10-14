import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as WT from './welcome-town/scenes';
import * as A2 from './welcome-town-a2/scenes';
import * as MC from './magic-castle/scenes';
import * as JA from './jungle-adventure/scenes';
import * as SM from './space-mission/scenes';
import * as FF from './food-festival/scenes';

/* Owner 2026-10-14: "fix the audio of the instructions in Unit 9 Lesson 4" — the lesson was never on the voice bot's
 * list (scripts/voice-bake-targets.txt), so 184 of its 249 lines had no recorded clip and stayed silent on the live
 * site (live clips are not generated for visitors). Every A1/A2 lesson must be on the list, so the bot records it. */
const targets = new Set(
  readFileSync('scripts/voice-bake-targets.txt', 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')),
);
const lessons = [WT, A2, MC, JA, SM, FF].flatMap((m) => Object.keys(m).filter((k) => /^LESSON_.*_SCENES$/.test(k)));

describe('voice bot covers every A1/A2 lesson', () => {
  it.each(lessons)('%s is in scripts/voice-bake-targets.txt', (name) => {
    expect(targets.has(name), `${name}: add it to scripts/voice-bake-targets.txt so its lines are recorded`).toBe(true);
  });
});
