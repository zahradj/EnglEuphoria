import { LESSON_3_SCENES } from '@/content/playground-library/unit1/scenes';
import PlayUnitLesson from './PlayUnitLesson';

export default function PlayLesson3() {
  return (
    <PlayUnitLesson
      scenes={LESSON_3_SCENES}
      sessionKey="lep3-scene-idx"
      lessonNumber={3}
      pageTitle="How Are You? · Lesson 3"
      pageDescription="A playful one-on-one ESL feelings lesson where children ask How are you and name happy, sad, and angry with /æ/ and /s/ phonics."
    />
  );
}
