import { LESSON_A1U3L6_SCENES, LESSON_A1U3L6_TITLE } from '@/content/playground-library/space-mission/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlaySpaceLesson6() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U3L6_SCENES}
      sessionKey="space-u3l6-scene-idx"
      pageTitle={`${LESSON_A1U3L6_TITLE} — Space Mission — EnglEuphoria Playground`}
      pageDescription="A1 Unit 3, Lesson 6: Space Mission — numbers in tens, directions, planet weather and the story The Lost Robot."
    />
  );
}
