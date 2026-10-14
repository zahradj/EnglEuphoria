import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Flame } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { summary } from '../curriculum/academy';
import { loadPractice } from './practiceStore';
import { syncPractice } from '@/services/academyPracticeService';

/** My Lessons banner: how many words are due in today's Daily 10 and a button to play it. Hidden until the student has finished a lesson. */
export function Daily10Banner({ today = new Date().toISOString().slice(0, 10) }: { today?: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const key = (user as { id?: string } | null)?.id ?? 'device';
  const [data, setData] = useState(() => loadPractice(key));
  useEffect(() => { if (key !== 'device') void syncPractice(key).then(setData); }, [key]);
  if (data.items.length === 0) return null;
  const counts = summary(data.items, today);
  const doneToday = data.daily10Days.includes(today);
  const due = counts.dueToday;
  return (
    <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-violet-700 to-teal-600 p-4 text-white shadow-lg" aria-label="Daily 10">
      <div className="flex items-center gap-3">
        {due > 0 && !doneToday ? <Flame className="h-6 w-6 text-amber-300" aria-hidden /> : <CalendarCheck className="h-6 w-6 text-teal-200" aria-hidden />}
        <div>
          <h2 className="text-base font-extrabold leading-tight">Daily 10</h2>
          <p className="text-sm text-violet-100" data-testid="daily10-banner-text">
            {doneToday ? 'Done for today. Your words come back when it is time.' : due > 0 ? `${Math.min(due, 10)} word${Math.min(due, 10) === 1 ? '' : 's'} to practise today` : 'Nothing is due today. Your words are resting.'}
          </p>
        </div>
      </div>
      {due > 0 && !doneToday && (
        <button type="button" onClick={() => navigate('/academy-daily-10')} className="rounded-full bg-white px-5 py-2 text-sm font-extrabold text-violet-800 shadow active:scale-95">Start Daily 10</button>
      )}
    </section>
  );
}
