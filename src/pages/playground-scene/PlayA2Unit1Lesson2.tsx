import { LESSON_A2U1L2_SCENES, LESSON_A2U1L2_TITLE } from '@/content/playground-library/welcome-town-a2/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayA2Unit1Lesson2() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A2U1L2_SCENES}
      sessionKey="a2u1l2-scene-idx"
      pageTitle={`${LESSON_A2U1L2_TITLE} — Welcome Town — EnglEuphoria Playground`}
      pageDescription="A2 Unit 1, Lesson 2: name the days of the week, use frequency adverbs, and read the 'ay' long-vowel pattern."
    />
  );
}
