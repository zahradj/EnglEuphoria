import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Rocket, Search, BookOpen, Loader2, ChevronDown } from 'lucide-react';
import { AssignLessonModal } from './AssignLessonModal';
import { useNavigate } from 'react-router-dom';
import { getLibraryLessons, toLibraryLessonCard, resolvePlaygroundLessonRoute, type LibraryLessonCard, type LibraryHub } from '@/services/lessonLibraryService';

const HUB_META: Record<LibraryHub, { label: string; emoji: string; color: string; active: string }> = {
  playground: { label: 'Playground', emoji: '🎪', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', active: 'bg-orange-500 text-white' },
  academy: { label: 'Academy', emoji: '🏫', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', active: 'bg-violet-600 text-white' },
  professional: { label: 'Success Hub', emoji: '💼', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', active: 'bg-emerald-600 text-white' },
};

// Fixed CEFR ordering so level pills read low-to-high instead of query order.
const LEVEL_ORDER = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const levelRank = (level: string) => {
  const i = LEVEL_ORDER.indexOf(level);
  return i === -1 ? LEVEL_ORDER.length : i;
};

interface UnitGroup {
  unit_number: number | null;
  unit_title: string | null;
  lessons: LibraryLessonCard[];
}

function LessonCard({ lesson, hub, onView, onAssign }: { lesson: LibraryLessonCard; hub: typeof HUB_META[LibraryHub]; onView: () => void; onAssign: () => void }) {
  return (
    <Card
      onClick={onView}
      className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer"
    >
      <div className="h-28 bg-gradient-to-br from-primary/10 via-accent/5 to-muted flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-primary/40" />
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
            {lesson.lesson_number ? `${lesson.lesson_number}. ` : ''}{lesson.title}
          </h3>
          <Badge variant="secondary" className={`shrink-0 text-xs ${hub.color}`}>
            {hub.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Level: {lesson.cefr_level}</span>
          <span>•</span>
          <span>{lesson.slide_count} slides</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Created {new Date(lesson.created_at).toLocaleDateString()}
        </p>
      </CardContent>

      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={(e) => { e.stopPropagation(); onView(); }}>
          <Eye className="w-3.5 h-3.5" />
          View Lesson
        </Button>
        <Button size="sm" className="gap-1.5" onClick={(e) => { e.stopPropagation(); onAssign(); }}>
          <Rocket className="w-3.5 h-3.5" />
          Assign
        </Button>
      </div>
    </Card>
  );
}

export const TeacherLessonLibrary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [assignLesson, setAssignLesson] = useState<LibraryLessonCard | null>(null);
  const [activeHub, setActiveHub] = useState<LibraryHub | null>(null);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [openUnit, setOpenUnit] = useState<string | null>(null);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['teacher-master-library-lessons'],
    queryFn: async () => {
      const data = await getLibraryLessons();
      return data.map(toLibraryLessonCard);
    },
    enabled: !!user?.id,
  });

  const displayLessons = lessons || [];
  const isSearching = search.trim().length > 0;

  const searched = useMemo(() => {
    if (!isSearching) return [];
    const q = search.toLowerCase();
    return displayLessons.filter(l =>
      [l.title, l.description, l.cefr_level, l.hub].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    );
  }, [displayLessons, isSearching, search]);

  // Hubs that actually have lessons, in a fixed display order.
  const hubOrder: LibraryHub[] = ['playground', 'academy', 'professional'];
  const hubsWithContent = useMemo(
    () => hubOrder.filter(h => displayLessons.some(l => l.hub === h)),
    [displayLessons]
  );

  useEffect(() => {
    if (!activeHub && hubsWithContent.length > 0) setActiveHub(hubsWithContent[0]);
  }, [activeHub, hubsWithContent]);

  const hubLessons = useMemo(
    () => (activeHub ? displayLessons.filter(l => l.hub === activeHub) : []),
    [displayLessons, activeHub]
  );

  const levelsInHub = useMemo(() => {
    const set = new Set<string>();
    for (const l of hubLessons) set.add(l.cefr_level);
    return Array.from(set).sort((a, b) => levelRank(a) - levelRank(b));
  }, [hubLessons]);

  useEffect(() => {
    if (levelsInHub.length === 0) { setActiveLevel(null); return; }
    if (!activeLevel || !levelsInHub.includes(activeLevel)) setActiveLevel(levelsInHub[0]);
  }, [levelsInHub, activeLevel]);

  const unitGroups = useMemo<UnitGroup[]>(() => {
    const lessonsInLevel = hubLessons.filter(l => l.cefr_level === activeLevel);
    const map = new Map<string, UnitGroup>();
    for (const l of lessonsInLevel) {
      const key = l.unit_number != null ? String(l.unit_number) : 'other';
      if (!map.has(key)) {
        map.set(key, { unit_number: l.unit_number, unit_title: l.unit_title, lessons: [] });
      }
      const g = map.get(key)!;
      g.lessons.push(l);
      if (!g.unit_title && l.unit_title) g.unit_title = l.unit_title;
    }
    for (const g of map.values()) {
      g.lessons.sort((a, b) => (a.lesson_number ?? 0) - (b.lesson_number ?? 0));
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.unit_number == null) return 1;
      if (b.unit_number == null) return -1;
      return a.unit_number - b.unit_number;
    });
  }, [hubLessons, activeLevel]);

  useEffect(() => {
    setOpenUnit(unitGroups[0] ? (unitGroups[0].unit_number != null ? String(unitGroups[0].unit_number) : 'other') : null);
  }, [unitGroups]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleView = (lesson: LibraryLessonCard) => {
    // resolvePlaygroundLessonRoute also covers the new 'academy-v2' Academy
    // format now (see its own doc comment) — only Playground and Academy
    // rows can possibly resolve to a real non-null route; Success/old-format
    // Academy rows correctly fall through to the generic /lesson/:id reader.
    const richRoute = lesson.hub === 'playground' || lesson.hub === 'academy'
      ? resolvePlaygroundLessonRoute(lesson.id, { contentFormat: lesson.content_format, unit_number: lesson.unit_number, lesson_number: lesson.lesson_number })
      : null;
    navigate(richRoute ?? `/lesson/${lesson.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">📚 My Lesson Library</h2>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2 flex-wrap">
            <span>{displayLessons.length} lessons available</span>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              <Eye className="w-3 h-3 mr-1" /> View only
            </Badge>
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isSearching ? (
        // Search overrides the hub/unit grouping with a flat, ranked result list.
        searched.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No lessons match your search.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searched.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                hub={HUB_META[lesson.hub]}
                onView={() => handleView(lesson)}
                onAssign={() => setAssignLesson(lesson)}
              />
            ))}
          </div>
        )
      ) : displayLessons.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No published master lessons yet.</p>
        </Card>
      ) : (
        <>
          {/* Hub tabs */}
          <div className="flex flex-wrap gap-2">
            {hubsWithContent.map(h => {
              const meta = HUB_META[h];
              const active = activeHub === h;
              return (
                <button
                  key={h}
                  onClick={() => setActiveHub(h)}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${active ? meta.active + ' shadow-md' : `${meta.color} hover:opacity-80`}`}
                >
                  {meta.emoji} {meta.label}
                </button>
              );
            })}
          </div>

          {/* Level pills */}
          {levelsInHub.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {levelsInHub.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setActiveLevel(lvl)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ring-1 ${
                    activeLevel === lvl
                      ? 'bg-foreground text-background ring-foreground'
                      : 'bg-transparent text-muted-foreground ring-border hover:bg-muted'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}

          {/* Unit accordions */}
          {unitGroups.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-muted-foreground">No lessons at this level yet.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {unitGroups.map(group => {
                const key = group.unit_number != null ? String(group.unit_number) : 'other';
                const isOpen = openUnit === key;
                const label = group.unit_number != null ? `Unit ${group.unit_number}` : 'Other';
                return (
                  <div key={key} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                    <button
                      onClick={() => setOpenUnit(isOpen ? null : key)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="secondary" className="shrink-0 text-[10px] font-bold uppercase tracking-wide">
                          {label}
                        </Badge>
                        {group.unit_title && (
                          <span className="truncate font-semibold text-sm text-foreground">{group.unit_title}</span>
                        )}
                        <span className="shrink-0 text-xs text-muted-foreground">· {group.lessons.length} {group.lessons.length === 1 ? 'lesson' : 'lessons'}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="grid grid-cols-1 gap-4 border-t border-border/60 bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-3">
                        {group.lessons.map(lesson => (
                          <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            hub={HUB_META[lesson.hub]}
                            onView={() => handleView(lesson)}
                            onAssign={() => setAssignLesson(lesson)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Assign Modal */}
      {assignLesson && (
        <AssignLessonModal
          lesson={assignLesson}
          onClose={() => setAssignLesson(null)}
        />
      )}
    </div>
  );
};
