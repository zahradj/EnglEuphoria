import { LESSON_A1U4L2_SCENES, LESSON_A1U4L2_TITLE } from '@/content/playground-library/food-festival/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayFoodLesson2() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U4L2_SCENES}
      sessionKey="food-u4l2-scene-idx"
      pageTitle={`${LESSON_A1U4L2_TITLE} — Food Festival — EnglEuphoria Playground`}
      pageDescription="A1 Unit 4, Lesson 2: Food Festival — foods and meals, likes, Do you like…?, offers and the story Chef Cilla's Recipe."
    />
  );
}
