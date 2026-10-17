import { LESSON_A1U7L1_SCENES, LESSON_A1U7L1_TITLE } from '@/content/playground-library/hero-city/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayHeroLesson1() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U7L1_SCENES}
      sessionKey="hero-u7l1-scene-idx"
      pageTitle={`${LESSON_A1U7L1_TITLE} — Hero City — EnglEuphoria Playground`}
      pageDescription="A1 Unit 7, Lesson 1: Hero City — what I can do well, asking for help, hero rules, and the story Captain Spark Saves the Day."
    />
  );
}
