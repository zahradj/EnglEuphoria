import { LESSON_A1U9L1_SCENES, LESSON_A1U9L1_TITLE } from '@/content/playground-library/magic-castle/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMagicCastleLesson1() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U9L1_SCENES}
      sessionKey="castle-u9l1-scene-idx"
      pageTitle={`${LESSON_A1U9L1_TITLE} — Magic Castle — EnglEuphoria Playground`}
      pageDescription="A1 Unit 9, Lesson 1: name castle rooms and furniture, and say what is in a room."
    />
  );
}
