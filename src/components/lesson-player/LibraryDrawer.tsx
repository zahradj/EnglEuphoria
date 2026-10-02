import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, BookOpen, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  extractClassroomSlides,
  getLibraryLessonSlides,
  getLibraryLessons,
  getLessonById,
  toLibraryLessonCard,
  type ClassroomSlide,
  type LibraryLessonCard,
} from '@/services/lessonLibraryService';
import { isSceneLessonFormat } from '@/content/playground-library/sceneLessonFormats';
import { LIBRARY_GAMES, type LibraryGame } from '@/content/playground-library/gamesCatalog';
import { GAME_LESSON_FORMAT, gameLessonNumber } from '@/content/playground-library/gameLessons';


export interface SceneLessonMeta {
  contentFormat: string;
  unitNumber: number;
  lessonNumber: number;
}

interface LibraryDrawerProps {
  open: boolean;
  onClose: () => void;
  /** `sceneMeta` is set when the picked lesson is a scene-based (e.g. Little
   *  Explorers Phonics) lesson whose real content lives in code, not in
   *  `content.slides` — the caller should render it via the scene player
   *  instead of treating `slides` as normal classroom slides. */
  onSelectLesson: (slides: any[], title: string, sceneMeta?: SceneLessonMeta) => void;
  slideFormat?: 'classroom' | 'raw';
  /** Lock the drawer to a single hub (playground | academy | professional). */
  hubFilter?: string;
}

const HUB_BADGE_COLORS: Record<string, string> = {
  playground: 'bg-amber-100 text-amber-700 border-amber-200',
  academy: 'bg-violet-100 text-violet-700 border-violet-200',
  professional: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

// Hub-branded accent for the drawer chrome itself (icon, search ring, level
// tabs, hover states) — mirrors each hub's canonical brand color from
// HubTheme.tsx (playground #FE6A2F / academy #6B21A8 / success #059669),
// expressed as the closest Tailwind palette so it composes with the
// existing dark-mode classes instead of hardcoded hex.
interface HubAccent {
  icon: string;
  ring: string;
  tabActive: string;
  tabActiveText: string;
  tabHover: string;
  spinner: string;
  rowHover: string;
  rowTitleHover: string;
  sectionHeader: string;
}
const HUB_ACCENT: Record<string, HubAccent> = {
  playground: {
    icon: 'text-amber-500',
    ring: 'focus:ring-amber-400',
    tabActive: 'bg-amber-600 border-amber-600',
    tabActiveText: 'text-amber-200',
    tabHover: 'hover:border-amber-300',
    spinner: 'border-amber-400',
    rowHover: 'hover:border-amber-300 dark:hover:border-amber-600',
    rowTitleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    sectionHeader: 'text-amber-600 dark:text-amber-400',
  },
  academy: {
    icon: 'text-violet-500',
    ring: 'focus:ring-violet-400',
    tabActive: 'bg-violet-600 border-violet-600',
    tabActiveText: 'text-violet-200',
    tabHover: 'hover:border-violet-300',
    spinner: 'border-violet-400',
    rowHover: 'hover:border-violet-300 dark:hover:border-violet-600',
    rowTitleHover: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
    sectionHeader: 'text-violet-600 dark:text-violet-400',
  },
  professional: {
    icon: 'text-emerald-500',
    ring: 'focus:ring-emerald-400',
    tabActive: 'bg-emerald-600 border-emerald-600',
    tabActiveText: 'text-emerald-200',
    tabHover: 'hover:border-emerald-300',
    spinner: 'border-emerald-400',
    rowHover: 'hover:border-emerald-300 dark:hover:border-emerald-600',
    rowTitleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    sectionHeader: 'text-emerald-600 dark:text-emerald-400',
  },
};
// Used when the drawer isn't locked to one hub (hubFilter undefined) —
// keeps the original neutral indigo look in that case.
const DEFAULT_ACCENT: HubAccent = {
  icon: 'text-indigo-500',
  ring: 'focus:ring-indigo-400',
  tabActive: 'bg-indigo-600 border-indigo-600',
  tabActiveText: 'text-indigo-200',
  tabHover: 'hover:border-indigo-300',
  spinner: 'border-indigo-400',
  rowHover: 'hover:border-indigo-300 dark:hover:border-indigo-600',
  rowTitleHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
  sectionHeader: 'text-indigo-600 dark:text-indigo-400',
};

// CEFR ordering for the level tabs — anything not in this list sorts after,
// alphabetically.
const LEVEL_ORDER = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

function sortLevels(levels: string[]): string[] {
  return [...levels].sort((a, b) => {
    const ai = LEVEL_ORDER.indexOf(a.toLowerCase());
    const bi = LEVEL_ORDER.indexOf(b.toLowerCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function LibraryDrawer({
  open,
  onClose,
  onSelectLesson,
  slideFormat = 'classroom',
  hubFilter,
}: LibraryDrawerProps) {
  const [lessons, setLessons] = useState<LibraryLessonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  // Games (Alphabet Express, Magic Show…) are Playground content: offered when the drawer is
  // locked to Playground, or not locked to any hub.
  const gamesAvailable = !hubFilter || hubFilter === 'playground';
  const [view, setView] = useState<'lessons' | 'games'>('lessons');
  const accent = (hubFilter && HUB_ACCENT[hubFilter]) || DEFAULT_ACCENT;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getLibraryLessons(hubFilter, { includeDrafts: true })
      .then((data) => setLessons(data.map(toLibraryLessonCard)))
      .catch((error) => {
        console.warn('LibraryDrawer fetch error:', error);
        setLessons([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, hubFilter]);

  // Fresh browsing state each time the drawer opens — don't carry over
  // whichever level/units were expanded last time.
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setExpandedUnits(new Set());
    }
  }, [open]);

  const filtered = useMemo(() => {
    let list = lessons;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.cefr_level.toLowerCase().includes(q) ||
          l.hub.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [lessons, searchQuery]);

  // Group into CEFR level sections (Pre-A1 / A1 / A2 / B1 / B2…), then into
  // units within each level (Unit 1, Unit 2…) so the library mirrors the
  // actual curriculum structure instead of one flat list. Lessons without a
  // level fall under one used to render even legacy/one-off rows.
  const grouped = useMemo(() => {
    const levelMap = new Map<string, LibraryLessonCard[]>();
    for (const lesson of filtered) {
      const key = lesson.cefr_level || 'Unleveled';
      if (!levelMap.has(key)) levelMap.set(key, []);
      levelMap.get(key)!.push(lesson);
    }
    const orderedLevels = sortLevels(Array.from(levelMap.keys()));
    return orderedLevels.map((level) => {
      const unitMap = new Map<number | null, LibraryLessonCard[]>();
      for (const lesson of levelMap.get(level)!) {
        const key = lesson.unit_number;
        if (!unitMap.has(key)) unitMap.set(key, []);
        unitMap.get(key)!.push(lesson);
      }
      const orderedUnitNumbers = Array.from(unitMap.keys()).sort((a, b) => {
        if (a == null) return b == null ? 0 : 1;
        if (b == null) return -1;
        return a - b;
      });
      const units = orderedUnitNumbers.map((unitNumber) => ({
        unitNumber,
        lessons: [...unitMap.get(unitNumber)!].sort((a, b) => {
          const aNum = a.lesson_number ?? Number.MAX_SAFE_INTEGER;
          const bNum = b.lesson_number ?? Number.MAX_SAFE_INTEGER;
          // Ready-to-play lessons first within a tie — keeps "Coming Soon"
          // scaffold rows from bumping ahead of real lessons at the same slot.
          if (aNum !== bNum) return aNum - bNum;
          return Number(b.isReady) - Number(a.isReady);
        }),
      }));
      return { level, units };
    });
  }, [filtered]);

  const isSearching = searchQuery.trim().length > 0;

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LIBRARY_GAMES.filter((g) => !q || g.title.toLowerCase().includes(q) || g.tagline.toLowerCase().includes(q) || g.skill.toLowerCase().includes(q));
  }, [searchQuery]);

  /** A game opens like a scene lesson: the classroom stage plays it through the synced scene player. */
  const handleSelectGame = (game: LibraryGame) => {
    onSelectLesson([], game.title, { contentFormat: GAME_LESSON_FORMAT, unitNumber: 0, lessonNumber: gameLessonNumber(game.id) });
  };

  const renderGameRow = (game: LibraryGame) => (
    <button
      key={game.id}
      onClick={() => handleSelectGame(game)}
      className={`w-full text-left overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 ${accent.rowHover} hover:shadow-md bg-white dark:bg-slate-800/60 transition-all group`}
    >
      <img src={game.cover} alt="" draggable={false} className="aspect-video w-full object-cover" />
      <div className="p-4">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold text-sm flex-1 truncate ${accent.rowTitleHover} transition-colors`}>{game.title}</h3>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-200">Game</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{game.tagline}</p>
        <p className="text-[11px] font-semibold text-slate-400 mt-2">
          {game.stages.map((s) => s.station).join(' › ')} · {game.minutes}
        </p>
      </div>
    </button>
  );

  // Keep selectedLevel valid as the grouped list changes (fresh open, hub
  // switch, or the currently-picked level no longer has any matches) —
  // default to the first available level rather than leaving the drawer
  // showing an empty state under a stale tab.
  useEffect(() => {
    if (isSearching) return;
    const levels = grouped.map((g) => g.level);
    if (selectedLevel && levels.includes(selectedLevel)) return;
    setSelectedLevel(levels[0] ?? null);
  }, [grouped, isSearching, selectedLevel]);

  const activeLevelGroup = grouped.find((g) => g.level === selectedLevel) ?? null;

  const toggleUnit = (unitKey: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitKey)) next.delete(unitKey);
      else next.add(unitKey);
      return next;
    });
  };

  const handleSelect = async (lessonId: string) => {

    setLoadingLessonId(lessonId);
    try {
      const lesson = await getLessonById(lessonId);
      const contentFormat = (lesson.ai_metadata as any)?.contentFormat;
      const sceneMeta: SceneLessonMeta | undefined =
        isSceneLessonFormat(contentFormat)
          ? {
              contentFormat,
              unitNumber: Number((lesson.ai_metadata as any)?.unit_number ?? 1),
              lessonNumber: Number((lesson.ai_metadata as any)?.lesson_number ?? 1),
            }
          : undefined;
      const slides = slideFormat === 'raw'
        ? getLibraryLessonSlides(lesson)
        : extractClassroomSlides(lesson);
      onSelectLesson(slides, lesson.title || 'Lesson', sceneMeta);
    } catch (error) {
      console.error('Failed to load lesson slides:', error);
      setLoadingLessonId(null);
      return;
    }
    setLoadingLessonId(null);
  };

  const renderLessonRow = (lesson: LibraryLessonCard) => (
    <button
      key={lesson.id}
      onClick={() => handleSelect(lesson.id)}
      disabled={loadingLessonId === lesson.id}
      className={`w-full text-left p-4 rounded-2xl border border-slate-100 dark:border-slate-800 ${accent.rowHover} hover:shadow-md bg-white dark:bg-slate-800/60 transition-all group disabled:opacity-60`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm truncate ${accent.rowTitleHover} transition-colors`}>
            {lesson.lesson_number != null ? `${lesson.lesson_number}. ` : ''}{lesson.title}
          </h3>
          {lesson.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {lesson.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {lesson.hub && (
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  HUB_BADGE_COLORS[lesson.hub] || 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {lesson.hub}
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase ${lesson.isReady ? 'text-emerald-600' : 'text-slate-400'}`}>
              {lesson.isReady
                ? (lesson.slide_count > 0 ? `${lesson.slide_count} slides` : 'Ready')
                : 'Coming soon'}
            </span>
          </div>
        </div>
        {loadingLessonId === lesson.id && (
          <div className={`w-5 h-5 border-2 ${accent.spinner} border-t-transparent rounded-full animate-spin shrink-0 mt-1`} />
        )}
      </div>
    </button>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <BookOpen size={22} className={accent.icon} />
              <h2 className="text-lg font-bold flex-1">Lesson Library</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lessons | Games */}
            {gamesAvailable && (
              <div className="flex gap-1.5 px-5 pt-3 shrink-0" role="tablist" aria-label="Library section">
                {([['lessons', 'Lessons'], ['games', 'Games']] as const).map(([id, label]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={view === id}
                    onClick={() => setView(id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-colors ${
                      view === id
                        ? `${accent.tabActive} text-white`
                        : `bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 ${accent.tabHover}`
                    }`}
                  >
                    {label}{id === 'games' ? ` · ${LIBRARY_GAMES.length}` : ''}
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 ${accent.ring} transition-all`}
                />
              </div>
            </div>

            {/* Level tabs — horizontal, only shown while not searching (a
                search spans every level, so tabs would just be confusing
                filters-on-top-of-a-filter). */}
            {view === 'lessons' && !loading && !isSearching && grouped.length > 0 && (
              <div className="flex gap-1.5 px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0 overflow-x-auto">
                {grouped.map(({ level, units }) => {
                  const lessonCount = units.reduce((sum, u) => sum + u.lessons.length, 0);
                  const active = level === selectedLevel;
                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-colors ${
                        active
                          ? `${accent.tabActive} text-white`
                          : `bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 ${accent.tabHover}`
                      }`}
                    >
                      {level}
                      <span className={active ? accent.tabActiveText : 'text-slate-400'}> · {lessonCount}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Lesson list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {gamesAvailable && view === 'games' ? (
                filteredGames.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 opacity-50">
                    <BookOpen size={40} />
                    <p className="text-sm font-medium">No games match your search</p>
                  </div>
                ) : (
                  <div className="space-y-3">{filteredGames.map(renderGameRow)}</div>
                )
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-60">
                  <div className={`w-8 h-8 border-3 ${accent.spinner} border-t-transparent rounded-full animate-spin`} />
                  <p className="text-sm">Loading lessons…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 opacity-50">
                  <BookOpen size={40} />
                  <p className="text-sm font-medium">
                    {searchQuery ? 'No lessons match your search' : 'No lessons available'}
                  </p>
                </div>
              ) : isSearching ? (
                // Flat, level-labeled results — searching is about jumping
                // straight to a lesson, not browsing the curriculum tree.
                grouped.map(({ level, units }) => (
                  <div key={level} className="space-y-2">
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${accent.sectionHeader} pl-0.5`}>
                      {level}
                    </h4>
                    <div className="space-y-2">
                      {units.flatMap((u) => u.lessons).map(renderLessonRow)}
                    </div>
                  </div>
                ))
              ) : activeLevelGroup ? (
                <div className="space-y-2">
                  {activeLevelGroup.units.map(({ unitNumber, lessons: unitLessons }) => {
                    const unitKey = `${activeLevelGroup.level}::${unitNumber ?? 'no-unit'}`;
                    const isOpen = expandedUnits.has(unitKey);
                    return (
                      <div
                        key={unitKey}
                        className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleUnit(unitKey)}
                          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {unitNumber != null ? `Unit ${unitNumber}` : 'Other lessons'}
                            {unitLessons[0]?.unit_title ? ` · ${unitLessons[0].unit_title}` : ''}
                          </span>
                          <span className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-semibold text-slate-400">
                              {unitLessons.length} lesson{unitLessons.length === 1 ? '' : 's'}
                            </span>
                            <ChevronDown
                              size={16}
                              className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 space-y-2">
                                {unitLessons.map(renderLessonRow)}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
