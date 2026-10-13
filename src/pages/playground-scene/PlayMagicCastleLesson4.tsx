import { LESSON_A1U9L4_SCENES, LESSON_A1U9L4_TITLE } from '@/content/playground-library/magic-castle/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMagicCastleLesson4() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U9L4_SCENES}
      sessionKey="castle-u9l4-scene-idx"
      skin="quest"
      pageTitle={`${LESSON_A1U9L4_TITLE} — Magic Castle — EnglEuphoria Playground`}
      pageDescription="A1 Unit 9, Lesson 4: describe a room with there is / there are, between and in front of, and say whose things are."
    />
  );
}
