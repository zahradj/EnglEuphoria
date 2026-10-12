import { Deck } from '../Deck';
import { PATTERN_LAB } from '../lessons/patternLab';

/** Review mode (teacher + freeNext) stays on while the owner tries the lesson in class: any slide can be opened and Next is never locked. */
export default function FakeOrRealLesson({ onBack }: { onBack?: () => void }) {
  return <Deck script={PATTERN_LAB} artBase="/academy-art" teacher freeNext onFinish={() => onBack?.()} />;
}
