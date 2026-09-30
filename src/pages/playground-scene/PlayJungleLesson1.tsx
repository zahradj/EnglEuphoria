import { LESSON_A1U2L1_SCENES, LESSON_A1U2L1_TITLE } from '@/content/playground-library/jungle-adventure/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayJungleLesson1() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U2L1_SCENES}
      sessionKey="jungle-u2l1-scene-idx"
      pageTitle={`${LESSON_A1U2L1_TITLE} — Jungle Adventure — EnglEuphoria Playground`}
      pageDescription="A1 Unit 2, Lesson 1: name jungle animals and say what they can do in Jungle Adventure."
    />
  );
}
