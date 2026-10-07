import type { SoundSide } from './soundAnchors';

/**
 * The sound-lesson layout PATTERN (owner, 2026-10-07): every sound lesson mixes three layouts so
 * neighbouring sound scenes never look the same —
 *   • 'center' — sound card in the middle, the words scattered on BOTH sides of it;
 *   • 'left'   — sound card on the left, ALL the words floating on the right;
 *   • 'right'  — sound card on the right, ALL the words floating on the left.
 *
 * A scene that sets `soundSide` keeps it (that is a deliberate art decision — see "Choosing the side"
 * in .claude/skills/lesson-quality-gate). A scene that leaves it out gets the next layout in the
 * rotation centre → left → right → centre …, counted over the lesson's sound scenes, and never the
 * same as the sound scene before it.
 */
export const SOUND_SIDE_ROTATION: SoundSide[] = ['center', 'left', 'right'];

export function resolveSoundSides<S extends { kind: string; soundSide?: SoundSide }>(scenes: S[]): S[] {
  let previous: SoundSide | null = null;
  let turn = 0;
  let changed = false;
  const out = scenes.map((scene, i) => {
    if (scene.kind !== 'sound-model') return scene;
    if (scene.soundSide) { previous = scene.soundSide; turn++; return scene; }
    // Also steer clear of the NEXT sound scene's pinned layout, so a pin beside an unpinned scene never matches it.
    const next = scenes.slice(i + 1).find((s) => s.kind === 'sound-model')?.soundSide ?? null;
    let side = SOUND_SIDE_ROTATION[turn % SOUND_SIDE_ROTATION.length];
    for (let k = 1; k < SOUND_SIDE_ROTATION.length && (side === previous || side === next); k++) {
      side = SOUND_SIDE_ROTATION[(turn + k) % SOUND_SIDE_ROTATION.length];
    }
    previous = side;
    turn++;
    changed = true;
    return { ...scene, soundSide: side };
  });
  return changed ? out : scenes;
}
