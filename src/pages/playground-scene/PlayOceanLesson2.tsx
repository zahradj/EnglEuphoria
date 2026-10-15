import { LESSON_A1U6L2_SCENES, LESSON_A1U6L2_TITLE } from '@/content/playground-library/ocean/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayOceanLesson2() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U6L2_SCENES}
      sessionKey="ocean-u6l2-scene-idx"
      pageTitle={`${LESSON_A1U6L2_TITLE} — Ocean Explorers — EnglEuphoria Playground`}
      pageDescription="A1 Unit 6, Lesson 2: Ocean Explorers — octopus and crab, what a sea animal is doing (The crab is walking.), the Live Reef game and the story The Treasure Reef."
    />
  );
}
