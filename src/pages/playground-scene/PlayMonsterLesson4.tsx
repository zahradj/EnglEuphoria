import { LESSON_A1U5L4_SCENES, LESSON_A1U5L4_TITLE } from '@/content/playground-library/monster-town/scenes';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

export default function PlayMonsterLesson4() {
  return (
    <PlayWelcomeTownLesson
      scenes={LESSON_A1U5L4_SCENES}
      sessionKey="monster-u5l4-scene-idx"
      pageTitle={`${LESSON_A1U5L4_TITLE} — Monster Town — EnglEuphoria Playground`}
      pageDescription="A1 Unit 5, Lesson 4: Monster Town — describe a monster friend (He's got… He's wearing… because…), y = /ee/ and Bibi's Bad Day pages 8-9."
    />
  );
}
