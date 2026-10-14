import { LESSON_A1U5L1_SCENES, LESSON_A1U5L1_TITLE } from '@/content/playground-library/monster-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMonsterLesson1() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U5L1_SCENES}
      sessionKey="monster-u5l1-scene-idx"
      pageTitle={`${LESSON_A1U5L1_TITLE} — Monster Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 5, Lesson 1: Monster Town — feelings (scared, bored, excited, surprised), because, and the story Bibi's Bad Day."
    />
  );
}
