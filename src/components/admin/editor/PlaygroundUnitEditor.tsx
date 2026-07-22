import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sparkles, Loader2, Plus, Trash2,
  Image as ImageIcon, Volume2, Play,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  PlaygroundUnitContent,
  PlaygroundLessonContent,
  PlaygroundVocabMedia,
} from '@/playground-blueprint/types';

const PIP_VOICE_ID = 'kPtEHAvRnjUJFv7SK9WI';

interface Props {
  lessonId: string;
  title: string;
  cefr: string;
  value: PlaygroundUnitContent | undefined;
  onChange: (next: PlaygroundUnitContent) => void;
  grammarFocus?: string[];
  vocabFocus?: string[];
  communicationGoal?: string;
  reviewTargets?: string[];
}

type VocabLessonNumber = 1 | 2 | 3;

const emptyVocabLesson = (n: VocabLessonNumber): PlaygroundLessonContent => ({
  lesson_number: n,
  vocab: [],
  vocab_media: {},
  phonic: { letter: '', sound: '', words: [] },
});

export const PlaygroundUnitEditor: React.FC<Props> = ({
  lessonId,
  title,
  cefr,
  value,
  onChange,
  grammarFocus,
  vocabFocus,
  communicationGoal,
  reviewTargets,
}) => {
  const [aiBusy, setAiBusy] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const unit: PlaygroundUnitContent = value ?? {
    unit_topic: title || 'New Topic',
    lessons: [
      emptyVocabLesson(1),
      emptyVocabLesson(2),
      emptyVocabLesson(3),
      { lesson_number: 4, story: { title: '', scenes: [] } } as PlaygroundLessonContent,
    ],
  };

  const getLesson = (n: number) => unit.lessons.find((l) => l.lesson_number === n);
  const l4 = getLesson(4);


  const update = (patch: Partial<PlaygroundUnitContent>) => onChange({ ...unit, ...patch });
  const upsertLesson = (lesson: PlaygroundLessonContent) => {
    const others = unit.lessons.filter((l) => l.lesson_number !== lesson.lesson_number);
    update({
      lessons: [...others, lesson].sort((a, b) => a.lesson_number - b.lesson_number),
    });
  };

  // ---------- AI helpers ----------
  const generateImage = async (keyword: string, key: string): Promise<string | null> => {
    if (!keyword?.trim()) { toast.error('Add a word first'); return null; }
    setBusyKey(key);
    try {
      // P1 #9 — route Playground vocab images through the dedicated
      // generate-playground-images function so they inherit the Kiwi Chibi
      // style lock, Picsart cutout, and v2 cache folders. Never use the
      // generic ai-image-generation function for Playground content.
      const { generateOnePlaygroundImage } = await import('@/hooks/usePlaygroundImages');
      const url = await generateOnePlaygroundImage(keyword);
      if (!url) throw new Error('No image URL returned');
      toast.success(`🎨 Image for "${keyword}"`);
      return url;
    } catch (e: any) {
      toast.error(e?.message || 'Image generation failed');
      return null;
    } finally {
      setBusyKey(null);
    }
  };

  const generatePipAudio = async (text: string, key: string): Promise<string | null> => {
    if (!text?.trim()) { toast.error('Add text first'); return null; }
    setBusyKey(key);
    try {
      const { data, error } = await supabase.functions.invoke('generate-elevenlabs-audio', {
        body: { text, voiceId: PIP_VOICE_ID },
      });
      if (error) throw error;
      const blob = data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      try { await new Audio(url).play(); } catch { /* */ }
      toast.success('🦊 Pip recorded it');
      return url;
    } catch (e: any) {
      toast.error(e?.message || 'Audio generation failed');
      return null;
    } finally {
      setBusyKey(null);
    }
  };

  const generateWithAI = async () => {
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-playground', {
        body: {
          topic: title || unit.unit_topic,
          cefr: cefr || 'Pre-A1',
          lesson_kind: 'discovery',
          lesson_id: lessonId,
          grammar_focus: grammarFocus,
          vocab_focus: vocabFocus,
          communication_goal: communicationGoal,
          review_targets: reviewTargets,
        },
      });
      if (error) throw new Error(error.message);
      const payload = (data as any)?.lesson ?? (data as any);
      if (!payload?.lessons) throw new Error('Generator returned no unit');

      // P0 #4 — hard-validate the generated unit before accepting it.
      const { buildPlaygroundUnit } = await import('@/playground-blueprint/lessonBuilder').catch(() => { window.location.reload(); throw new Error('reloading'); });
      const { validatePlaygroundUnit } = await import('@/playground-blueprint/validator').catch(() => { window.location.reload(); throw new Error('reloading'); });
      let built;
      try {
        built = buildPlaygroundUnit(payload as PlaygroundUnitContent);
        const verdict = validatePlaygroundUnit(built);
        if (!verdict.ok) {
          const first = verdict.issues[0];
          toast.error(`Unit rejected: ${first.code} — ${first.message}`);
          console.error('[PlaygroundUnitEditor] validator issues:', verdict.issues);
          return;
        }
      } catch (vErr: any) {
        toast.error(`Unit build failed: ${vErr?.message || vErr}`);
        return;
      }

      // P1 #8 — attach a coherence-derived homework pack per vocab lesson.
      try {
        const { runCoherence } = await import('@/coherence');
        const { coherenceToPlaygroundHomework } = await import('@/playground-blueprint/homeworkBridge');
        const cefrLevel = (cefr || 'Pre-A1') as any;
        const withHomework = built.lessons.map((l) => {
          if (l.lesson_number > 3 || !l.vocab?.length) return l;
          // If the teacher already authored homework, pin it into the pack
          // instead of regenerating.
          const authored = l.homework?.tasks?.length
            ? {
                studentId: 'admin-editor',
                lessonId: `${lessonId}_L${l.lesson_number}`,
                hub: 'playground' as const,
                tasks: l.homework.tasks.map((t) => ({
                  id: t.id,
                  type: t.type,
                  label: t.label,
                  prompt: t.prompt,
                  minutes: t.minutes,
                })),
              }
            : undefined;
          const decision = runCoherence({
            hub: 'playground',
            cefr: cefrLevel,
            studentId: 'admin-editor',
            lessonId: `${lessonId}_L${l.lesson_number}`,
            lessonVocab: l.vocab,
            lessonGrammar: grammarFocus ?? [],
            pronunciationTargets: l.phonic?.sound ? [l.phonic.sound] : [],
            authoredHomework: authored,
          });
          return {
            ...l,
            homework: authored
              ? l.homework
              : coherenceToPlaygroundHomework({
                  pack: decision.homework,
                  lesson_number: l.lesson_number,
                }),
          };
        });
        onChange({ ...(payload as PlaygroundUnitContent), lessons: withHomework });
      } catch (hwErr: any) {
        console.warn('[PlaygroundUnitEditor] homework bridge failed:', hwErr);
        onChange(payload as PlaygroundUnitContent);
      }
      toast.success('✨ Playground unit generated');
    } catch (e: any) {
      if (String(e?.message || '').includes('402'))
        toast.error('Out of AI credits — add more in Workspace → Usage.');
      else toast.error(e?.message || 'AI generation failed');
    } finally {
      setAiBusy(false);
    }
  };

  // ---------- Vocab editor for L1/L2/L3 ----------
  const VocabLessonEditor: React.FC<{ n: VocabLessonNumber }> = ({ n }) => {
    const lesson = getLesson(n) ?? emptyVocabLesson(n);
    const words = lesson.vocab || [];
    const media = lesson.vocab_media || {};

    const writeWords = (next: string[], nextMedia?: Record<string, PlaygroundVocabMedia>) => {
      upsertLesson({
        ...lesson,
        lesson_number: n,
        vocab: next,
        vocab_media: nextMedia ?? media,
        phonic: lesson.phonic ?? { letter: '', sound: '', words: [] },
      });
    };

    const writeMedia = (word: string, patch: Partial<PlaygroundVocabMedia>) => {
      const nextMedia = { ...media, [word]: { ...(media[word] || {}), ...patch } };
      writeWords(words, nextMedia);
    };

    const setWord = (i: number, value: string) => {
      const oldWord = words[i];
      const next = [...words];
      next[i] = value;
      const nextMedia = { ...media };
      if (oldWord && oldWord !== value && nextMedia[oldWord]) {
        nextMedia[value] = nextMedia[oldWord];
        delete nextMedia[oldWord];
      }
      writeWords(next, nextMedia);
    };

    const addWord = () => writeWords([...words, '']);
    const removeWord = (i: number) => {
      const w = words[i];
      const next = words.filter((_, j) => j !== i);
      const nextMedia = { ...media };
      if (w) delete nextMedia[w];
      writeWords(next, nextMedia);
    };

    const generateAllImages = async () => {
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (!w || media[w]?.imageUrl) continue;
        const url = await generateImage(w, `${n}-bulk-img-${i}`);
        if (url) writeMedia(w, { imageUrl: url });
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            Vocabulary words ({words.length})
          </Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateAllImages}
              disabled={!!busyKey || words.length === 0}
              className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-300 text-violet-700"
            >
              {busyKey?.startsWith(`${n}-bulk-img`) ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4 mr-1" />
              )}
              Generate all images
            </Button>
            <Button variant="outline" size="sm" onClick={addWord}>
              <Plus className="h-4 w-4 mr-1" /> Add word
            </Button>
          </div>
        </div>

        {words.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            No words yet — click "Add word" or run "Generate with AI" at the top.
          </p>
        )}

        {words.map((w, i) => {
          const m = media[w] || {};
          return (
            <Card key={`${n}-${i}`} className="relative">
              <CardContent className="pt-4 flex gap-3">
                {m.imageUrl ? (
                  <img
                    src={m.imageUrl}
                    alt={w}
                    className="h-20 w-20 rounded-lg border object-cover bg-white"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground bg-muted/30">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <Input
                    value={w}
                    onChange={(e) => setWord(i, e.target.value)}
                    placeholder="e.g., cat"
                    className="text-lg font-semibold"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busyKey === `${n}-img-${i}`}
                      onClick={async () => {
                        const url = await generateImage(w, `${n}-img-${i}`);
                        if (url) writeMedia(w, { imageUrl: url });
                      }}
                    >
                      {busyKey === `${n}-img-${i}` ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <ImageIcon className="h-3 w-3 mr-1" />
                      )}
                      {m.imageUrl ? 'Regenerate image' : 'Generate image'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busyKey === `${n}-aud-${i}`}
                      onClick={async () => {
                        const url = await generatePipAudio(w, `${n}-aud-${i}`);
                        if (url) writeMedia(w, { audioUrl: url });
                      }}
                      className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300 text-orange-700"
                    >
                      {busyKey === `${n}-aud-${i}` ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Volume2 className="h-3 w-3 mr-1" />
                      )}
                      🦊 Pip voice
                    </Button>

                    {m.audioUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { try { new Audio(m.audioUrl!).play(); } catch { /* */ } }}
                      >
                        <Play className="h-3 w-3 mr-1" /> Preview
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeWord(i)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {/* Phonics for this lesson */}
        <div className="grid grid-cols-3 gap-3 border-t pt-3">
          <div>
            <Label className="text-xs">Phonic letter</Label>
            <Input
              maxLength={3}
              value={lesson.phonic?.letter || ''}
              onChange={(e) =>
                upsertLesson({
                  ...lesson,
                  lesson_number: n,
                  vocab: words,
                  vocab_media: media,
                  phonic: {
                    letter: e.target.value,
                    sound: lesson.phonic?.sound || '',
                    words: lesson.phonic?.words || [],
                  },
                })
              }
              placeholder="c"
            />
          </div>
          <div>
            <Label className="text-xs">Sound</Label>
            <Input
              value={lesson.phonic?.sound || ''}
              onChange={(e) =>
                upsertLesson({
                  ...lesson,
                  lesson_number: n,
                  vocab: words,
                  vocab_media: media,
                  phonic: {
                    letter: lesson.phonic?.letter || '',
                    sound: e.target.value,
                    words: lesson.phonic?.words || [],
                  },
                })
              }
              placeholder="/k/"
            />
          </div>
          <div>
            <Label className="text-xs">Phonic words (comma)</Label>
            <Input
              value={(lesson.phonic?.words || []).join(', ')}
              onChange={(e) =>
                upsertLesson({
                  ...lesson,
                  lesson_number: n,
                  vocab: words,
                  vocab_media: media,
                  phonic: {
                    letter: lesson.phonic?.letter || '',
                    sound: lesson.phonic?.sound || '',
                    words: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  },
                })
              }
              placeholder="cat, cow, car"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-orange-300/60 bg-gradient-to-br from-orange-50/40 to-yellow-50/40">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div>
          <CardTitle className="text-base">Playground Unit</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Locked 7-lesson template. Edit per lesson or regenerate with AI.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateWithAI}
          disabled={aiBusy}
          className="bg-gradient-to-br from-fuchsia-50 to-orange-50 border-fuchsia-300 text-fuchsia-700"
        >
          {aiBusy ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1" />
          )}
          Generate with AI
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Unit topic</Label>
          <Input
            value={unit.unit_topic}
            onChange={(e) => update({ unit_topic: e.target.value })}
            placeholder="e.g., Animal Adventure"
          />
        </div>

        <Tabs defaultValue="l1" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="l1">
              L1 <Badge variant="outline" className="ml-1 text-[10px]">vocab</Badge>
            </TabsTrigger>
            <TabsTrigger value="l2">
              L2 <Badge variant="outline" className="ml-1 text-[10px]">vocab</Badge>
            </TabsTrigger>
            <TabsTrigger value="l3">
              L3 <Badge variant="outline" className="ml-1 text-[10px]">vocab</Badge>
            </TabsTrigger>
            <TabsTrigger value="l4">
              L4 <Badge variant="outline" className="ml-1 text-[10px]">story</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="l1" className="pt-4">
            <VocabLessonEditor n={1} />
          </TabsContent>
          <TabsContent value="l2" className="pt-4">
            <VocabLessonEditor n={2} />
          </TabsContent>
          <TabsContent value="l3" className="pt-4">
            <VocabLessonEditor n={3} />
          </TabsContent>

          <TabsContent value="l4" className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Story (Lesson 4)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  upsertLesson({
                    lesson_number: 4,
                    story: {
                      title: l4?.story?.title || '',
                      scenes: [
                        ...(l4?.story?.scenes || []),
                        { id: `s${(l4?.story?.scenes?.length || 0) + 1}`, text: '' },
                      ],
                    },
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add scene
              </Button>
            </div>
            <Input
              className="mb-2"
              value={l4?.story?.title || ''}
              onChange={(e) =>
                upsertLesson({
                  lesson_number: 4,
                  story: { title: e.target.value, scenes: l4?.story?.scenes || [] },
                })
              }
              placeholder="Story title"
            />
            <div className="space-y-2">
              {(l4?.story?.scenes || []).map((scene, i) => (
                <div key={scene.id || i} className="flex gap-2 items-start">
                  <span className="text-xs text-muted-foreground mt-2 w-6">#{i + 1}</span>
                  <Textarea
                    rows={2}
                    value={scene.text}
                    onChange={(e) => {
                      const scenes = [...(l4?.story?.scenes || [])];
                      scenes[i] = { ...scenes[i], text: e.target.value };
                      upsertLesson({
                        lesson_number: 4,
                        story: { title: l4?.story?.title || '', scenes },
                      });
                    }}
                    placeholder="Scene text…"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const scenes = (l4?.story?.scenes || []).filter((_, j) => j !== i);
                      upsertLesson({
                        lesson_number: 4,
                        story: { title: l4?.story?.title || '', scenes },
                      });
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlaygroundUnitEditor;
