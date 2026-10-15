import { LESSON_A1U6L1_SCENES, LESSON_A1U6L1_TITLE } from '@/content/playground-library/ocean/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayOceanLesson1() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U6L1_SCENES}
      sessionKey="ocean-u6l1-scene-idx"
      pageTitle={`${LESSON_A1U6L1_TITLE} — Ocean Explorers — EnglEuphoria Playground`}
      pageDescription="A1 Unit 6, Lesson 1: Ocean Explorers — sea animals (shark, whale, turtle, starfish), It's a… / They're…, and the story The Treasure Reef."
    />
  );
}
