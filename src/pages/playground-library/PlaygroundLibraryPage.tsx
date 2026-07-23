import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
    unit_letters?: string;
    lesson_number?: number;
    lesson_role?: string;
    contentFormat?: string;
  } | null;
}

const LEVELS: { code: string; curriculum: string | null }[] = [
  { code: 'Pre-A1', curriculum: 'Little Explorers Phonics' },
  { code: 'A1', curriculum: null },
  { code: 'A2', curriculum: null },
  { code: 'B1', curriculum: null },
  { code: 'B2', curriculum: null },
];

interface UnitGroup {
  unit_number: number;
  unit_title: string;
  unit_theme: string;
  unit_letters: string;
  lessons: LessonRow[];
}

const UNIT_ART = [
  { emoji: '👋', bg: 'linear-gradient(135deg,#FE6A2F,#FEBE4C)' },
  { emoji: '🌈', bg: 'linear-gradient(135deg,#8B5CF6,#EC4899)' },
  { emoji: '👨‍👩‍👧', bg: 'linear-gradient(135deg,#22C55E,#84CC16)' },
  { emoji: '🏡', bg: 'linear-gradient(135deg,#F59E0B,#F97316)' },
  { emoji: '🌦️', bg: 'linear-gradient(135deg,#3B82F6,#06B6D4)' },
  { emoji: '🎉', bg: 'linear-gradient(135deg,#EF4444,#F59E0B)' },
  { emoji: '🍎', bg: 'linear-gradient(135deg,#84CC16,#22C55E)' },
  { emoji: '🦁', bg: 'linear-gradient(135deg,#C97A2F,#F59E0B)' },
  { emoji: '😊', bg: 'linear-gradient(135deg,#EC4899,#8B5CF6)' },
  { emoji: '🏆', bg: 'linear-gradient(135deg,#FBBF24,#FE6A2F)' },
];

export default function PlaygroundLibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<LessonRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [openUnit, setOpenUnit] = useState<number | null>(1);
  const [activeLevel, setActiveLevel] = useState('Pre-A1');

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, description, is_published, ai_metadata')
        .eq('created_by', user.id)
        .eq('ai_metadata->>hub', 'playground')
        .order('ai_metadata->>unit_number', { ascending: true })
        .limit(500);
      if (error) {
        console.error('Playground Library fetch error', error);
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as LessonRow[]);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const units = useMemo<UnitGroup[]>(() => {
    if (!rows) return [];
    const map = new Map<number, UnitGroup>();
    for (const r of rows) {
      if ((r.ai_metadata?.cefr_level ?? 'Pre-A1') !== activeLevel) continue;
      const n = r.ai_metadata?.unit_number;
      if (typeof n !== 'number') continue;
      if (!map.has(n)) {
        map.set(n, {
          unit_number: n,
          unit_title: r.ai_metadata?.unit_title ?? `Unit ${n}`,
          unit_theme: r.ai_metadata?.unit_theme ?? '',
          unit_letters: r.ai_metadata?.unit_letters ?? '',
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

  const handleLessonClick = (row: LessonRow) => {
    const fmt = row.ai_metadata?.contentFormat;
    if (fmt === 'lep1-rich') {
      navigate('/playground-scene/lesson-1');
      return;
    }
    if (fmt === 'scene-player') {
      navigate(`/playground-scene/play/${row.id}`);
      return;
    }
    // Empty scaffold slot — jump into the generic authoring tool to start building it.
    navigate(`/playground-creator?lessonId=${row.id}`);
  };

  return (
    <div dir="ltr" className="min-h-screen w-full" style={{ background: 'linear-gradient(180deg,#FFF8E7 0%,#FFF1D6 100%)' }}>
      <header className="sticky top-0 z-20 border-b-4 border-orange-200/70 bg-[#FFF8E7]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl text-2xl shadow-lg" style={{ background: 'linear-gradient(135deg,#FE6A2F,#FEBE4C)' }}>🎪</span>
            <div>
              <h1 className="text-xl font-black text-orange-900" style={{ fontFamily: "'Fredoka', system-ui, sans-serif" }}>Playground Library</h1>
              <p className="text-xs font-semibold text-orange-700/70">Little Explorers Phonics — built lesson by lesson</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/content-creator/blueprint')}
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-700 shadow ring-2 ring-orange-200 transition hover:scale-105 active:scale-95"
          >
            ← Creator Studio
          </button>
        </div>

        {/* CEFR level tier — Pre-A1 is live (Little Explorers Phonics); A1–B2
            are upcoming levels, added one at a time. */}
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pb-4">
          {LEVELS.map((lvl) => {
            const active = activeLevel === lvl.code;
            const hasContent = lvl.curriculum !== null;
            return (
              <button
                key={lvl.code}
                onClick={() => setActiveLevel(lvl.code)}
                className={`rounded-full px-4 py-1.5 text-sm font-black transition ${
                  active
                    ? 'bg-orange-500 text-white shadow-md'
                    : hasContent
                    ? 'bg-white text-orange-700 ring-2 ring-orange-200 hover:bg-orange-50'
                    : 'bg-white/60 text-orange-400/70 ring-1 ring-orange-100 hover:bg-white'
                }`}
              >
                {lvl.code}
                {!hasContent && <span className="ml-1 text-[10px] font-bold opacity-70">soon</span>}
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {(() => {
          const levelMeta = LEVELS.find((l) => l.code === activeLevel);
          if (levelMeta?.curriculum) {
            return (
              <div className="mb-6 flex items-center gap-2">
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">{activeLevel}</span>
                <h2 className="text-2xl font-black text-orange-900" style={{ fontFamily: "'Fredoka', system-ui, sans-serif" }}>{levelMeta.curriculum}</h2>
              </div>
            );
          }
          return null;
        })()}
        {!LEVELS.find((l) => l.code === activeLevel)?.curriculum ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
            <div className="mb-3 text-5xl">🚧</div>
            <p className="text-lg font-black text-orange-800">{activeLevel} is coming next.</p>
            <p className="mt-1 text-sm font-medium text-orange-700/70">No curriculum here yet — we'll design it together, same as Pre-A1.</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-3xl bg-orange-100/60" />
            ))}
          </div>
        ) : units.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
            <p className="text-lg font-bold text-orange-800">No Playground units yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {units.map((u) => {
              const art = UNIT_ART[(u.unit_number - 1) % UNIT_ART.length];
              const readyCount = u.lessons.filter((l) => l.ai_metadata?.contentFormat === 'lep1-rich' || l.ai_metadata?.contentFormat === 'scene-player').length;
              const isOpen = openUnit === u.unit_number;
              return (
                <div key={u.unit_number} className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-orange-100">
                  <button
                    onClick={() => setOpenUnit(isOpen ? null : u.unit_number)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-orange-50/60"
                  >
                    <span className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl text-3xl text-white shadow-md" style={{ background: art.bg }}>
                      {art.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-orange-700">Unit {u.unit_number}</span>
                        {u.unit_letters && <span className="text-[11px] font-bold text-orange-500/80">{u.unit_letters}</span>}
                      </div>
                      <h2 className="truncate text-lg font-black text-orange-900">{u.unit_title}</h2>
                      <p className="truncate text-sm font-medium text-orange-700/70">{u.unit_theme}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-black text-orange-700">{readyCount}/{u.lessons.length}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-orange-400">ready</div>
                      </div>
                      <span className={`text-orange-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="grid grid-cols-1 gap-3 border-t border-orange-100 bg-orange-50/40 p-5 sm:grid-cols-2 lg:grid-cols-3">
                      {u.lessons.map((l) => {
                        const ready = l.ai_metadata?.contentFormat === 'lep1-rich' || l.ai_metadata?.contentFormat === 'scene-player';
                        return (
                          <button
                            key={l.id}
                            onClick={() => handleLessonClick(l)}
                            className={`flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                              ready ? 'border-orange-300 bg-white' : 'border-dashed border-orange-200 bg-white/70'
                            }`}
                          >
                            <div className="flex w-full items-center justify-between">
                              <span className="text-xs font-black uppercase tracking-wide text-orange-500">Lesson {l.ai_metadata?.lesson_number ?? '?'}</span>
                              {ready ? (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black text-green-700">▶ Ready</span>
                              ) : (
                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-black text-neutral-500">🔒 Coming Soon</span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-neutral-800">{ready ? l.title : (l.ai_metadata?.lesson_role ?? l.title)}</p>
                            {!ready && <p className="text-xs text-neutral-500">We'll build this together.</p>}
                          </button>
                        );
                      })}
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
