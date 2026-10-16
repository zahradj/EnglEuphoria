import { LESSON_A1U5L2_SCENES, LESSON_A1U5L2_TITLE } from '@/content/playground-library/monster-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMonsterLesson2() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U5L2_SCENES}
      sessionKey="monster-u5l2-scene-idx"
      pageTitle={`${LESSON_A1U5L2_TITLE} — Monster Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 5, Lesson 2: Monster Town — looks and family (He's got / She's got, tall, short), the ea sound and Bibi's Bad Day pages 4-5."
    />
  );
}
