import { LESSON_A1U5L8_SCENES, LESSON_A1U5L8_TITLE } from '@/content/playground-library/monster-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMonsterLesson8() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U5L8_SCENES}
      sessionKey="monster-u5l8-scene-idx"
      pageTitle={`${LESSON_A1U5L8_TITLE} — EnglEuphoria Playground`}
      pageDescription="A1 Halfway Check (after Unit 5): listening, reading and writing, sounds and speaking over A1 Units 1–5."
    />
  );
}
