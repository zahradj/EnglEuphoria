import { LESSON_A1U5L6_SCENES, LESSON_A1U5L6_TITLE } from '@/content/playground-library/monster-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMonsterLesson6() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U5L6_SCENES}
      sessionKey="monster-u5l6-scene-idx"
      pageTitle={`${LESSON_A1U5L6_TITLE} — Monster Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 5, Lesson 6: Monster Town game night — Guess Who, Charades and more: ask and answer about looks, clothes and feelings."
    />
  );
}
