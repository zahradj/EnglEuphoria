import { LESSON_A1U6L6_SCENES, LESSON_A1U6L6_TITLE } from '@/content/playground-library/ocean/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayOceanLesson6() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U6L6_SCENES}
      sessionKey="ocean-u6l6-scene-idx"
      pageTitle={`${LESSON_A1U6L6_TITLE} — Ocean Explorers — EnglEuphoria Playground`}
      pageDescription="A1 Unit 6, Lesson 6: Ocean Explorers — ask and answer about sea animals in the Pearl Buzzer Show, Shell Memory, Hot Shell, Sandcastle Tower, Sail Race and Pearl Dive Quiz."
    />
  );
}
