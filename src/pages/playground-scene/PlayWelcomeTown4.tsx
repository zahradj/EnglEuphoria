import { LESSON_4_SCENES, LESSON_4_TITLE } from '@/content/playground-library/welcome-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayWelcomeTown4() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_4_SCENES}
      sessionKey="wt4-scene-idx"
      pageTitle={`${LESSON_4_TITLE} — Welcome Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 1, Lesson 4: greet a partner, introduce yourself and a friend, and learn the sound F."
    />
  );
}
