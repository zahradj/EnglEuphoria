import { LESSON_1_SCENES, LESSON_1_TITLE } from '@/content/playground-library/welcome-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayWelcomeTown1() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_1_SCENES}
      sessionKey="wt-scene-idx"
      pageTitle={`${LESSON_1_TITLE} — Welcome Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 1, Lesson 1: greet a new friend and share your name in Welcome Town."
    />
  );
}
