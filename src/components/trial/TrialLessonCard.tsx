import React, { useEffect, useState } from 'react';
import { ExternalLink, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Maps a CEFR level (from a placement test or student profile) to the
 * matching difficulty mode in the Engleuphoria English Adventures trial app.
 *
 *  Pre-A1 / A1 → pre-a1 (Easy Mode)
 *  A2          → standard
 *  B1 / B2 / C1 / C2 → challenge
 */
export type TrialDifficulty = 'pre-a1' | 'standard' | 'challenge';

export function cefrToTrialDifficulty(cefr?: string | null): TrialDifficulty {
  const v = (cefr ?? '').toString().toUpperCase().replace(/\s+/g, '').replace('-', '');
  if (v === 'PREA1' || v === 'A1') return 'pre-a1';
  if (v === 'A2') return 'standard';
  if (v === 'B1' || v === 'B2' || v === 'C1' || v === 'C2') return 'challenge';
  return 'standard';
}

const DIFFICULTY_META: Record<TrialDifficulty, { label: string; emoji: string; blurb: string }> = {
  'pre-a1': {
    label: 'Easy Mode · Pre-A1',
    emoji: '🌱',
    blurb: 'Tiny steps, lots of pictures, super friendly questions.',
  },
  standard: {
    label: 'Standard · A1–A2',
    emoji: '⭐',
    blurb: 'The classic adventure — balanced and fun.',
  },
  challenge: {
    label: 'Challenge · B1–B2',
    emoji: '🚀',
    blurb: 'Trickier vocab, longer reading, harder grammar.',
  },
};

export type TrialHub = 'playground' | 'academy' | 'success';

interface TrialProject {
  name: string;
  baseUrl: string;
}

const TRIAL_PROJECTS: Record<TrialHub, TrialProject> = {
  playground: {
    name: 'First English Adventure',
    baseUrl: 'https://first-english-adventure.lovable.app',
  },
  academy: {
    name: 'Engleuphoria English Adventures',
    baseUrl: 'https://engleuphoria-playhouse.lovable.app',
  },
  success: {
    name: 'Engleuphoria English Adventures',
    baseUrl: 'https://engleuphoria-english-adventures.lovable.app',
  },
};

interface Props {
  /** Optional CEFR override; otherwise the card reads the student's latest
   *  placement_results row (falling back to student_profiles.current_level). */
  cefr?: string;
  /** Which hub the student is in — selects which trial project opens. */
  hub?: TrialHub;
  className?: string;
}

export const TrialLessonCard: React.FC<Props> = ({ cefr, hub = 'academy', className = '' }) => {

  const { user } = useAuth();
  const [resolvedCefr, setResolvedCefr] = useState<string | undefined>(cefr);

  useEffect(() => {
    if (cefr) {
      setResolvedCefr(cefr);
      return;
    }
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { data: placement } = await (supabase as any)
        .from('placement_results')
        .select('cefr_level')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      let level = placement?.cefr_level as string | undefined;
      if (!level) {
        const { data: profile } = await (supabase as any)
          .from('student_profiles')
          .select('current_level')
          .eq('user_id', user.id)
          .maybeSingle();
        level = profile?.current_level ?? undefined;
      }
      if (!cancelled && level) setResolvedCefr(level);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, cefr]);

  const difficulty = cefrToTrialDifficulty(resolvedCefr);
  const meta = DIFFICULTY_META[difficulty];
  const project = TRIAL_PROJECTS[hub];
  const href = `${project.baseUrl}/?difficulty=${difficulty}`;


  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-2xl p-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 shadow-md hover:shadow-xl transition-shadow ${className}`}
    >
      <div className="rounded-2xl bg-white dark:bg-slate-950 p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow">
          <Rocket className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Trial Lesson
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:border dark:border-orange-800 dark:text-orange-300">
              {meta.emoji} {meta.label}
            </span>
            {resolvedCefr && (
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                · matched to your placement ({resolvedCefr})
              </span>
            )}
          </div>
          <div className="font-extrabold text-slate-900 dark:text-slate-50 truncate">
            {project.name}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            {meta.blurb} 7 quests: Warm-up → Vocab → Grammar → Reading → Listening → Speaking → Results.
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-violet-600 flex-shrink-0" />
      </div>
    </a>
  );
};

export default TrialLessonCard;
