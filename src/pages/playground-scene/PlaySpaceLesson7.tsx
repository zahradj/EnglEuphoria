import { LESSON_A1U3L7_SCENES, LESSON_A1U3L7_TITLE } from '@/content/playground-library/space-mission/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlaySpaceLesson7() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U3L7_SCENES}
      sessionKey="space-u3l7-scene-idx"
      pageTitle={`${LESSON_A1U3L7_TITLE} — Space Mission — EnglEuphoria Playground`}
      pageDescription="A1 Unit 3, Lesson 7: Space Mission — numbers in tens, directions, planet weather and the story The Lost Robot."
    />
  );
}
