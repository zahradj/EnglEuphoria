import { LESSON_A1U6L4_SCENES, LESSON_A1U6L4_TITLE } from '@/content/playground-library/ocean/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayOceanLesson4() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U6L4_SCENES}
      sessionKey="ocean-u6l4-scene-idx"
      pageTitle={`${LESSON_A1U6L4_TITLE} — Ocean Explorers — EnglEuphoria Playground`}
      pageDescription="A1 Unit 6, Lesson 4: Ocean Explorers — ask and answer yes/no questions (Is it a crab? Is it swimming? Yes, it is. / No, it isn’t.), the Reef Detective game and the story The Treasure Reef."
    />
  );
}
