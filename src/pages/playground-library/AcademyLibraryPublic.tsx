import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface LessonRow {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  ai_metadata: {
    cefr_level?: string;
    unit_number?: number;
    unit_title?: string;
    unit_theme?: string;
    lesson_number?: number;
  } | null;
}

// Academy's full intended CEFR sweep, per hubConfigs.ts's cefrRange
// (Pre-A1 to C1) — levels with no published lessons yet still show as a
// "soon" tab, same roadmap-preview treatment Playground Library uses.
const LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];

interface UnitGroup {
  unit_number: number;
  unit_title: string;
  unit_theme: string;
  lessons: LessonRow[];
}

// Academy's own established dark indigo/violet "digital classroom" identity
// (matching src/components/lesson-player/LessonLibraryHub.tsx's HUB_HERO/
// HUB_CARD_STYLES academy treatment) rather than Playground's warm
// orange/cream skin — same page structure, hub-appropriate look.
const UNIT_ART = [
  { emoji: '💻', bg: 'linear-gradient(135deg,#6D28D9,#4338CA)' },
  { emoji: '🎧', bg: 'linear-gradient(135deg,#7C3AED,#5B21B6)' },
  { emoji: '🗣️', bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
  { emoji: '📱', bg: 'linear-gradient(135deg,#6366F1,#4338CA)' },
  { emoji: '🌍', bg: 'linear-gradient(135deg,#7C3AED,#4F46E5)' },
  { emoji: '🎬', bg: 'linear-gradient(135deg,#5B21B6,#6D28D9)' },
  { emoji: '⚽', bg: 'linear-gradient(135deg,#4338CA,#6366F1)' },
  { emoji: '🚀', bg: 'linear-gradient(135deg,#4F46E5,#6D28D9)' },
];

/**
 * Public, read-only mirror of the Academy hub's curriculum, structured
 * exactly like PlaygroundLibraryPublic (CEFR level tabs -> unit accordion
 * -> lesson cards, no account required) but themed to Academy's own dark
 * indigo/violet identity. Academy lessons are AI-generated (no fixed
 * contentFormat like Playground's lep1-rich/wt-rich), so every published
 * row is playable via the single canonical /lesson/:id route — the same
 * route /academy-demo already opens for anonymous visitors, so linking
 * directly here is consistent with an access model this hub already ships.
 */
export default function AcademyLibraryPublic() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LessonRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [openUnit, setOpenUnit] = useState<number | null>(null);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, description, is_published, ai_metadata')
        .eq('is_published', true)
        .eq('ai_metadata->>hub', 'academy')
        .limit(500);
      if (error) {
        console.error('Public Academy Library fetch error', error);
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as LessonRow[]);
      }
      setLoading(false);
    })();
  }, []);

  // Default to the first level that actually has published content, once
  // the fetch resolves — avoids landing on an empty "Pre-A1" tab when e.g.
  // only A2/B1 have lessons yet.
  useEffect(() => {
    if (!rows || activeLevel) return;
    const firstWithContent = LEVELS.find((lvl) => rows.some((r) => (r.ai_metadata?.cefr_level ?? '') === lvl));
    setActiveLevel(firstWithContent ?? LEVELS[0]);
  }, [rows, activeLevel]);

  const levelHasContent = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows ?? []) if (r.ai_metadata?.cefr_level) set.add(r.ai_metadata.cefr_level);
    return set;
  }, [rows]);

  const units = useMemo<UnitGroup[]>(() => {
    if (!rows || !activeLevel) return [];
    const map = new Map<number, UnitGroup>();
    for (const r of rows) {
      if ((r.ai_metadata?.cefr_level ?? '') !== activeLevel) continue;
      const n = r.ai_metadata?.unit_number;
      if (typeof n !== 'number') continue;
      if (!map.has(n)) {
        map.set(n, {
          unit_number: n,
          unit_title: r.ai_metadata?.unit_title ?? `Unit ${n}`,
          unit_theme: r.ai_metadata?.unit_theme ?? '',
          lessons: [],
        });
      }
      map.get(n)!.lessons.push(r);
    }
    for (const g of map.values()) {
      g.lessons.sort((a, b) => (a.ai_metadata?.lesson_number ?? 0) - (b.ai_metadata?.lesson_number ?? 0));
    }
    return Array.from(map.values()).sort((a, b) => a.unit_number - b.unit_number);
  }, [rows, activeLevel]);

  // First unit open by default whenever the visible set changes (new level
  // picked, or data just loaded).
  useEffect(() => {
    setOpenUnit(units[0]?.unit_number ?? null);
  }, [units]);

  const handleLessonClick = (row: LessonRow) => navigate(`/lesson/${row.id}`);

  return (
    <div dir="ltr" className="min-h-screen w-full bg-gradient-to-b from-[#0B0A1F] to-[#151330]">
      <header className="sticky top-0 z-20 border-b border-violet-500/20 bg-[#0B0A1F]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl text-2xl shadow-lg shadow-violet-900/40" style={{ background: 'linear-gradient(135deg,#7C3AED,#4338CA)' }}>🏫</span>
            <div>
              <h1 className="text-xl font-bold text-white">Academy Library</h1>
              <p className="text-xs font-medium text-violet-300/70">Teen English, Pre-A1 to C1 — built unit by unit</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/student-signup')}
            className="rounded-full px-4 py-2 text-sm font-bold text-white shadow transition hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#4338CA)' }}
          >
            Start Learning →
          </button>
        </div>

        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pb-4">
          {LEVELS.map((lvl) => {
            const active = activeLevel === lvl;
            const hasContent = levelHasContent.has(lvl);
            return (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  active
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-900/40'
                    : hasContent
                    ? 'bg-white/5 text-violet-200 ring-1 ring-violet-500/30 hover:bg-white/10'
                    : 'bg-white/[0.02] text-violet-400/50 ring-1 ring-violet-500/10 hover:bg-white/5'
                }`}
              >
                {lvl}
                {!hasContent && <span className="ml-1 text-[10px] font-semibold opacity-70">soon</span>}
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : !activeLevel || !levelHasContent.has(activeLevel) ? (
          <div className="rounded-3xl bg-white/5 p-12 text-center ring-1 ring-violet-500/20">
            <div className="mb-3 text-5xl">🚧</div>
            <p className="text-lg font-bold text-white">{activeLevel ?? 'This level'} is coming next.</p>
            <p className="mt-1 text-sm font-medium text-violet-300/70">No units published here yet — check back soon.</p>
          </div>
        ) : units.length === 0 ? (
          <div className="rounded-3xl bg-white/5 p-10 text-center ring-1 ring-violet-500/20">
            <p className="text-lg font-semibold text-white">No Academy units published yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {units.map((u) => {
              const art = UNIT_ART[(u.unit_number - 1) % UNIT_ART.length];
              const isOpen = openUnit === u.unit_number;
              return (
                <div key={u.unit_number} className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-violet-500/20">
                  <button
                    onClick={() => setOpenUnit(isOpen ? null : u.unit_number)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-white/5"
                  >
                    <span className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl text-3xl text-white shadow-md" style={{ background: art.bg }}>
                      {art.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-violet-600/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-200">Unit {u.unit_number}</span>
                      </div>
                      <h2 className="truncate text-lg font-bold text-white">{u.unit_title}</h2>
                      {u.unit_theme && <p className="truncate text-sm font-medium text-violet-300/70">{u.unit_theme}</p>}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-violet-200">{u.lessons.length}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-violet-400/70">{u.lessons.length === 1 ? 'lesson' : 'lessons'}</div>
                      </div>
                      <span className={`text-violet-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="grid grid-cols-1 gap-3 border-t border-violet-500/20 bg-black/20 p-5 sm:grid-cols-2 lg:grid-cols-3">
                      {u.lessons.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => handleLessonClick(l)}
                          className="flex flex-col items-start gap-1 rounded-2xl border border-violet-500/30 bg-white/5 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md"
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wide text-violet-300">Lesson {l.ai_metadata?.lesson_number ?? '?'}</span>
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">▶ Ready</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{l.title}</p>
                          {l.description && <p className="line-clamp-2 text-xs text-violet-300/60">{l.description}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
