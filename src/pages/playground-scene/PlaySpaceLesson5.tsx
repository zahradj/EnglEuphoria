import { LESSON_A1U3L5_SCENES, LESSON_A1U3L5_TITLE } from '@/content/playground-library/space-mission/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlaySpaceLesson5() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U3L5_SCENES}
      sessionKey="space-u3l5-scene-idx"
      pageTitle={`${LESSON_A1U3L5_TITLE} — Space Mission — EnglEuphoria Playground`}
      pageDescription="A1 Unit 3, Lesson 5: Space Mission — numbers in tens, directions, planet weather and the story The Lost Robot."
    />
  );
}
