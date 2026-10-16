import { LESSON_A1U6L5_SCENES, LESSON_A1U6L5_TITLE } from '@/content/playground-library/ocean/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayOceanLesson5() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U6L5_SCENES}
      sessionKey="ocean-u6l5-scene-idx"
      pageTitle={`${LESSON_A1U6L5_TITLE} — Ocean Explorers — EnglEuphoria Playground`}
      pageDescription="A1 Unit 6, Lesson 5: Ocean Explorers — read the whole story The Treasure Reef, choose who helps at the pause, find the treasure under the rocks and retell the story."
    />
  );
}
