import { LESSON_A1U4L3_SCENES, LESSON_A1U4L3_TITLE } from '@/content/playground-library/food-festival/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayFoodLesson3() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U4L3_SCENES}
      sessionKey="food-u4l3-scene-idx"
      pageTitle={`${LESSON_A1U4L3_TITLE} — Food Festival — EnglEuphoria Playground`}
      pageDescription="A1 Unit 4, Lesson 3: Food Festival — foods and meals, likes, Do you like…?, offers and the story Chef Cilla's Recipe."
    />
  );
}
