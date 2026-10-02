import { LESSON_A1U9L3_SCENES, LESSON_A1U9L3_TITLE } from '@/content/playground-library/magic-castle/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMagicCastleLesson3() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U9L3_SCENES}
      sessionKey="castle-u9l3-scene-idx"
      skin="quest"
      pageTitle={`${LESSON_A1U9L3_TITLE} — Magic Castle — EnglEuphoria Playground`}
      pageDescription="A1 Unit 9, Lesson 3: listen and say where things are with in, on, under, next to and behind."
    />
  );
}
