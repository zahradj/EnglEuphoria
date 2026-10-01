import { LESSON_A1U9L2_SCENES, LESSON_A1U9L2_TITLE } from '@/content/playground-library/magic-castle/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMagicCastleLesson2() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U9L2_SCENES}
      sessionKey="castle-u9l2-scene-idx"
      pageTitle={`${LESSON_A1U9L2_TITLE} — Magic Castle — EnglEuphoria Playground`}
      pageDescription="A1 Unit 9, Lesson 2: name bed, lamp, door and window, and say what is (and is not) in a room."
    />
  );
}
