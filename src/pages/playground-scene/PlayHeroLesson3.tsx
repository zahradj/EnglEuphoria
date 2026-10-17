import { LESSON_A1U7L3_SCENES, LESSON_A1U7L3_TITLE } from '@/content/playground-library/hero-city/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayHeroLesson3() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U7L3_SCENES}
      sessionKey="hero-u7l3-scene-idx"
      pageTitle={`${LESSON_A1U7L3_TITLE} — Hero City — EnglEuphoria Playground`}
      pageDescription="A1 Unit 7, Lesson 3: Hero City — what I can do well, asking for help, hero rules, and the story Captain Spark Saves the Day."
    />
  );
}
