import { LESSON_A1U5L5_SCENES, LESSON_A1U5L5_TITLE } from '@/content/playground-library/monster-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMonsterLesson5() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U5L5_SCENES}
      sessionKey="monster-u5l5-scene-idx"
      pageTitle={`${LESSON_A1U5L5_TITLE} — Monster Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 5, Lesson 5: Monster Town — read the whole story Bibi's Bad Day and say how Bibi feels and why (Feelings Meter)."
    />
  );
}
