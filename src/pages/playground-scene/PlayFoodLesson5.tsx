import { LESSON_A1U4L5_SCENES, LESSON_A1U4L5_TITLE } from '@/content/playground-library/food-festival/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayFoodLesson5() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U4L5_SCENES}
      sessionKey="food-u4l5-scene-idx"
      pageTitle={`${LESSON_A1U4L5_TITLE} — Food Festival — EnglEuphoria Playground`}
      pageDescription="A1 Unit 4, Lesson 5: Food Festival — foods and meals, likes, Do you like…?, offers and the story Chef Cilla's Recipe."
    />
  );
}
