import { LESSON_A1U4L1_SCENES, LESSON_A1U4L1_TITLE } from '@/content/playground-library/food-festival/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayFoodLesson1() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U4L1_SCENES}
      sessionKey="food-u4l1-scene-idx"
      pageTitle={`${LESSON_A1U4L1_TITLE} — Food Festival — EnglEuphoria Playground`}
      pageDescription="A1 Unit 4, Lesson 1: Food Festival — foods and meals, likes, Do you like…?, offers and the story Chef Cilla's Recipe."
    />
  );
}
