import { LESSON_4_SCENES } from '@/content/playground-library/unit1/scenes';
import PlayUnitLesson from './PlayUnitLesson';

export default function PlayLesson4() {
  return (
    <PlayUnitLesson
      scenes={LESSON_4_SCENES}
      sessionKey="lep4-scene-idx"
      lessonNumber={4}
      pageTitle="Bella's Birthday · Lesson 4"
      pageDescription="A playful one-on-one ESL birthday party where children ask How old are you, say their age, wave goodbye, and practice /b/ and /t/ phonics."
    />
  );
}
