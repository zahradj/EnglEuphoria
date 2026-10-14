import { LESSON_5_SCENES, LESSON_5_TITLE } from '@/content/playground-library/welcome-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayWelcomeTown5() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_5_SCENES}
      sessionKey="wt5-scene-idx"
      pageTitle={`${LESSON_5_TITLE} — Welcome Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 1, Lesson 5: a picture storybook — Pip meets Mia, cheers up Leo and meets Bella at the playground."
    />
  );
}
