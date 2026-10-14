import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMY_RECALL_NODES, PRE_A1_RECALL_NODES } from '../../curriculum/academy';
import { Deck } from '../Deck';
import { ACADEMY_DECK_BLUEPRINT_IDS } from '../lessonRegistry';
import { loadPractice, recordLesson, savePractice } from '../practiceStore';
import { loadDeckScript } from '../lessonScripts';
import type { DeckScript } from '../types';

/** Plays any deck lesson that is registered in lessonScripts (loaded on demand by its library id). Review mode (teacher + freeNext) stays on while the owner tries lessons in class. */
export default function GenericDeckLesson({ id, onBack }: { id: string; onBack?: () => void }) {
  const [script, setScript] = useState<DeckScript | null>(null);
  const { user } = useAuth();
  // a finished lesson feeds the student's Daily 10 (its new items come back on the spaced schedule) and keeps the "Say it" tally
  const finish = (spoken: number) => {
    const bp = ACADEMY_DECK_BLUEPRINT_IDS[id];
    const node = [...ACADEMY_RECALL_NODES, ...PRE_A1_RECALL_NODES].find((n) => n.id === bp);
    if (node) {
      const key = (user as { id?: string } | null)?.id ?? 'device';
      savePractice(key, recordLesson(loadPractice(key), id, node.items, new Date().toISOString().slice(0, 10), spoken));
    }
    onBack?.();
  };
  useEffect(() => {
    let alive = true;
    setScript(null);
    void loadDeckScript(id)?.then((s) => { if (alive) setScript(s); });
    return () => { alive = false; };
  }, [id]);
  if (!script) return <div className="flex items-center justify-center p-16 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  return <Deck script={script} artBase="/academy-art" teacher freeNext onFinish={(r) => finish(r.stats.spoken ?? 0)} />;
}
