import { LESSON_A1U6L3_SCENES, LESSON_A1U6L3_TITLE } from '@/content/playground-library/ocean/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayOceanLesson3() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U6L3_SCENES}
      sessionKey="ocean-u6l3-scene-idx"
      pageTitle={`${LESSON_A1U6L3_TITLE} — Ocean Explorers — EnglEuphoria Playground`}
      pageDescription="A1 Unit 6, Lesson 3: Ocean Explorers — where sea animals live and what they eat (It lives on the reef. It eats sea grass.), the song Down in the Sea, Home Sort and the story The Treasure Reef."
    />
  );
}
