import { LESSON_A1U6L7_SCENES, LESSON_A1U6L7_TITLE } from '@/content/playground-library/ocean/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayOceanLesson7() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U6L7_SCENES}
      sessionKey="ocean-u6l7-scene-idx"
      pageTitle={`${LESSON_A1U6L7_TITLE} — Ocean Explorers — EnglEuphoria Playground`}
      pageDescription="A1 Unit 6, Lesson 7: Ocean Explorers Boss Test — the Rising Tide warm-up, then listening, reading, the story, speaking and reading aloud; Golden Compass piece 5."
    />
  );
}
