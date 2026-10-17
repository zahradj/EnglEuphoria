import { LESSON_A1U7L6_SCENES, LESSON_A1U7L6_TITLE } from '@/content/playground-library/hero-city/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayHeroLesson6() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U7L6_SCENES}
      sessionKey="hero-u7l6-scene-idx"
      pageTitle={`${LESSON_A1U7L6_TITLE} — Hero City — EnglEuphoria Playground`}
      pageDescription="A1 Unit 7, Lesson 6: Hero City — what I can do well, asking for help, hero rules, and the story Captain Spark Saves the Day."
    />
  );
}
