import { LESSON_6_SCENES, LESSON_6_TITLE } from '@/content/playground-library/welcome-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayWelcomeTown6() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_6_SCENES}
      sessionKey="wt6-scene-idx"
      pageTitle={`${LESSON_6_TITLE} — Welcome Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 1, Lesson 6: Game Day — quick greeting games: hello, what’s your name?, how are you?, goodbye."
    />
  );
}
