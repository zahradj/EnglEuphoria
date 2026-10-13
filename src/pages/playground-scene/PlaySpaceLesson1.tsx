import { LESSON_A1U3L1_SCENES, LESSON_A1U3L1_TITLE } from '@/content/playground-library/space-mission/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlaySpaceLesson1() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U3L1_SCENES}
      sessionKey="space-u3l1-scene-idx"
      pageTitle={`${LESSON_A1U3L1_TITLE} — Space Mission — EnglEuphoria Playground`}
      pageDescription="A1 Unit 3, Lesson 1: Space Mission — numbers in tens, directions, planet weather and the story The Lost Robot."
    />
  );
}
