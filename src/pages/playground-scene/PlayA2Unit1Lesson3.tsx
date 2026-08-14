import { LESSON_A2U1L3_SCENES, LESSON_A2U1L3_TITLE } from '@/content/playground-library/welcome-town-a2/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayA2Unit1Lesson3() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A2U1L3_SCENES}
      sessionKey="a2u1l3-scene-idx"
      pageTitle={`${LESSON_A2U1L3_TITLE} — Welcome Town — EnglEuphoria Playground`}
      pageDescription="A2 Unit 1, Lesson 3: talk about yesterday using past simple, tell regular verbs apart from irregular ones, and read the 'ee' long-vowel pattern."
    />
  );
}
