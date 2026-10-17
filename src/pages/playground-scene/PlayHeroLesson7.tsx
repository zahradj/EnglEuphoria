import { LESSON_A1U7L7_SCENES, LESSON_A1U7L7_TITLE } from '@/content/playground-library/hero-city/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayHeroLesson7() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U7L7_SCENES}
      sessionKey="hero-u7l7-scene-idx"
      pageTitle={`${LESSON_A1U7L7_TITLE} — Hero City — EnglEuphoria Playground`}
      pageDescription="A1 Unit 7, Lesson 7: Hero City — what I can do well, asking for help, hero rules, and the story Captain Spark Saves the Day."
    />
  );
}
