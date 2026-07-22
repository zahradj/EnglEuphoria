import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, BookOpen, Sparkles, AlertCircle, Link2, X, Check, ChevronsUpDown, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCreator, CEFRLevel } from '../CreatorContext';
import { listCharactersForHub } from '@/services/characterService';
import type { CustomCharacter, CharacterHub } from '@/types/character';
import { useAuth } from '@/contexts/AuthContext';
import { runStorybookGeneration } from '@/storybook';
import type { CastVaultCharacter } from '@/storybook/types';
import { unlockBook } from '@/services/storybookLibrary';

const CEFR: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const GENRES = ['Sci-Fi', 'Fairy Tale', 'Everyday Life', 'Mystery', 'Adventure', 'Slice of Life', 'Historical', 'Comedy'];

const uid = () => `s_${Math.random().toString(36).slice(2, 10)}`;

interface CurriculumLessonOption {
  id: string;
  title: string;
  difficulty_level: string;
  target_system: string;
  vocabulary_list: any;
  grammar_pattern: string | null;
  description: string | null;
  ai_metadata: any;
}

const HUB_LABEL: Record<string, string> = {
  kids: 'Playground',
  teen: 'Academy',
  adult: 'Success Hub',
};

const difficultyToCefr = (lesson: CurriculumLessonOption): CEFRLevel => {
  const explicit = lesson.ai_metadata?.cefr_level;
  if (typeof explicit === 'string' && CEFR.includes(explicit.toUpperCase() as CEFRLevel)) {
    return explicit.toUpperCase() as CEFRLevel;
  }
  switch ((lesson.difficulty_level || '').toLowerCase()) {
    case 'beginner': return 'A1';
    case 'intermediate': return 'B1';
    case 'advanced': return 'C1';
    default: return 'B1';
  }
};

const vocabListToString = (raw: any): string => {
  if (!raw) return '';
  if (Array.isArray(raw)) {
    return raw
      .map((w) => (typeof w === 'string' ? w : w?.word || w?.term || ''))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof raw === 'string') return raw;
  return '';
};

const vocabListToArray = (raw: any): string[] => {
  const s = vocabListToString(raw);
  return s.split(',').map((w) => w.trim()).filter(Boolean);
};

const StylePreview: React.FC<{ kind: 'classic' | 'comic_western' | 'manga_rtl' | 'webtoon' | 'comic_spread' }> = ({ kind }) => {
  if (kind === 'classic') {
    return (
      <div className="w-10 h-7 rounded overflow-hidden flex border border-slate-300">
        <div className="w-1/2 bg-gradient-to-br from-amber-300 to-orange-400" />
        <div className="w-1/2 bg-amber-50 flex items-center justify-center">
          <div className="w-3/4 h-0.5 bg-slate-400 rounded" />
        </div>
      </div>
    );
  }
  if (kind === 'comic_spread') {
    // Two-page open book preview
    return (
      <div className="w-10 h-7 rounded overflow-hidden flex border border-amber-700/50 bg-amber-900/40 p-[1px] gap-[1px]">
        <div className="flex-1 bg-amber-50 flex items-center justify-center">
          <div className="w-2/3 h-3 bg-gradient-to-br from-rose-300 to-amber-300 rounded-sm" />
        </div>
        <div className="flex-1 bg-amber-50 flex flex-col justify-center gap-[1px] px-0.5">
          <div className="h-0.5 w-full bg-slate-400/60 rounded" />
          <div className="h-0.5 w-3/4 bg-slate-400/60 rounded" />
          <div className="h-0.5 w-2/3 bg-slate-400/60 rounded" />
        </div>
      </div>
    );
  }
  if (kind === 'comic_western') {
    return (
      <div className="w-10 h-7 rounded overflow-hidden grid grid-cols-2 grid-rows-2 gap-[1px] bg-slate-900 p-[1px]">
        <div className="bg-rose-400" />
        <div className="bg-yellow-300" />
        <div className="col-span-2 bg-sky-400" />
      </div>
    );
  }
  if (kind === 'manga_rtl') {
    return (
      <div className="w-10 h-7 rounded overflow-hidden grid grid-cols-2 grid-rows-2 gap-[1px] bg-slate-900 p-[1px]" dir="rtl">
        <div className="bg-slate-200" />
        <div className="bg-slate-400" />
        <div className="bg-slate-300" />
        <div className="bg-slate-500" />
      </div>
    );
  }
  // webtoon
  return (
    <div className="w-10 h-7 rounded overflow-hidden flex flex-col gap-[1px] bg-slate-900 p-[1px]">
      <div className="flex-1 bg-gradient-to-r from-violet-400 to-fuchsia-400" />
      <div className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
      <div className="flex-1 bg-gradient-to-r from-sky-400 to-blue-400" />
    </div>
  );
};

export const StoryCreator: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setDirty } = useCreator();
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>('B1');
  const [genre, setGenre] = useState<string>('Everyday Life');
  const [vocabInput, setVocabInput] = useState('');
  const [visualStyle, setVisualStyle] = useState<'classic' | 'comic_western' | 'manga_rtl' | 'webtoon' | 'comic_spread'>('comic_spread');
  const [withAudio, setWithAudio] = useState(false);
  const [withIllustrations, setWithIllustrations] = useState(false);
  const [busy, setBusy] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characters, setCharacters] = useState<CustomCharacter[]>([]);
  const [starringId, setStarringId] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [promptTouched, setPromptTouched] = useState(false);
  const [storyTitle, setStoryTitle] = useState<string>('');
  const [directing, setDirecting] = useState(false);

  // ── Linked lesson picker ──
  const [lessons, setLessons] = useState<CurriculumLessonOption[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [linkedLessonId, setLinkedLessonId] = useState<string | null>(null);
  const linkedLesson = useMemo(
    () => lessons.find((l) => l.id === linkedLessonId) || null,
    [lessons, linkedLessonId],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setLessonsLoading(true);
      const { data, error: e } = await supabase
        .from('curriculum_lessons')
        .select('id, title, difficulty_level, target_system, vocabulary_list, grammar_pattern, description, ai_metadata')
        .eq('is_published', true)
        .order('target_system')
        .order('difficulty_level')
        .order('title')
        .limit(500);
      if (!alive) return;
      if (!e && Array.isArray(data)) {
        // exclude existing stories
        const filtered = data.filter((l: any) => (l?.ai_metadata?.kind ?? 'standard') !== 'story');
        setLessons(filtered as CurriculumLessonOption[]);
      }
      setLessonsLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const storyHub: CharacterHub = linkedLesson
    ? (linkedLesson.target_system === 'kids' ? 'playground'
      : linkedLesson.target_system === 'teen' ? 'academy'
      : 'success')
    : 'academy';

  useEffect(() => {
    let alive = true;
    listCharactersForHub(storyHub)
      .then((data) => { if (alive) setCharacters(data); })
      .catch(() => { if (alive) setCharacters([]); });
    setStarringId('');
    return () => { alive = false; };
  }, [storyHub]);

  const handleSelectLesson = (id: string) => {
    const lesson = lessons.find((l) => l.id === id);
    setLinkedLessonId(id);
    setPickerOpen(false);
    if (!lesson) return;

    // Auto-fill CEFR from the lesson's metadata / difficulty
    const nextCefr = difficultyToCefr(lesson);
    setCefrLevel(nextCefr);

    // Auto-fill target vocabulary from the lesson (overwrite if empty,
    // otherwise merge with what the teacher already typed — deduped).
    const lessonVocab = vocabListToArray(lesson.vocabulary_list);
    if (lessonVocab.length > 0) {
      const existing = vocabInput.split(',').map((w) => w.trim()).filter(Boolean);
      const seen = new Set<string>();
      const merged: string[] = [];
      for (const w of [...existing, ...lessonVocab]) {
        const k = w.toLowerCase();
        if (!seen.has(k)) { seen.add(k); merged.push(w); }
      }
      setVocabInput(merged.join(', '));
    }

    const grammarHint = lesson.grammar_pattern
      ? ` · grammar: ${lesson.grammar_pattern}`
      : '';
    toast.success(`Linked to "${lesson.title}" — CEFR ${nextCefr}${grammarHint}`);
  };

  const clearLinkedLesson = () => setLinkedLessonId(null);

  // Build an auto-prompt from current lesson context.
  const buildAutoPrompt = (): string => {
    const hubLabel = HUB_LABEL[linkedLesson?.target_system ?? ''] ?? storyHub;
    const topic = linkedLesson?.ai_metadata?.topic ?? linkedLesson?.title ?? genre;
    const vocab = (() => {
      const linkedVocab = linkedLesson ? vocabListToArray(linkedLesson.vocabulary_list) : [];
      const typed = parseVocab(vocabInput);
      const seen = new Set<string>();
      const merged: string[] = [];
      for (const w of [...linkedVocab, ...typed]) {
        const k = w.toLowerCase();
        if (!seen.has(k)) { seen.add(k); merged.push(w); }
      }
      return merged;
    })();
    const grammar = linkedLesson?.grammar_pattern;
    const pages = visualStyle === 'webtoon' ? '1 long webtoon scroll' : '4-5 page';
    return [
      `Write a ${pages} story for the ${hubLabel} Hub about "${topic}" at CEFR ${cefrLevel}.`,
      vocab.length ? `You MUST include the following vocabulary words: ${vocab.join(', ')}.` : '',
      grammar ? `Demonstrate this grammar pattern naturally: ${grammar}.` : '',
      `Genre: ${genre}.`,
    ].filter(Boolean).join(' ');
  };

  // Auto-populate prompt when context changes (until the teacher edits manually).
  useEffect(() => {
    if (promptTouched) return;
    setCustomPrompt(buildAutoPrompt());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedLessonId, vocabInput, cefrLevel, genre, visualStyle, promptTouched]);

  const handleAutoFillPrompt = () => {
    setCustomPrompt(buildAutoPrompt());
    setPromptTouched(false);
    toast.success('Prompt auto-filled from lesson context ✓');
  };

  // ── Story Director: full-form auto-pilot ──
  const handleAutoConfigureStory = async () => {
    if (directing) return;
    setDirecting(true);
    try {
      const linkedVocab = linkedLesson ? vocabListToArray(linkedLesson.vocabulary_list) : [];
      const typed = parseVocab(vocabInput);
      const seen = new Set<string>();
      const vocabulary: string[] = [];
      for (const w of [...linkedVocab, ...typed]) {
        const k = w.toLowerCase();
        if (!seen.has(k)) { seen.add(k); vocabulary.push(w); }
      }
      const charPayload = characters.map((c) => ({
        id: c.id,
        name: c.name,
        visual_blueprint: (c as any).visual_blueprint || (c as any).visualBlueprint || '',
      }));
      if (charPayload.length === 0) {
        toast.error('No characters in the Cast Vault for this hub yet.');
        return;
      }
      const { data, error } = await supabase.functions.invoke('ai-story-director', {
        body: { hub: storyHub, vocabulary, characters: charPayload, cefrLevel, genre },
      });
      if (error) throw error;
      const cfg = data as { title: string; character_name: string; theme: string; layout: string; prompt: string };

      // Hydrate state
      setStoryTitle(cfg.title || '');
      const matched = characters.find((c) => c.name.toLowerCase() === (cfg.character_name || '').toLowerCase());
      if (matched?.id) setStarringId(matched.id);
      // Theme → genre (use as-is if it matches our list, otherwise keep current)
      if (cfg.theme && GENRES.includes(cfg.theme)) {
        setGenre(cfg.theme);
      } else if (cfg.theme) {
        setGenre(cfg.theme);
      }
      // Layout → visualStyle
      const layoutMap: Record<string, typeof visualStyle> = {
        'Classic': 'classic',
        'Comic': storyHub === 'academy' ? 'webtoon' : 'comic_western',
        'Case Study': 'classic',
      };
      const nextStyle = layoutMap[cfg.layout] ?? 'classic';
      setVisualStyle(nextStyle);
      setCustomPrompt(cfg.prompt || '');
      setPromptTouched(true);
      toast.success('Story auto-configured ✓ Review and click Generate.');
    } catch (e) {
      console.error('Story Director error:', e);
      toast.error(e instanceof Error ? e.message : 'Auto-configure failed.');
    } finally {
      setDirecting(false);
    }
  };


  const grouped = useMemo(() => {
    const groups: Record<string, CurriculumLessonOption[]> = { kids: [], teen: [], adult: [] };
    for (const l of lessons) {
      const key = (l.target_system in groups) ? l.target_system : 'adult';
      groups[key].push(l);
    }
    return groups;
  }, [lessons]);

  const parseVocab = (raw: string) =>
    raw.split(',').map((w) => w.trim()).filter(Boolean);

  const handleSuggestVocab = async () => {
    if (suggesting || busy) return;
    setSuggesting(true);
    try {
      const linkedVocab = linkedLesson ? vocabListToArray(linkedLesson.vocabulary_list) : [];
      const typed = parseVocab(vocabInput);
      // Build must_include = linked lesson vocab ∪ already typed words (deduped)
      const seen = new Set<string>();
      const mustInclude: string[] = [];
      for (const w of [...linkedVocab, ...typed]) {
        const k = w.toLowerCase();
        if (!seen.has(k)) { seen.add(k); mustInclude.push(w); }
      }

      const { data, error: invokeError } = await supabase.functions.invoke('ai-core', {
        body: {
          action: 'suggest_vocabulary',
          cefr_level: cefrLevel,
          genre,
          linked_lesson_title: linkedLesson?.title || null,
          linked_grammar: linkedLesson?.grammar_pattern || null,
          must_include: mustInclude,
        },
      });

      if (invokeError) throw invokeError;
      if ((data as any)?.error) throw new Error((data as any).error);

      const words: string[] = Array.isArray((data as any)?.words) ? (data as any).words : [];
      if (words.length < 5) {
        toast.error('AI returned too few words — please try again or type your own.');
        return;
      }
      setVocabInput(words.join(', '));
      toast.success(`Suggested ${words.length} vocabulary words ✓`);
    } catch (e: any) {
      console.error('suggest_vocabulary failed:', e);
      toast.error(e?.message || 'Could not suggest vocabulary. Please try again.');
    } finally {
      setSuggesting(false);
    }
  };
  const handleGenerate = async () => {
    setError(null);
    const manualWords = parseVocab(vocabInput);

    // Merge linked lesson vocab (deduped, case-insensitive)
    const linkedVocab = linkedLesson ? vocabListToArray(linkedLesson.vocabulary_list) : [];
    const seen = new Set<string>();
    const words: string[] = [];
    for (const w of [...manualWords, ...linkedVocab]) {
      const k = w.toLowerCase();
      if (!seen.has(k)) { seen.add(k); words.push(w); }
    }

    if (words.length < 5 || words.length > 12) {
      setError('Please provide between 5 and 12 target vocabulary words (comma-separated, including any from the linked lesson).');
      return;
    }
    if (!user?.id) {
      setError('You must be signed in to publish a storybook.');
      return;
    }
    const starring = characters.find((c) => c.id === starringId);
    if (!starring) {
      setError('Pick a Cast Vault character. Storybooks must use Cast Vault for art-style, outfit, and identity continuity across pages.');
      return;
    }

    setBusy(true);
    try {
      // Adapt CustomCharacter → CastVaultCharacter (the engine accepts string blueprints; the
      // storybook-generate edge function reads visual_blueprint as a free-form description).
      const cast: CastVaultCharacter[] = [
        {
          id: starring.id,
          hub: storyHub,
          name: starring.name,
          role: 'protagonist',
          personality_traits: { summary: starring.personality_traits || '' },
          visual_blueprint: { appearance: starring.visual_blueprint || '' } as any,
          voice_id: null,
          avatar_url: starring.avatar_url ?? null,
          signature_traits: [],
          is_shared: false,
          created_by: starring.created_by,
        },
      ];

      const theme = linkedLesson?.ai_metadata?.topic ?? linkedLesson?.title ?? genre;
      const result = await runStorybookGeneration({
        brief: {
          title: storyTitle || `${genre} Story (${cefrLevel})`,
          hub: storyHub,
          cefr: (cefrLevel === 'C2' ? 'C1' : cefrLevel) as any,
          theme,
          story_type: genre,
          vocabulary_targets: words,
          grammar_targets: linkedLesson?.grammar_pattern ? [linkedLesson.grammar_pattern] : [],
          communication_goals: customPrompt?.trim() ? [customPrompt.trim()] : [],
        },
        cast,
        createdBy: user.id,
        withIllustrations,
        withAudio,
      });

      // Surface in the creator's own library for instant preview.
      try { await unlockBook(result.bookId, 'creator_preview'); } catch { /* non-fatal */ }

      setDirty(false);
      const autoMedia = withIllustrations || withAudio;
      toast.success(
        autoMedia
          ? 'Storybook published — illustrations & narration are rendering in the background (30–120s).'
          : 'Storybook published — opening Studio Mode so you can generate images and audio per page.',
      );
      navigate(`/storybook/viewer/${result.bookId}?studio=1`);
    } catch (e: any) {
      console.error('StoryCreator error:', e);
      const msg = e?.message || 'Storybook generation failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Story Creator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate CEFR-graded readers with illustrations and a comprehension quiz.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur p-6 space-y-6 shadow-sm">

        {/* ── Story Director: Auto-Pilot ── */}
        <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50 dark:from-violet-950/40 dark:via-fuchsia-950/40 dark:to-pink-950/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-violet-900 dark:text-violet-100">✨ Story Director</p>
              <p className="text-xs text-violet-700/80 dark:text-violet-300/80">
                Let AI pick the title, character, theme, layout, and prompt for you.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAutoConfigureStory}
              disabled={directing || characters.length === 0}
              className="shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md"
            >
              {directing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Configuring…</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Auto-Configure Entire Story</>
              )}
            </Button>
          </div>
          {storyTitle ? (
            <div className="mt-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                Story title (AI suggested)
              </Label>
              <Input
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                className="mt-1 bg-white/80 dark:bg-slate-900/60"
                placeholder="Story title"
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Link2 className="h-4 w-4 text-violet-500" />
            Link to Curriculum Lesson <span className="text-slate-400 font-normal">(optional)</span>
          </Label>

          {linkedLesson ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="secondary" className="text-[10px] font-bold bg-violet-200 text-violet-800 dark:bg-violet-800/50 dark:text-violet-200 border-0">
                    {HUB_LABEL[linkedLesson.target_system] ?? linkedLesson.target_system}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-bold bg-white dark:bg-slate-800 border-0 text-slate-700 dark:text-slate-200">
                    {difficultyToCefr(linkedLesson)}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {linkedLesson.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  CEFR & vocabulary auto-filled below.
                  {linkedLesson.grammar_pattern ? (
                    <> Grammar focus: <span className="font-semibold text-violet-700 dark:text-violet-300">{linkedLesson.grammar_pattern}</span>.</>
                  ) : null}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={clearLinkedLesson}
                className="shrink-0 h-8 w-8 p-0 rounded-full"
                aria-label="Unlink lesson"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={pickerOpen}
                  className="w-full justify-between font-normal"
                  disabled={lessonsLoading}
                >
                  {lessonsLoading
                    ? 'Loading lessons…'
                    : 'Select a lesson to base this story on…'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search lessons by title…" />
                  <CommandList>
                    <CommandEmpty>No lessons found.</CommandEmpty>
                    {(['kids', 'teen', 'adult'] as const).map((hub) => {
                      const items = grouped[hub];
                      if (!items || items.length === 0) return null;
                      return (
                        <CommandGroup key={hub} heading={HUB_LABEL[hub]}>
                          {items.map((l) => (
                            <CommandItem
                              key={l.id}
                              value={`${l.title} ${l.difficulty_level}`}
                              onSelect={() => handleSelectLesson(l.id)}
                              className="flex items-center gap-2"
                            >
                              <Check
                                className={cn(
                                  'h-4 w-4',
                                  linkedLessonId === l.id ? 'opacity-100 text-violet-500' : 'opacity-0',
                                )}
                              />
                              <span className="flex-1 truncate">{l.title}</span>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {difficultyToCefr(l)}
                              </Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">CEFR Level</Label>
          <Select value={cefrLevel} onValueChange={(v) => setCefrLevel(v as CEFRLevel)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CEFR.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Genre</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-semibold">
              Target Vocabulary <span className="text-slate-400 font-normal">(5–12 words, comma-separated)</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSuggestVocab}
              disabled={busy || suggesting || !cefrLevel || !genre}
              className="h-7 px-2 text-xs gap-1"
            >
              {suggesting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Sparkles className="w-3.5 h-3.5" />}
              Auto-suggest
            </Button>
          </div>
          <Input
            placeholder="e.g., curious, mountain, whisper, ancient, discover, shadow, forgotten"
            value={vocabInput}
            onChange={(e) => setVocabInput(e.target.value)}
            disabled={busy || suggesting}
          />
          <p className="text-xs text-slate-500">
            {parseVocab(vocabInput).length}/12 words
            {linkedLesson && ' · linked-lesson vocab is always included'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-semibold">Story Prompt</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoFillPrompt}
              disabled={busy}
              className="h-7 px-2 text-xs gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Fill Context
            </Button>
          </div>
          <Textarea
            placeholder="The AI brief — auto-filled from lesson context. Edit freely to add details."
            value={customPrompt}
            onChange={(e) => { setCustomPrompt(e.target.value); setPromptTouched(true); }}
            disabled={busy}
            rows={4}
            className="resize-y"
          />
          <p className="text-xs text-slate-500">
            Auto-updates from your linked lesson, vocabulary, CEFR and genre — until you start typing.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-violet-500" />
            Cast Vault Character <span className="text-red-500">*</span>
          </Label>
          <Select value={starringId || 'none'} onValueChange={(v) => setStarringId(v === 'none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Select a Cast Vault character…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Select a character —</SelectItem>
              {characters.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            Required. Storybooks pull from the Cast Vault to keep art style, outfit, and identity
            consistent across every page. ({characters.length} character{characters.length === 1 ? '' : 's'} available
            for the {storyHub} hub.)
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-3">
          <div>
            <Label className="text-sm font-semibold">Media Generation</Label>
            <p className="text-xs text-slate-500">
              By default you'll generate illustrations and narration <span className="font-semibold">manually per page</span> inside the
              reader's Studio Mode — much faster to publish, and you stay in control of style & cost.
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label className="text-sm font-medium">Auto-generate illustrations on publish</Label>
              <p className="text-xs text-slate-500">Off = generate per page manually after publish.</p>
            </div>
            <Switch checked={withIllustrations} onCheckedChange={setWithIllustrations} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label className="text-sm font-medium">Auto-generate narration audio on publish</Label>
              <p className="text-xs text-slate-500">ElevenLabs voiceover per page. Slower and costs more.</p>
            </div>
            <Switch checked={withAudio} onCheckedChange={setWithAudio} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Visual & Layout Style</Label>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
            Drives both AI illustration style and the in-app reader layout.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: 'comic_spread',  label: '📚 Classic Book',     desc: 'Two-page spread · image left, text right · turn pages' },
              { key: 'classic',       label: 'Classic Storybook',   desc: 'One illustration per page · LTR' },
              { key: 'comic_western', label: 'Western Comic',       desc: 'Multi-panel grid · vibrant ink · LTR' },
              { key: 'manga_rtl',     label: 'Japanese Manga',      desc: 'B&W panels · screentone · RTL reading' },
              { key: 'webtoon',       label: 'Webtoon (vertical)',  desc: 'One long scroll of stacked panels' },
            ] as const).map((opt) => {
              const active = visualStyle === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setVisualStyle(opt.key)}
                  className={`text-left rounded-xl border-2 p-3 transition-all ${
                    active
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <StylePreview kind={opt.key} />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{opt.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={busy || !starringId}
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
        >
          {busy ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing storybook…</>
          ) : (
            <><BookOpen className="h-4 w-4 mr-2" /> Publish Storybook</>
          )}
        </Button>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Output: interactive multi-chapter storybook · opens in the dedicated Book Viewer
        </p>
      </div>
    </div>
  );
};
