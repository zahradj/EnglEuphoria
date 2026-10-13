import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Deck } from '../Deck';
import { loadDeckScript } from '../lessonScripts';
import type { DeckScript } from '../types';

/** Plays any deck lesson that is registered in lessonScripts (loaded on demand by its library id). Review mode (teacher + freeNext) stays on while the owner tries lessons in class. */
export default function GenericDeckLesson({ id, onBack }: { id: string; onBack?: () => void }) {
  const [script, setScript] = useState<DeckScript | null>(null);
  useEffect(() => {
    let alive = true;
    setScript(null);
    void loadDeckScript(id)?.then((s) => { if (alive) setScript(s); });
    return () => { alive = false; };
  }, [id]);
  if (!script) return <div className="flex items-center justify-center p-16 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  return <Deck script={script} artBase="/academy-art" teacher freeNext onFinish={() => onBack?.()} />;
}
