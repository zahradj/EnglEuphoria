import { LESSON_1_SCENES } from '@/content/playground-library/unit1/scenes';
import PlayUnitLesson from './PlayUnitLesson';

export default function PlayLesson1() {
  return <PlayUnitLesson scenes={LESSON_1_SCENES} sessionKey="lep1-scene-idx" />;
}
