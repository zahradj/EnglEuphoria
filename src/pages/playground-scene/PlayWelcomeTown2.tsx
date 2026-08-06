import { LESSON_2_SCENES, LESSON_2_TITLE } from '@/content/playground-library/welcome-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayWelcomeTown2() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_2_SCENES}
      sessionKey="wt2-scene-idx"
      pageTitle={`${LESSON_2_TITLE} — Welcome Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 1, Lesson 2: ask how a friend feels and learn three more real words."
    />
  );
}
