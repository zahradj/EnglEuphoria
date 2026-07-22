import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  BookText,
  Volume2,
  Archive,
  Mic2,
  PenLine,
  type LucideIcon,
} from 'lucide-react';

export type AcademyZoneId =
  | 'grammar'
  | 'sounds'
  | 'vocab'
  | 'speaking'
  | 'writing';

export interface AcademyZone {
  id: AcademyZoneId;
  name: string;
  short: string;
  icon: LucideIcon;
  /** 0..1 — visual progress on the zone */
  progress: number;
  /** items unlocked / touched in the last 7 days */
  recentCount: number;
  /** short labels for the 2-3 newest items (word, phoneme, pattern…) */
  recentItems: string[];
  /** homework cards tagged for this zone that are NOT yet completed */
  homeworkCount: number;
  /** sidebar tab id to open + a tag filter for homework */
  tab: 'homework' | 'vocabulary' | 'sounds' | 'grammar' | 'speaking';
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Map a homework / game `tags[]` array to an Academy zone. */
export function zoneForTags(tags: string[] | null | undefined, gameType?: string | null): AcademyZoneId | null {
  const t = (tags ?? []).map((x) => x.toLowerCase());
  const gt = (gameType ?? '').toLowerCase();
  const has = (...needles: string[]) => needles.some((n) => t.includes(n) || gt.includes(n));
  if (has('grammar', 'tense', 'syntax')) return 'grammar';
  if (has('phonics', 'sound', 'sounds', 'pronunciation', 'phoneme')) return 'sounds';
  if (has('vocab', 'vocabulary', 'word', 'words', 'lexis')) return 'vocab';
  if (has('speaking', 'speech', 'dialogue', 'pronounce', 'roleplay')) return 'speaking';
  if (has('writing', 'write', 'sentence-builder', 'composition')) return 'writing';
  return null;
}

const BASE: Pick<AcademyZone, 'id' | 'name' | 'short' | 'icon' | 'tab'>[] = [
  { id: 'grammar',  name: 'Grammar Tower',   short: 'Grammar',  icon: BookText, tab: 'grammar' },
  { id: 'sounds',   name: 'Sound Studio',    short: 'Sounds',   icon: Volume2,  tab: 'sounds' },
  { id: 'vocab',    name: 'Vocab Market',    short: 'Vocab',    icon: Archive,  tab: 'vocabulary' },
  { id: 'speaking', name: 'Speaking Stage',  short: 'Speaking', icon: Mic2,     tab: 'speaking' },
  { id: 'writing',  name: "Writers' Studio", short: 'Writing',  icon: PenLine,  tab: 'homework' },
];

function emptyZones(): AcademyZone[] {
  return BASE.map((b) => ({
    ...b,
    progress: 0,
    recentCount: 0,
    recentItems: [],
    homeworkCount: 0,
  }));
}

export function useAcademyZones() {
  const { user } = useAuth();
  const [zones, setZones] = useState<AcademyZone[]>(emptyZones());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setZones(emptyZones());
      setLoading(false);
      return;
    }
    let cancelled = false;
    const sinceIso = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();

    (async () => {
      setLoading(true);
      const [vocab, sounds, grammar, speaking, homework] = await Promise.all([
        (supabase as any)
          .from('student_vocabulary_progress')
          .select('word, mastered, mastery_level, updated_at, created_at')
          .eq('student_id', user.id)
          .order('updated_at', { ascending: false, nullsFirst: false })
          .limit(200),
        (supabase as any)
          .from('student_phonics_progress')
          .select('phoneme, mastery_level, updated_at, created_at')
          .eq('student_id', user.id)
          .order('updated_at', { ascending: false, nullsFirst: false })
          .limit(200),
        (supabase as any)
          .from('lesson_completions')
          .select('lesson_id, completed_at, curriculum_lessons!inner(title, grammar_pattern, grammar_package)')
          .eq('student_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(40),
        (supabase as any)
          .from('speaking_attempts')
          .select('id, created_at, score')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),
        (supabase as any)
          .from('learning_games')
          .select('id, tags, game_type, student_game_progress!left(status, user_id)')
          .eq('hub', 'academy')
          .eq('is_published', true)
          .limit(300),
      ]).catch(() => [null, null, null, null, null]);

      if (cancelled) return;

      const next = emptyZones();
      const byId: Record<AcademyZoneId, AcademyZone> = Object.fromEntries(
        next.map((z) => [z.id, z]),
      ) as any;

      // Vocab Market
      const vRows = (vocab as any)?.data ?? [];
      const vRecent = vRows.filter((r: any) => (r.updated_at ?? r.created_at) >= sinceIso);
      byId.vocab.recentCount = vRecent.length;
      byId.vocab.recentItems = vRecent.slice(0, 3).map((r: any) => r.word).filter(Boolean);
      const vMastered = vRows.filter((r: any) => r.mastered).length;
      byId.vocab.progress = vRows.length ? Math.min(1, vMastered / Math.max(20, vRows.length)) : 0;

      // Sound Studio
      const sRows = (sounds as any)?.data ?? [];
      const sRecent = sRows.filter((r: any) => (r.updated_at ?? r.created_at) >= sinceIso);
      byId.sounds.recentCount = sRecent.length;
      byId.sounds.recentItems = sRecent.slice(0, 3).map((r: any) => r.phoneme).filter(Boolean);
      const sMastered = sRows.filter((r: any) => r.mastery_level === 'mastered').length;
      byId.sounds.progress = sRows.length ? Math.min(1, sMastered / Math.max(20, sRows.length)) : 0;

      // Grammar Tower — recent lessons with grammar content
      const gRows = (grammar as any)?.data ?? [];
      const gWithGrammar = gRows.filter(
        (r: any) => r.curriculum_lessons?.grammar_pattern || r.curriculum_lessons?.grammar_package,
      );
      const gRecent = gWithGrammar.filter((r: any) => r.completed_at >= sinceIso);
      byId.grammar.recentCount = gRecent.length;
      byId.grammar.recentItems = gRecent
        .slice(0, 3)
        .map((r: any) => r.curriculum_lessons?.grammar_pattern || r.curriculum_lessons?.title)
        .filter(Boolean);
      byId.grammar.progress = Math.min(1, gWithGrammar.length / 12);

      // Speaking Stage
      const spRows = (speaking as any)?.data ?? [];
      const spRecent = spRows.filter((r: any) => r.created_at >= sinceIso);
      byId.speaking.recentCount = spRecent.length;
      byId.speaking.recentItems = spRecent
        .slice(0, 3)
        .map((r: any) => (r.score ? `★ ${Math.round(r.score)}%` : 'Attempt'));
      byId.speaking.progress = Math.min(1, spRows.length / 30);

      // Homework by zone — count pending per zone, also count writing entries here.
      const hwRows = (homework as any)?.data ?? [];
      const writingPending: number[] = [];
      for (const g of hwRows) {
        const z = zoneForTags(g.tags, g.game_type);
        if (!z) continue;
        const mine = (g.student_game_progress ?? []).find((p: any) => p.user_id === user.id);
        const done = mine?.status === 'completed';
        if (done) continue;
        byId[z].homeworkCount += 1;
        if (z === 'writing') writingPending.push(1);
      }
      // Writing zone progress proxy = inverse of pending writing homework.
      byId.writing.progress = writingPending.length === 0 ? 0.15 : Math.max(0.05, 1 - writingPending.length / 10);

      setZones(Object.values(byId));
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  return { zones, loading };
}
