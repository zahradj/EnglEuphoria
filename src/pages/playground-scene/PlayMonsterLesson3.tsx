import { LESSON_A1U5L3_SCENES, LESSON_A1U5L3_TITLE } from '@/content/playground-library/monster-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMonsterLesson3() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U5L3_SCENES}
      sessionKey="monster-u5l3-scene-idx"
      pageTitle={`${LESSON_A1U5L3_TITLE} — Monster Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 5, Lesson 3: Monster Town — the Monster Music Show: the feelings song, Why…? Because…, ee / ea and Bibi's Bad Day pages 6-7."
    />
  );
}
