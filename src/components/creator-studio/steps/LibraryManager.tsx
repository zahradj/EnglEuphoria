import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Library, Loader2, FileText, CheckCircle2, Pencil, Trash2, X, Lock, BookOpen, Gamepad2, Search, ChevronDown, Plus, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useHubTheme } from '@/hooks/useHubTheme';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useCreator,
  ActiveLessonData,
  PPPSlide,
  CEFRLevel,
  HubType,
} from '../CreatorContext';

interface LessonRow {
  id: string;
  title: string;
  description: string | null;
  target_system: string;
  difficulty_level: string;
  is_published: boolean | null;
  updated_at: string | null;
  content: any;
  ai_metadata: any;
  level_id: string | null;
  unit_id: string | null;
  sequence_order: number | null;
  skills_focus: string[] | null;
}

interface UnitRow {
  id: string;
  unit_number: number;
  title: string;
  cefr_level: string | null;
}

interface LevelRow {
  id: string;
  name: string;
  cefr_level: string | null;
  target_system: string | null;
}

// ── Hub + CEFR gradient mapping ────────────────────────────────────
type GradientEntry = { bg: string; text: string };
const LEVEL_GRADIENTS: Record<string, Record<string, GradientEntry>> = {
  academy: {
    A1: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300' },
    A2: { bg: 'bg-blue-200 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200' },
    B1: { bg: 'bg-indigo-300 dark:bg-indigo-900/50', text: 'text-indigo-900 dark:text-indigo-200' },
    B2: { bg: 'bg-indigo-400 dark:bg-indigo-800/60', text: 'text-white' },
    C1: { bg: 'bg-purple-500 dark:bg-purple-800/60', text: 'text-white' },
    C2: { bg: 'bg-purple-700 dark:bg-purple-900/70', text: 'text-white' },
  },
  playground: {
    'Pre-A1': { bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-700 dark:text-yellow-300' },
    A1: { bg: 'bg-yellow-100 dark:bg-yellow-950/40', text: 'text-yellow-700 dark:text-yellow-300' },
    A2: { bg: 'bg-yellow-200 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-200' },
    B1: { bg: 'bg-orange-300 dark:bg-orange-900/50', text: 'text-orange-900 dark:text-orange-200' },
    B2: { bg: 'bg-orange-400 dark:bg-orange-800/60', text: 'text-white' },
    C1: { bg: 'bg-orange-500 dark:bg-orange-800/60', text: 'text-white' },
    C2: { bg: 'bg-orange-600 dark:bg-orange-900/70', text: 'text-white' },
  },
  success: {
    'Pre-A1': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300' },
    A1: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300' },
    A2: { bg: 'bg-emerald-200 dark:bg-emerald-900/50', text: 'text-emerald-800 dark:text-emerald-200' },
    B1: { bg: 'bg-teal-300 dark:bg-teal-900/50', text: 'text-teal-900 dark:text-teal-200' },
    B2: { bg: 'bg-teal-400 dark:bg-teal-800/60', text: 'text-white' },
    C1: { bg: 'bg-teal-600 dark:bg-teal-800/60', text: 'text-white' },
    C2: { bg: 'bg-teal-800 dark:bg-teal-900/70', text: 'text-white' },
  },
};

function getLevelGradient(hub: string, cefr: string): GradientEntry {
  const hubKey = hub === 'kids' ? 'playground' : hub === 'teen' ? 'academy' : hub === 'adult' ? 'success' : hub;
  const map = LEVEL_GRADIENTS[hubKey] || LEVEL_GRADIENTS.academy;
  const key = /^pre-?a1$/i.test(cefr) ? 'Pre-A1' : cefr.toUpperCase();
  return map[key] || { bg: 'bg-slate-200 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' };
}

function targetSystemToHub(ts: string): string {
  if (ts === 'kids') return 'playground';
  if (ts === 'teen') return 'academy';
  return 'success';
}

const HUB_ICON: Record<string, React.ReactNode> = {
  playground: <Gamepad2 className="h-4 w-4" />,
  academy: <BookOpen className="h-4 w-4" />,
  success: <Library className="h-4 w-4" />,
};

const HUB_HEADER_GRADIENT: Record<string, string> = {
  playground: 'from-amber-500 via-orange-500 to-yellow-500',
  academy: 'from-violet-600 via-fuchsia-600 to-pink-600',
  success: 'from-emerald-500 via-teal-500 to-cyan-500',
};

// ── Types for the hierarchical grouping ────────────────────────────
interface LevelGroup {
  hub: string;
  cefr: string;
  lessons: LessonRow[];
  unitGroups: UnitGroup[];
}

interface UnitGroup {
  unit_id: string | null;
  unit_number: number | null;
  unit_title: string;
  lessons: LessonRow[];
}

export const LibraryManager: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setActiveLessonData, setCurrentStep, setDirty } = useCreator();
  const [rows, setRows] = useState<LessonRow[] | null>(null);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [lessonsWithStory, setLessonsWithStory] = useState<Set<string>>(new Set());
  const [storybooks, setStorybooks] = useState<Array<{ id: string; title: string; hub: string; cefr_level: string | null; cover_image_url: string | null; updated_at: string | null }>>([]);
  const [storybookBusyId, setStorybookBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState<'selected' | 'all' | null>(null);
  // ── Navigation / filter state ────────────────────────────────────
  const initialHub = (searchParams.get('hub') as 'all' | 'playground' | 'academy' | 'success') || 'all';
  const [hubFilter, setHubFilter] = useState<'all' | 'playground' | 'academy' | 'success'>(
    ['all', 'playground', 'academy', 'success'].includes(initialHub) ? initialHub : 'all',
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [kindFilter, setKindFilter] = useState<'all' | 'standard' | 'trial' | 'story'>('all');
  const [search, setSearch] = useState('');
  const [openHubs, setOpenHubs] = useState<Set<string>>(new Set(['playground', 'academy', 'success']));
  const [openLevels, setOpenLevels] = useState<Set<string>>(new Set());
  const toggleHub = (h: string) => setOpenHubs((p) => { const n = new Set(p); n.has(h) ? n.delete(h) : n.add(h); return n; });
  const toggleLevel = (k: string) => setOpenLevels((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const fetchRows = React.useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setRows([]);
      setLoading(false);
      return;
    }
    const lessonsRes = await supabase
      .from('curriculum_lessons')
      .select(
        'id, title, description, target_system, difficulty_level, is_published, updated_at, content, ai_metadata, level_id, unit_id, sequence_order, skills_focus',
      )
      .eq('created_by', uid)
      .order('target_system', { ascending: true })
      .order('difficulty_level', { ascending: true })
      .order('sequence_order', { ascending: true })
      .limit(500);

    if (lessonsRes.error) {
      console.error('library fetch error', lessonsRes.error);
      toast.error(`Could not load library: ${lessonsRes.error.message}`);
    }

    console.log('Library Fetch Result:', { uid, count: lessonsRes.data?.length ?? 0, data: lessonsRes.data });

    const lessons = (lessonsRes.data ?? []) as LessonRow[];

    const unitIds = Array.from(
      new Set(lessons.map((l) => l.unit_id).filter((x): x is string => !!x)),
    );
    let unitRows: UnitRow[] = [];
    if (unitIds.length > 0) {
      const unitsRes = await supabase
        .from('curriculum_units')
        .select('id, unit_number, title, cefr_level')
        .in('id', unitIds);
      if (unitsRes.error) {
        console.error('units fetch error', unitsRes.error);
      } else {
        unitRows = (unitsRes.data ?? []) as UnitRow[];
      }
    }

    // ── Detect lessons that have at least one linked story (Graded Reader) ──
    const storyLinksRes = await supabase
      .from('curriculum_lessons')
      .select('parent_lesson_id')
      .eq('ai_metadata->>kind', 'story')
      .not('parent_lesson_id', 'is', null);
    const linkedSet = new Set<string>();
    if (!storyLinksRes.error && Array.isArray(storyLinksRes.data)) {
      for (const r of storyLinksRes.data as Array<{ parent_lesson_id: string | null }>) {
        if (r.parent_lesson_id) linkedSet.add(r.parent_lesson_id);
      }
    }

    setRows(lessons);
    setUnits(unitRows);
    setLessonsWithStory(linkedSet);
    setSelectedIds(new Set());

    // ── Storybooks (separate table; user's own books) ──
    const sbRes = await (supabase as any)
      .from('storybooks')
      .select('id, title, hub, cefr_level, cover_image_url, updated_at')
      .eq('created_by', uid)
      .order('updated_at', { ascending: false });
    if (!sbRes.error && Array.isArray(sbRes.data)) {
      setStorybooks(sbRes.data);
    }

    setLoading(false);
  }, []);

  const handleDeleteStorybook = async (bookId: string, title: string) => {
    if (!confirm(`Delete storybook "${title}"? This permanently removes its pages and all student progress for it.`)) return;
    setStorybookBusyId(bookId);
    try {
      const { data, error } = await supabase.functions.invoke('storybook-studio', {
        body: { action: 'delete_book', bookId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setStorybooks((prev) => prev.filter((b) => b.id !== bookId));
      toast.success('Storybook deleted');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Delete failed');
    } finally {
      setStorybookBusyId(null);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // Sync hub filter ↔ URL (?hub=playground|academy|success|all)
  useEffect(() => {
    const current = searchParams.get('hub') ?? 'all';
    if (current === hubFilter) return;
    const next = new URLSearchParams(searchParams);
    if (hubFilter === 'all') next.delete('hub');
    else next.set('hub', hubFilter);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubFilter]);

  const handleCreateNew = (hub?: 'playground' | 'academy' | 'success') => {
    const target = hub ?? (hubFilter !== 'all' ? hubFilter : null);
    if (target === 'playground') return navigate('/playground-creator');
    if (target === 'academy') return navigate('/academy-creator');
    if (target === 'success') return navigate('/success-creator');
    // all → default to Academy creator (advanced sequencing engine).
    return navigate('/academy-creator');
  };
  const handleEdit = (row: LessonRow) => {
    // Playground Library scene-format lessons (Little Explorers Phonics
    // style) use a completely different content shape from the classic
    // PlaygroundBlock/PPPSlide editors — route to the scene player instead
    // of the incompatible hub creator, which would choke trying to parse it.
    if (row.ai_metadata?.contentFormat === 'scene-player') {
      navigate(`/playground-scene/play/${row.id}`);
      return;
    }
    const slides: PPPSlide[] = Array.isArray(row.content?.slides) ? row.content.slides : [];
    const homework_missions = Array.isArray(row.content?.homework_missions)
      ? row.content.homework_missions
      : [];
    const meta = row.ai_metadata ?? {};
    const blueprintRef = meta.blueprint_ref ?? undefined;
    const kindRaw = typeof meta.kind === 'string' ? meta.kind : 'standard';
    const kind: 'standard' | 'trial' | 'story' =
      kindRaw === 'story' || kindRaw === 'trial' ? kindRaw : 'standard';
    const allowedStyles = ['classic', 'comic_western', 'manga_rtl', 'webtoon', 'picture_book', 'comic_spread'];
    const visualStyle = typeof meta.visual_style === 'string' && allowedStyles.includes(meta.visual_style)
      ? (meta.visual_style as ActiveLessonData['visual_style'])
      : undefined;
    const storyLayout = meta.story_layout === 'classic' || meta.story_layout === 'immersive'
      ? meta.story_layout
      : undefined;
    // Resolve CEFR using the same precedence as the library cards.
    const cefr = resolveCefr(row) as CEFRLevel;
    const next: ActiveLessonData = {
      lesson_id: row.id,
      lesson_title: row.title,
      target_goal: row.description ?? undefined,
      cefr_level: cefr ?? 'A1',
      hub: targetSystemToHub(row.target_system) as HubType,
      slides,
      homework_missions,
      source_lesson: blueprintRef,
      level_id: row.level_id ?? undefined,
      unit_id: row.unit_id ?? undefined,
      kind,
      visual_style: visualStyle,
      story_layout: storyLayout,
      linked_lesson_title: typeof meta.linked_lesson_title === 'string' ? meta.linked_lesson_title : null,
      parent_lesson_id: typeof meta.linked_lesson_id === 'string' ? meta.linked_lesson_id : undefined,
    };
    setActiveLessonData(next);
    setDirty(false);
    // Smart routing: open the hub-specific creator with the lesson preloaded.
    const hub = targetSystemToHub(row.target_system);
    if (hub === 'playground') {
      navigate(`/playground-creator?lessonId=${row.id}`);
      return;
    }
    if (hub === 'academy') {
      navigate(`/academy-creator?lessonId=${row.id}`);
      return;
    }
    if (hub === 'success') {
      navigate(`/success-creator?lessonId=${row.id}`);
      return;
    }
    // Unknown hub → default to Academy creator.
    navigate(`/academy-creator?lessonId=${row.id}`);
  };

  const handleDelete = async (row: LessonRow) => {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    setBusyId(row.id);
    const { error } = await supabase.from('curriculum_lessons').delete().eq('id', row.id);
    setBusyId(null);
    if (error) {
      toast.error(`Delete failed: ${error.message}`);
      return;
    }
    toast.success('Lesson deleted');
    setRows((prev) => prev?.filter((r) => r.id !== row.id) ?? null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(row.id);
      return next;
    });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!rows) return;
    setSelectedIds((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  };

  const allSelected = useMemo(
    () => !!rows && rows.length > 0 && selectedIds.size === rows.length,
    [rows, selectedIds],
  );

  // ── Hierarchical grouping: Hub → Level (CEFR) → Unit → Lessons ──
  const levelGroups = useMemo<LevelGroup[]>(() => {
    if (!rows) return [];
    const unitById = new Map(units.map((u) => [u.id, u]));

    // Group by hub + CEFR. Prefer ai_metadata.cefr_level (the real value)
    // over the coarse difficulty_level enum (which is often "beginner" for everything).
    const hubLevelMap = new Map<string, LessonRow[]>();
    for (const lesson of rows) {
      const hub = targetSystemToHub(lesson.target_system);
      const cefr = resolveCefr(lesson);
      const key = `${hub}::${cefr}`;
      if (!hubLevelMap.has(key)) hubLevelMap.set(key, []);
      hubLevelMap.get(key)!.push(lesson);
    }

    // Build level groups
    const groups: LevelGroup[] = [];
    for (const [key, lessons] of hubLevelMap.entries()) {
      const [hub, cefr] = key.split('::');
      // Sub-group by unit
      const unitMap = new Map<string, UnitGroup>();
      const UNCAT_KEY = '__uncategorized__';

      for (const lesson of lessons) {
        const u = lesson.unit_id ? unitById.get(lesson.unit_id) : undefined;
        const metaUnitNumber: number | null =
          typeof lesson.ai_metadata?.unit_number === 'number' ? lesson.ai_metadata.unit_number : null;
        const metaUnitTitle: string | null =
          typeof lesson.ai_metadata?.unit_title === 'string' ? lesson.ai_metadata.unit_title : null;

        const resolvedUnitNumber = u?.unit_number ?? metaUnitNumber;
        const resolvedUnitTitle = u?.title ?? metaUnitTitle ?? 'Uncategorized';
        const uKey = u
          ? u.id
          : metaUnitNumber != null
          ? `meta::${metaUnitNumber}::${metaUnitTitle ?? ''}`
          : UNCAT_KEY;

        if (!unitMap.has(uKey)) {
          unitMap.set(uKey, {
            unit_id: u?.id ?? null,
            unit_number: resolvedUnitNumber,
            unit_title: resolvedUnitTitle,
            lessons: [],
          });
        }
        unitMap.get(uKey)!.lessons.push(lesson);
      }

      // Sort lessons in each unit by sequence_order
      unitMap.forEach((g) => {
        g.lessons.sort((a, b) => {
          const ao = a.sequence_order ?? Number.POSITIVE_INFINITY;
          const bo = b.sequence_order ?? Number.POSITIVE_INFINITY;
          if (ao !== bo) return ao - bo;
          return a.title.localeCompare(b.title);
        });
      });

      const unitGroups = Array.from(unitMap.values()).sort((a, b) => {
        if (a.unit_number == null && b.unit_number == null) return 0;
        if (a.unit_number == null) return 1;
        if (b.unit_number == null) return -1;
        return a.unit_number - b.unit_number;
      });

      groups.push({ hub, cefr, lessons, unitGroups });
    }

    // Sort groups by hub order then CEFR order
    const HUB_ORDER: Record<string, number> = { playground: 0, academy: 1, success: 2 };
    const CEFR_ORDER: Record<string, number> = { 'Pre-A1': -1, A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
    groups.sort((a, b) => {
      const ho = (HUB_ORDER[a.hub] ?? 9) - (HUB_ORDER[b.hub] ?? 9);
      if (ho !== 0) return ho;
      return (CEFR_ORDER[a.cefr] ?? 9) - (CEFR_ORDER[b.cefr] ?? 9);
    });

    return groups;
  }, [rows, units]);

  // Apply hub filter + free-text search to the grouped data
  const filteredHubGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byHub = new Map<string, LevelGroup[]>();
    for (const g of levelGroups) {
      if (hubFilter !== 'all' && g.hub !== hubFilter) continue;

      // Filter lessons inside each unit by search term + kind
      const filteredUnits = g.unitGroups
        .map((u) => ({
          ...u,
          lessons: u.lessons.filter((l) => {
            if (kindFilter !== 'all') {
              const k = (l.ai_metadata?.kind as string | undefined) || 'standard';
              if (k !== kindFilter) return false;
            }
            if (!q) return true;
            return (
              l.title.toLowerCase().includes(q) ||
              (l.description ?? '').toLowerCase().includes(q) ||
              u.unit_title.toLowerCase().includes(q)
            );
          }),
        }))
        .filter((u) => u.lessons.length > 0);

      if (filteredUnits.length === 0) continue;
      const filteredGroup: LevelGroup = {
        ...g,
        lessons: filteredUnits.flatMap((u) => u.lessons),
        unitGroups: filteredUnits,
      };
      if (!byHub.has(g.hub)) byHub.set(g.hub, []);
      byHub.get(g.hub)!.push(filteredGroup);
    }
    const HUB_ORDER: Record<string, number> = { playground: 0, academy: 1, success: 2 };
    return Array.from(byHub.entries())
      .map(([hub, levels]) => ({ hub, levels }))
      .sort((a, b) => (HUB_ORDER[a.hub] ?? 9) - (HUB_ORDER[b.hub] ?? 9));
  }, [levelGroups, hubFilter, kindFilter, search]);

  // Auto-open the first level inside each hub once data arrives (only once)
  useEffect(() => {
    if (filteredHubGroups.length === 0 || openLevels.size > 0) return;
    const initial = new Set<string>();
    for (const h of filteredHubGroups) {
      if (h.levels[0]) initial.add(`${h.hub}::${h.levels[0].cefr}`);
    }
    setOpenLevels(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredHubGroups.length]);

  const performBulkDelete = async (mode: 'selected' | 'all') => {
    if (!rows) return;
    const ids = mode === 'all' ? rows.map((r) => r.id) : Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkBusy(true);
    const { error } = await supabase.from('curriculum_lessons').delete().in('id', ids);
    setBulkBusy(false);
    setConfirmBulk(null);
    if (error) {
      toast.error(`Bulk delete failed: ${error.message}`);
      return;
    }
    toast.success(`Deleted ${ids.length} lesson${ids.length === 1 ? '' : 's'}`);
    setRows((prev) => prev?.filter((r) => !ids.includes(r.id)) ?? null);
    setSelectedIds(new Set());
  };

  const { theme } = useHubTheme();
  return (
    <div className={cn('max-w-5xl mx-auto p-6 pb-24 hub-surface', theme.themeClass, theme.font, theme.radius)}>
      {/* Back to Dashboard */}
      <div className="mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="gap-1.5 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
          <Library className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Master Library
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your published and draft lessons, grouped by Hub → Level → Unit. Use the Type filter to view stories and delete them individually or in bulk.
          </p>
        </div>

        {/* Create New Lesson — smart-routed by active tab */}
        <Popover open={createOpen} onOpenChange={setCreateOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0"
              onClick={(e) => {
                if (hubFilter !== 'all') {
                  e.preventDefault();
                  setCreateOpen(false);
                  handleCreateNew();
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Create New Lesson
            </Button>
          </PopoverTrigger>
          {hubFilter === 'all' && (
            <PopoverContent align="end" className="w-56 p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 pt-1 pb-2">
                Choose a hub
              </p>
              <button
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 text-sm font-semibold flex items-center gap-2"
                onClick={() => { setCreateOpen(false); handleCreateNew('playground'); }}
              >
                <Gamepad2 className="h-4 w-4 text-orange-500" /> Playground (Kids)
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/30 text-sm font-semibold flex items-center gap-2"
                onClick={() => { setCreateOpen(false); handleCreateNew('academy'); }}
              >
                <BookOpen className="h-4 w-4 text-violet-600" /> Academy (Teens)
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-sm font-semibold flex items-center gap-2"
                onClick={() => { setCreateOpen(false); handleCreateNew('success'); }}
              >
                <Library className="h-4 w-4 text-emerald-600" /> Success (Adults)
              </button>
            </PopoverContent>
          )}
        </Popover>
        <Button variant="outline" size="sm" onClick={fetchRows} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
        {!!rows?.length && (
          <AlertDialog
            open={confirmBulk === 'all'}
            onOpenChange={(open) => !open && setConfirmBulk(null)}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={() => setConfirmBulk('all')}
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear entire library?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>all {rows.length} lessons</strong> in your
                  library. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={bulkBusy}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={bulkBusy}
                  onClick={() => performBulkDelete('all')}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {bulkBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Bulk select toolbar */}
      {!!rows?.length && (
        <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all lessons"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : `Select lessons to delete in bulk`}
          </span>
          <div className="flex-1" />
          {selectedIds.size > 0 && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={() => setSelectedIds(new Set())}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
              <AlertDialog
                open={confirmBulk === 'selected'}
                onOpenChange={(open) => !open && setConfirmBulk(null)}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 px-3 text-xs gap-1.5"
                    onClick={() => setConfirmBulk('selected')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Selected ({selectedIds.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedIds.size} selected lesson(s)?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={bulkBusy}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={bulkBusy}
                      onClick={() => performBulkDelete('selected')}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {bulkBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      )}

      {/* ── Storybooks panel ─────────────────────────────────── */}
      {storybooks.length > 0 && (
        <div className="mb-6 rounded-2xl border border-violet-200 dark:border-violet-900 bg-violet-50/40 dark:bg-violet-950/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Your Storybooks ({storybooks.length})</h3>
            <span className="text-xs text-slate-500">— remove a book to wipe its pages and student progress.</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {storybooks.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2">
                <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                  {b.cover_image_url ? (
                    <img src={b.cover_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><BookOpen className="h-5 w-5 text-slate-400" /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{b.title}</p>
                  <p className="text-[11px] text-slate-500">{b.hub} · {b.cefr_level ?? '—'}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/storybook/viewer/${b.id}?studio=1`)}
                  className="h-8 px-2 text-xs"
                >
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                  disabled={storybookBusyId === b.id}
                  onClick={() => handleDeleteStorybook(b.id, b.title)}
                  aria-label={`Delete storybook ${b.title}`}
                >
                  {storybookBusyId === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ── Hub filter tabs + search ─────────────────────────────────── */}
      {!!rows?.length && (
        <div className="sticky top-0 z-20 -mx-6 px-6 py-3 mb-5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Hub tabs — accessible Tabs with hub-accent underline */}
            <Tabs
              value={hubFilter}
              onValueChange={(v) => setHubFilter(v as typeof hubFilter)}
              className="shrink-0"
            >
              <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl h-auto">
                {([
                  { key: 'all', label: 'All Lessons', accent: 'data-[state=active]:after:bg-slate-700' },
                  { key: 'playground', label: 'Playground (Kids)', accent: 'data-[state=active]:after:bg-orange-500' },
                  { key: 'academy', label: 'Academy (Teens)', accent: 'data-[state=active]:after:bg-violet-600' },
                  { key: 'success', label: 'Success (Adults)', accent: 'data-[state=active]:after:bg-emerald-500' },
                ] as const).map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className={cn(
                      'relative px-3 py-1.5 text-xs font-bold tracking-wide rounded-lg',
                      'data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm',
                      'data-[state=active]:after:absolute data-[state=active]:after:left-3 data-[state=active]:after:right-3 data-[state=active]:after:-bottom-0.5 data-[state=active]:after:h-0.5 data-[state=active]:after:rounded-full',
                      tab.accent,
                    )}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lessons by title, description, or unit…"
                className="pl-9 h-9 text-sm rounded-lg"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>
              )}
            </div>
          </div>
          {/* Type (kind) chips */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">Type</span>
            {(['all', 'standard', 'trial', 'story'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKindFilter(k)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border',
                  kindFilter === k
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                )}
              >
                {k === 'all' ? 'All' : k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : !rows?.length ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40">
          <FileText className="h-8 w-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-500">No lessons yet. Build one in the Blueprint, then the Slide Studio.</p>
        </div>
      ) : filteredHubGroups.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40">
          <Search className="h-8 w-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-500">No lessons match your filters.</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setSearch(''); setHubFilter('all'); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredHubGroups.map(({ hub, levels }) => {
            const hubGradient = HUB_HEADER_GRADIENT[hub] || HUB_HEADER_GRADIENT.academy;
            const hubLabel = hub.charAt(0).toUpperCase() + hub.slice(1);
            const hubLessonCount = levels.reduce((n, l) => n + l.lessons.length, 0);
            const hubOpen = openHubs.has(hub);
            return (
              <Collapsible key={hub} open={hubOpen} onOpenChange={() => toggleHub(hub)}>
                {/* ── HUB HEADER ───────────────────────────────────── */}
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all',
                      `bg-gradient-to-r ${hubGradient} text-white shadow-md hover:shadow-lg`,
                    )}
                  >
                    <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                      {HUB_ICON[hub]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Hub</p>
                      <h3 className="text-lg font-extrabold tracking-tight">{hubLabel}</h3>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm shrink-0 text-[11px] font-bold">
                      {levels.length} level{levels.length === 1 ? '' : 's'} · {hubLessonCount} lesson{hubLessonCount === 1 ? '' : 's'}
                    </Badge>
                    <ChevronDown
                      className={cn('h-5 w-5 shrink-0 transition-transform', hubOpen ? 'rotate-180' : '')}
                    />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-4 pl-2 sm:pl-4 space-y-5 data-[state=open]:animate-in data-[state=open]:fade-in-0">
                  {levels.map((levelGroup) => {
                    const gradient = getLevelGradient(levelGroup.hub, levelGroup.cefr);
                    const levelKey = `${levelGroup.hub}::${levelGroup.cefr}`;
                    const levelOpen = openLevels.has(levelKey);
                    return (
                      <Collapsible key={levelKey} open={levelOpen} onOpenChange={() => toggleLevel(levelKey)}>
                        {/* ── LEVEL HEADER (hub-shaded) ──────────── */}
                        <CollapsibleTrigger asChild>
                          <button className={cn('w-full flex items-center gap-3 px-5 py-3 rounded-xl text-left transition-all hover:opacity-90', gradient.bg, gradient.text)}>
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center font-black text-lg">
                              {levelGroup.cefr}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                                {levelGroup.hub === 'playground' ? 'Stage' : 'CEFR Level'}
                              </p>
                              <h4 className="text-base font-extrabold tracking-tight">
                                {levelGroup.hub === 'playground' ? `Stage ${levelGroup.cefr}` : `Level ${levelGroup.cefr}`}
                              </h4>
                            </div>
                            <Badge variant="secondary" className="text-[11px] font-semibold bg-white/30 dark:bg-white/10 border-0 shrink-0">
                              {levelGroup.lessons.length} lesson{levelGroup.lessons.length === 1 ? '' : 's'}
                            </Badge>
                            <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform opacity-70', levelOpen ? 'rotate-180' : '')} />
                          </button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="pt-4 space-y-4">

                {/* ── Unit sub-groups ─────────────────────────── */}
                {levelGroup.unitGroups.map((group) => {
                  const isUncat = group.unit_number == null;
                  return (
                    <div key={group.unit_id ?? `__uncat__-${levelGroup.hub}-${levelGroup.cefr}-${group.unit_title}`} className="space-y-3 pl-4">
                      {/* Unit Sub-Header */}
                      <div
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 rounded-xl',
                          isUncat
                            ? 'bg-slate-100 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700'
                            : `bg-gradient-to-r ${hubGradient} text-white shadow-sm`,
                        )}
                      >
                        {!isUncat && (
                          <div className="h-8 w-8 shrink-0 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-extrabold text-sm">
                            {group.unit_number}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-[10px] font-bold uppercase tracking-[0.15em]',
                            isUncat ? 'text-slate-500 dark:text-slate-400' : 'text-white/70',
                          )}>
                            {isUncat ? 'Extra' : `Unit ${group.unit_number}`}
                          </p>
                          <h4 className={cn(
                            'text-sm font-bold truncate',
                            isUncat ? 'text-slate-700 dark:text-slate-200' : 'text-white',
                          )}>
                            {group.unit_title}
                          </h4>
                        </div>
                        <Badge variant="secondary" className={cn(
                          'shrink-0 text-[10px] font-semibold',
                          isUncat
                            ? 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            : 'bg-white/20 text-white border-0 backdrop-blur-sm',
                        )}>
                          {group.lessons.length} lesson{group.lessons.length === 1 ? '' : 's'}
                        </Badge>
                        {!isUncat && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2 text-[11px] gap-1 bg-white/90 text-slate-900 hover:bg-white shrink-0"
                            title="Open this unit in the AI Generator and regenerate the whole 6-lesson unit"
                            onClick={() => {
                              const hub = levelGroup.hub;
                              const params = new URLSearchParams({
                                unitId: group.unit_id ?? '',
                                topic: group.unit_title,
                                cefr: levelGroup.cefr,
                                autogen: 'unit',
                              });
                              const path = hub === 'playground' ? '/playground-creator'
                                : hub === 'academy' ? '/academy-creator'
                                : '/success-creator';
                              navigate(`${path}?${params.toString()}`);
                            }}
                          >
                            <Pencil className="h-3 w-3" /> Edit Unit (AI)
                          </Button>
                        )}
                      </div>


                      {/* Lesson cards */}
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {group.lessons.map((row) => {
                          const slideCount = Array.isArray(row.content?.slides) ? row.content.slides.length : 0;
                          const isDraft = !row.is_published;
                          const isBusy = busyId === row.id;
                          const isChecked = selectedIds.has(row.id);
                          const lessonNumber: number | null =
                            typeof row.ai_metadata?.lesson_number === 'number'
                              ? row.ai_metadata.lesson_number
                              : row.sequence_order != null && row.sequence_order > 100
                              ? row.sequence_order % 100
                              : row.sequence_order;
                          const cardGradient = getLevelGradient(row.target_system, resolveCefr(row));

                          return (
                            <li
                              key={row.id}
                              className={cn(
                                'group relative rounded-2xl border bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all',
                                isDraft ? 'opacity-80' : '',
                                isChecked
                                  ? 'border-red-400 dark:border-red-500/60 ring-2 ring-red-200 dark:ring-red-900/40'
                                  : 'border-slate-200 dark:border-slate-800',
                              )}
                            >
                              {/* Thumbnail placeholder — level-colored background with faint icon */}
                              <div className={cn(
                                'h-20 rounded-t-2xl flex items-center justify-center relative overflow-hidden',
                                cardGradient.bg,
                              )}>
                                {isDraft ? (
                                  <Lock className={cn('h-8 w-8 opacity-20', cardGradient.text)} />
                                ) : (
                                  <BookOpen className={cn('h-8 w-8 opacity-20', cardGradient.text)} />
                                )}
                                {/* Prominent L# badge */}
                                {lessonNumber != null && (
                                  <div className="absolute top-2 right-2 h-8 min-w-[2rem] px-2 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm flex items-center justify-center font-black text-xs text-slate-900 dark:text-slate-50 tracking-tight">
                                    L{lessonNumber}
                                  </div>
                                )}
                              </div>

                              {/* Selection checkbox */}
                              <div className="absolute top-2 left-2">
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => toggleSelected(row.id)}
                                  aria-label={`Select ${row.title}`}
                                  className="bg-white/80 dark:bg-slate-900/80"
                                />
                              </div>

                              {/* Hover action toolbar — bottom-right of thumbnail to avoid L# badge */}
                              <div className="absolute top-[68px] right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(row)}
                                  disabled={isBusy}
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 bg-white/90 dark:bg-slate-900/90 rounded-full shadow"
                                  aria-label="Delete lesson"
                                  title="Delete lesson"
                                >
                                  {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                </Button>
                              </div>

                              <div className="p-4">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {lessonNumber != null && (
                                    <Badge
                                      variant="secondary"
                                      className={cn('text-[10px] font-bold tracking-wider border-0', cardGradient.bg, cardGradient.text)}
                                    >
                                      Lesson {lessonNumber}
                                    </Badge>
                                  )}
                                  {lessonsWithStory.has(row.id) && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] font-bold border-0 bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 gap-1"
                                      title="A Graded Reader story is linked to this lesson"
                                    >
                                      📖 Includes Story
                                    </Badge>
                                  )}
                                </div>
                                <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-50 line-clamp-2">
                                  {row.title}
                                </h4>
                                {row.description && (
                                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {row.description}
                                  </p>
                                )}
                                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                                  <span>
                                    {slideCount} slide{slideCount === 1 ? '' : 's'}
                                  </span>
                                  {isDraft ? (
                                    <Badge variant="outline" className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 gap-1">
                                      <Lock className="h-3 w-3" /> 🔒 Draft
                                    </Badge>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> ✅ Published
                                    </span>
                                  )}
                                </div>

                                <Button
                                  size="sm"
                                  onClick={() => handleEdit(row)}
                                  className={cn(
                                    'mt-3 w-full gap-1.5 border-0 text-white',
                                    isDraft
                                      ? 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
                                      : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600',
                                  )}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  {isDraft ? 'Edit & Publish' : 'Edit Slides'}
                                </Button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────
function difficultyToCefr(difficulty: string): string {
  const d = (difficulty || '').toLowerCase().replace(/\s+/g, '');
  if (d === 'pre-a1' || d === 'prea1' || d === 'pre_a1') return 'Pre-A1';
  if (d === 'beginner') return 'A1';
  if (d === 'intermediate') return 'B1';
  if (d === 'advanced') return 'C1';
  // Already a CEFR code?
  if (['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].includes(d)) return d.toUpperCase();
  return 'A1';
}

// Single source of truth for resolving a lesson's CEFR level.
// Priority: ai_metadata.cefr_level → ai_metadata.level → difficulty_level enum.
function resolveCefr(lesson: { difficulty_level: string; ai_metadata: any }): string {
  const meta = lesson.ai_metadata ?? {};
  const candidates = [meta.cefr_level, meta.level, meta.cefr];
  for (const c of candidates) {
    if (typeof c === 'string') {
      const compact = c.trim().toLowerCase().replace(/\s+/g, '').replace(/_/g, '-');
      if (compact === 'pre-a1' || compact === 'prea1') return 'Pre-A1';
      const up = c.trim().toUpperCase();
      if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(up)) return up;
    }
  }
  return difficultyToCefr(lesson.difficulty_level);
}
