import { LESSON_A1U2L3_SCENES, LESSON_A1U2L3_TITLE } from '@/content/playground-library/jungle-adventure/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayJungleLesson3() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U2L3_SCENES}
      sessionKey="jungle-u2l3-scene-idx"
      pageTitle={`${LESSON_A1U2L3_TITLE} — Jungle Adventure — EnglEuphoria Playground`}
      pageDescription="A1 Unit 2, Lesson 3: ask Can it…? and answer Yes, it can / No, it can't — and read who can help Kip."
    />
  );
}
