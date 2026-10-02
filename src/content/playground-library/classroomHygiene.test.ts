import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Structural guards for the live classroom — they fail the build when someone
 * re-creates the patterns that caused the "This activity hit a snag" crashes
 * (see .claude/skills/classroom-sync-robustness/SKILL.md). These are cheap
 * source checks; sceneMirrorFuzz.test.tsx covers behaviour.
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(join(root, dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(join(root, rel)).isDirectory()) walk(rel, out);
    else if (/\.tsx?$/.test(name) && !/\.test\./.test(name)) out.push(rel);
  }
  return out;
}

describe('classroom hygiene', () => {
  // Each scene lives in its own file under <hub>/scene-components/; the
  // SceneRenderer.tsx next to it is only the dispatcher.
  const rendererDirs = [
    'src/content/playground-library/unit1',
    'src/content/playground-library/welcome-town',
  ];
  const rendererFiles = rendererDirs.flatMap((d) => [
    `${d}/SceneRenderer.tsx`,
    ...walk(`${d}/scene-components`),
  ]);

  it('synced state starts as plain JSON — never a Set, Map or Date (they do not survive the wire)', () => {
    const offenders: string[] = [];
    for (const file of rendererFiles) {
      const src = read(file);
      for (const m of src.matchAll(/useSyncedState(?:<[^>]*>)?\(/g)) {
        const start = m.index ?? 0;
        // The call's argument list: up to the first line that ends the statement.
        const stmt = src.slice(start).split(/;\s*\n/)[0];
        if (/new\s+(Set|Map|Date|WeakSet|WeakMap)\b/.test(stmt)) {
          const line = src.slice(0, start).split('\n').length;
          offenders.push(`${file}:${line}`);
        }
      }
    }
    expect(offenders, `Use arrays/objects/numbers in useSyncedState, not Set/Map/Date:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('every lesson player renders scenes inside <SceneCrashGuard>', () => {
    const players = walk('src').filter((f) => /<SceneRenderer[\s>]/.test(read(f)) && !rendererFiles.includes(f));
    expect(players.length).toBeGreaterThan(0);
    const unguarded = players.filter((f) => {
      const src = read(f);
      const usage = src.search(/<SceneRenderer[\s>]/);
      const guard = src.indexOf('<SceneCrashGuard');
      return guard === -1 || guard > usage;
    });
    expect(unguarded, `Wrap <SceneRenderer> in <SceneCrashGuard>:\n${unguarded.join('\n')}`).toEqual([]);
  }, 30_000); // scans every file under src — slow on a busy build machine, so don't rely on the 5s default

  it('lesson players keep per-scene activity state in useSceneScopedState, not a reset-in-effect useState', () => {
    const players = ['src/pages/playground-scene/PlayUnitLesson.tsx', 'src/pages/playground-scene/PlayWelcomeTownLesson.tsx'];
    for (const f of players) expect(read(f), f).toContain('useSceneScopedState');
  });

  it('every classroom crash is logged through the shared helper', () => {
    for (const f of [
      'src/content/playground-library/SceneCrashGuard.tsx',
      'src/components/classroom/stage/ClassroomSceneErrorBoundary.tsx',
    ]) expect(read(f), f).toContain('logClassroomCrash');
  });
  it('interaction stays on for the whole lesson: scene changes never re-lock it, Start Class turns it on', () => {
    for (const f of ['src/pages/playground-scene/PlayUnitLesson.tsx', 'src/pages/playground-scene/PlayWelcomeTownLesson.tsx']) {
      // The old rule re-locked the student on every scene change. Only the teacher's Pause button may lock.
      expect(read(f), `${f} must not re-lock interaction on a scene change`).not.toMatch(/prevSceneIdxRef\.current = sceneIdx;[\s\S]{0,160}setInteractionUnlocked\(false\)/);
    }
    const teacher = read('src/components/teacher/classroom/TeacherClassroom.tsx');
    expect(teacher).toMatch(/handleStartClass[\s\S]{0,1400}setSceneInteractionUnlocked\(true\)/);
  });
});
