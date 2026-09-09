import { LESSON_3_SCENES, LESSON_3_TITLE } from '@/content/playground-library/welcome-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayWelcomeTown3() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_3_SCENES}
      sessionKey="wt3-scene-idx"
      pageTitle={`${LESSON_3_TITLE} — Welcome Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 1, Lesson 3: listen carefully and identify greetings and introductions."
    />
  );
}
