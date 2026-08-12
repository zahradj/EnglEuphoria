import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
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

// CEFR ordering for the level sections — anything not in this list sorts
// after, alphabetically.
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

  // Group into CEFR sections (Pre-A1 / A1 / A2 / B1 / B2…), then into units
  // within each level (Unit 1, Unit 2…) so the library mirrors the actual
  // curriculum structure instead of one flat list. Lessons without a level
  // fall under one used to render even legacy/one-off rows.
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

  const handleSelect = async (lessonId: string) => {

    setLoadingLessonId(lessonId);
    try {
      const lesson = await getLessonById(lessonId);
      const contentFormat = (lesson.ai_metadata as any)?.contentFormat;
      const sceneMeta: SceneLessonMeta | undefined =
        contentFormat === 'lep1-rich' || contentFormat === 'wt-rich' || contentFormat === 'wt-a2-rich'
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
              <BookOpen size={22} className="text-indigo-500" />
              <h2 className="text-lg font-bold flex-1">Lesson Library</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                />
              </div>
            </div>

            {/* Lesson list, organized into CEFR level sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-60">
                  <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Loading lessons…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 opacity-50">
                  <BookOpen size={40} />
                  <p className="text-sm font-medium">
                    {searchQuery ? 'No lessons match your search' : 'No lessons available'}
                  </p>
                </div>
              ) : (
                grouped.map(({ level, units }) => (
                  <div key={level}>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {level}
                      </h4>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="space-y-4">
                      {units.map(({ unitNumber, lessons: unitLessons }) => (
                        <div key={unitNumber ?? 'no-unit'}>
                          {unitNumber != null && (
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 pl-0.5">
                              Unit {unitNumber}
                            </p>
                          )}
                          <div className="space-y-3">
                            {unitLessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() => handleSelect(lesson.id)}
                                disabled={loadingLessonId === lesson.id}
                                className="w-full text-left p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md bg-white dark:bg-slate-800/60 transition-all group disabled:opacity-60"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0 mt-1" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
