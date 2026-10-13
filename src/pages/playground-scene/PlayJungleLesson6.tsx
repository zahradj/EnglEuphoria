import { LESSON_A1U2L6_SCENES, LESSON_A1U2L6_TITLE } from '@/content/playground-library/jungle-adventure/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayJungleLesson6() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U2L6_SCENES}
      sessionKey="jungle-u2l6-scene-idx"
      pageTitle={`${LESSON_A1U2L6_TITLE} — Jungle Adventure — EnglEuphoria Playground`}
      pageDescription="A1 Unit 2, Lesson 6: Jungle Game Day — all the Unit 2 language in fast games."
    />
  );
}
