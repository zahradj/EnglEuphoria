import { Deck } from '@/academy-deck/Deck';
import { SIGN_ME_UP } from '@/academy-deck/lessons/signMeUp';

/** Review mode (teacher + freeNext) is on while the owner tries the lesson in class: any slide can be opened, Next is never locked. The Academy Deck lesson "Sign Me Up" inside the Game Library. Art and recorded voices are served from /academy-art and /academy-audio. */
export default function SignMeUpLesson({ onBack }: { onBack?: () => void }) {
  return <Deck script={SIGN_ME_UP} artBase="/academy-art" teacher freeNext onFinish={() => onBack?.()} />;
}
