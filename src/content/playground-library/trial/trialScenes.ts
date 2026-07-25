import { LESSON_1_SCENES, type Scene } from '../unit1/scenes';

/**
 * The Playground Hub trial (first-impression) lesson. Curated from
 * "The Forest of Hellos" (Unit 1, Lesson 1) — the same characters, art and
 * scene engine as the paid Little Explorers Phonics curriculum, so a
 * student who enrolls afterward sees a familiar, consistent world.
 *
 * Deliberately skips every reading/phonics scene (sound-model, basket,
 * trace, sound-sort, word-build, alphabet-*): trial students are true
 * beginners who can't read yet, so this stays 100% oral, visual and
 * playful — greet friends, share feelings, sing, celebrate.
 */

function pick(id: string): Scene {
  const scene = LESSON_1_SCENES.find((s) => s.id === id);
  if (!scene) {
    throw new Error(`Playground trial scenes: no Lesson 1 scene with id "${id}"`);
  }
  return scene;
}

const titleBg = pick('title-1').bg;
const finaleBg = pick('finale').bg;

export const PLAYGROUND_TRIAL_TITLE = 'Your First Adventure!';

export const PLAYGROUND_TRIAL_SCENES: Scene[] = [
  {
    id: 'trial-title',
    kind: 'title-card',
    bg: titleBg,
    level: 'Pre-A1',
    unit: 'Playground Hub',
    lessonLabel: 'Trial Class',
    title: PLAYGROUND_TRIAL_TITLE,
    subtitle: 'A fun first taste of English adventures',
  },
  pick('intro'),
  pick('meet-pip'),
  pick('echo-hello'),
  pick('meet-mia'),
  pick('echo-mia'),
  pick('meet-bella'),
  pick('gather'),
  pick('feelings'),
  pick('join-stage-l1'),
  pick('l1-goodbye-song'),
  {
    id: 'trial-finale',
    kind: 'finale',
    bg: finaleBg,
    who: 'pip',
    line: "You did it! You made three new friends — Pip, Mia and Bella can't wait to see you again!",
  },
];
