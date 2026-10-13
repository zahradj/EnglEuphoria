import { LESSON_A1U2L2_SCENES, LESSON_A1U2L2_TITLE } from '@/content/playground-library/jungle-adventure/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayJungleLesson2() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U2L2_SCENES}
      sessionKey="jungle-u2l2-scene-idx"
      pageTitle={`${LESSON_A1U2L2_TITLE} — Jungle Adventure — EnglEuphoria Playground`}
      pageDescription="A1 Unit 2, Lesson 2: say what jungle animals can and can't do on Jungle Games Day."
    />
  );
}
