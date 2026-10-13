import { LESSON_A1U2L4_SCENES, LESSON_A1U2L4_TITLE } from '@/content/playground-library/jungle-adventure/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayJungleLesson4() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U2L4_SCENES}
      sessionKey="jungle-u2l4-scene-idx"
      pageTitle={`${LESSON_A1U2L4_TITLE} — Jungle Adventure — EnglEuphoria Playground`}
      pageDescription="A1 Unit 2, Lesson 4: describe a jungle animal in 4 sentences, give a riddle and build a field-guide card."
    />
  );
}
