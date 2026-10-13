import { LESSON_A1U3L3_SCENES, LESSON_A1U3L3_TITLE } from '@/content/playground-library/space-mission/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlaySpaceLesson3() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U3L3_SCENES}
      sessionKey="space-u3l3-scene-idx"
      pageTitle={`${LESSON_A1U3L3_TITLE} — Space Mission — EnglEuphoria Playground`}
      pageDescription="A1 Unit 3, Lesson 3: Space Mission — numbers in tens, directions, planet weather and the story The Lost Robot."
    />
  );
}
