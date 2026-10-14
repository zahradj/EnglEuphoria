import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { summary } from '../../curriculum/academy';
import { Deck } from '../Deck';
import { buildDailyTenDeck } from '../dailyTenDeck';
import { loadPractice, recordDaily10, savePractice } from '../practiceStore';

const todayISO = () => new Date().toISOString().slice(0, 10);

/** The student's Daily 10: today's items from the spaced schedule, recall only. Progress is kept in this browser for now (practiceStore.ts). */
export default function AcademyDailyTenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const key = (user as { id?: string } | null)?.id ?? 'device';
  const today = todayISO();
  const [data, setData] = useState(() => loadPractice(key));
  const [done, setDone] = useState(false);
  const deck = useMemo(() => buildDailyTenDeck(data.items, today), [data.items, today]);
  const wrongBySlide = useRef<Record<string, number>>({});
  const counts = summary(data.items, today);

  const finish = () => {
    if (!deck) return;
    const results = deck.tasks.map((t) => ({ item: t.item, ok: (wrongBySlide.current[t.slideId] ?? 0) === 0 }));
    const next = recordDaily10(data, results, today);
    savePractice(key, next);
    setData(next);
    setDone(true);
  };

  const back = () => navigate('/dashboard/academy?tab=lessons');
  return (
    <div className="relative min-h-screen bg-[#f5f3ff]">
      <button type="button" onClick={back} className="absolute start-3 top-3 z-50 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-violet-800 shadow ring-1 ring-violet-200 hover:bg-white">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Back to lessons
      </button>
      {deck && !done ? (
        <Deck script={deck.script} artBase="/academy-art" homework={{ label: 'Daily 10' }} onSlideDone={(s, r) => { wrongBySlide.current[s.id] = r.wrong; }} onFinish={finish} />
      ) : (
        <main className="mx-auto max-w-md space-y-4 p-8 pt-20 text-center">
          <h1 className="text-2xl font-black text-violet-900">{done ? 'Daily 10 done!' : data.items.length === 0 ? 'Your Daily 10 starts after your first lesson' : 'Nothing is due today'}</h1>
          <p className="text-sm text-violet-900/80">{done ? 'Your words come back again when it is the right time.' : data.items.length === 0 ? 'Finish a lesson and the words you learned will come back here, a little each day.' : 'Come back tomorrow: your words return when you are about to forget them.'}</p>
          <p className="text-xs text-violet-900/70" data-testid="daily10-counts">{counts.new} new · {counts.learning} learning · {counts.known} known · {counts.secure} secure · {counts.fading} fading</p>
          <button type="button" onClick={back} className="rounded-full bg-violet-700 px-5 py-2 text-sm font-extrabold text-white">Back to lessons</button>
        </main>
      )}
    </div>
  );
}
