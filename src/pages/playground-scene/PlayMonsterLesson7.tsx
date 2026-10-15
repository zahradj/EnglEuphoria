import { LESSON_A1U5L7_SCENES, LESSON_A1U5L7_TITLE } from '@/content/playground-library/monster-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMonsterLesson7() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U5L7_SCENES}
      sessionKey="monster-u5l7-scene-idx"
      pageTitle={`${LESSON_A1U5L7_TITLE} — Monster Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 5, Lesson 7: Monster Town Boss Test — listening, reading, the story, a monster portrait and reading aloud."
    />
  );
}
