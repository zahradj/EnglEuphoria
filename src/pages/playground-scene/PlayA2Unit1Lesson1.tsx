import { LESSON_A2U1L1_SCENES, LESSON_A2U1L1_TITLE } from '@/content/playground-library/welcome-town-a2/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayA2Unit1Lesson1() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A2U1L1_SCENES}
      sessionKey="a2u1l1-scene-idx"
      pageTitle={`${LESSON_A2U1L1_TITLE} — Welcome Town — EnglEuphoria Playground`}
      pageDescription="A2 Unit 1, Lesson 1: describe your daily routine and read the silent-e pattern."
    />
  );
}
