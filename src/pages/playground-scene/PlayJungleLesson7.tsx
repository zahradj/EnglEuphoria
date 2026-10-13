import { LESSON_A1U2L7_SCENES, LESSON_A1U2L7_TITLE } from '@/content/playground-library/jungle-adventure/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayJungleLesson7() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U2L7_SCENES}
      sessionKey="jungle-u2l7-scene-idx"
      pageTitle={`${LESSON_A1U2L7_TITLE} — Jungle Adventure — EnglEuphoria Playground`}
      pageDescription="A1 Unit 2, Lesson 7: the Boss Test — show everything from the jungle unit."
    />
  );
}
