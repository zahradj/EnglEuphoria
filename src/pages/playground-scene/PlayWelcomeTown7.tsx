import { LESSON_7_SCENES, LESSON_7_TITLE } from '@/content/playground-library/welcome-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayWelcomeTown7() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_7_SCENES}
      sessionKey="wt7-scene-idx"
      pageTitle={`${LESSON_7_TITLE} — Welcome Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 1, Lesson 7: the Unit 1 Boss Test — listen, read, build, talk and spell, then introduce yourself."
    />
  );
}
