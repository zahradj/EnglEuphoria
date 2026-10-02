import { LESSON_1_SCENES, type Scene } from '../welcome-town/scenes';
import { LESSON_A2U1L1_SCENES } from '../welcome-town-a2/scenes';

/**
 * Playground Hub trial (first-impression) lessons for A1 and A2 students —
 * the same idea as trialScenes.ts (Pre-A1, from "The Forest of Hellos"),
 * curated from each level's own Unit 1 Lesson 1 so a student who enrolls
 * afterwards meets the same world, characters and art again.
 *
 * Kept ~20-25 minutes: only the oral, visual and game scenes (meet the
 * characters, learn a few words, play, speak on stage, story, song). The
 * Part 2 reading/phonics block is left out — a trial is about confidence
 * and fun, and gives the teacher room to check the student's level.
 */

function picker(scenes: Scene[], label: string) {
  return (id: string): Scene => {
    const scene = scenes.find((s) => s.id === id);
    if (!scene) throw new Error(`${label} trial scenes: no scene with id "${id}"`);
    return scene;
  };
}

const a1 = picker(LESSON_1_SCENES, 'A1');
const a2 = picker(LESSON_A2U1L1_SCENES, 'A2');
const bgOf = (s: Scene) => (s as { bg: string }).bg;

export const PLAYGROUND_A1_TRIAL_TITLE = 'Welcome to Welcome Town!';
export const PLAYGROUND_A1_TRIAL_SCENES: Scene[] = [
  { id: 'trial-a1-title', kind: 'title-card', bg: bgOf(a1('wt-title')), level: 'A1', unit: 'Playground Hub', lessonLabel: 'Trial Class', title: PLAYGROUND_A1_TRIAL_TITLE, subtitle: 'Meet your new class and say hello in English', cta: '\u{1F392} LET’S GO!' },
  a1('wt-intro'),
  a1('wt-meet-marigold'),
  a1('wt-meet-pip'),
  a1('wt-vocab-people'),
  a1('wt-drag-people'),
  a1('wt-memory-words'),
  a1('wt-roleplay'),
  a1('wt-join-stage'),
  a1('wt-storybook'),
  a1('wt-goodbye-song'),
  { id: 'trial-a1-finale', kind: 'finale', bg: bgOf(a1('wt-finale')), who: 'pip', line: 'You did it! You met Miss Marigold and the class, and you said your name in English. See you again in Welcome Town! ✨' },
];

export const PLAYGROUND_A2_TRIAL_TITLE = 'A Day with Pip!';
export const PLAYGROUND_A2_TRIAL_SCENES: Scene[] = [
  { id: 'trial-a2-title', kind: 'title-card', bg: bgOf(a2('a2u1-title')), level: 'A2', unit: 'Playground Hub', lessonLabel: 'Trial Class', title: PLAYGROUND_A2_TRIAL_TITLE, subtitle: 'Follow Pip’s day and talk about yours', cta: '\u{1F31E} LET’S GO!' },
  a2('a2u1-intro'),
  a2('a2u1-meet-wakeup'),
  a2('a2u1-meet-breakfast'),
  a2('a2u1-vocab-play'),
  a2('a2u1-drag-play'),
  a2('a2u1-hesheare-model'),
  a2('a2u1-hesheare-choice'),
  a2('a2u1-roleplay'),
  a2('a2u1-join-stage'),
  a2('a2u1-storybook'),
  a2('a2u1-goodbye-song'),
  { id: 'trial-a2-finale', kind: 'finale', bg: bgOf(a2('a2u1-finale')), who: 'pip', line: 'Amazing! You talked about Pip’s day and about your own day in English. Come back soon for more adventures! ✨' },
];
