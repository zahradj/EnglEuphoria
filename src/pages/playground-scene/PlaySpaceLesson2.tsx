import { LESSON_A1U3L2_SCENES, LESSON_A1U3L2_TITLE } from '@/content/playground-library/space-mission/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlaySpaceLesson2() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U3L2_SCENES}
      sessionKey="space-u3l2-scene-idx"
      pageTitle={`${LESSON_A1U3L2_TITLE} — Space Mission — EnglEuphoria Playground`}
      pageDescription="A1 Unit 3, Lesson 2: Space Mission — numbers in tens, directions, planet weather and the story The Lost Robot."
    />
  );
}
