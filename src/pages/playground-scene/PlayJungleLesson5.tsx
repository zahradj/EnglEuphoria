import { LESSON_A1U2L5_SCENES, LESSON_A1U2L5_TITLE } from '@/content/playground-library/jungle-adventure/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayJungleLesson5() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U2L5_SCENES}
      sessionKey="jungle-u2l5-scene-idx"
      pageTitle={`${LESSON_A1U2L5_TITLE} — Jungle Adventure — EnglEuphoria Playground`}
      pageDescription="A1 Unit 2, Lesson 5: read The Jungle Rescue and say who can help Kip and why."
    />
  );
}
