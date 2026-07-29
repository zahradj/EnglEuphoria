// Playground Lesson Builder — admin-only authoring surface for the
// scene-based Little Explorers lessons (src/content/playground-library).
// Same tool/style as the reference "Little Explorers Phonics" project's
// teacher.lesson-builder route: pick a scene kind to insert a skeleton,
// hand-edit the JSON, get live validation from the same sceneValidator
// used by the vitest suite, then copy a ready-to-paste TypeScript export.

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Plus } from 'lucide-react';
import {
  validateLesson,
  SCENE_KINDS,
  type ValidationResult,
} from '@/content/playground-library/unit1/sceneValidator';

const KIND_GROUPS: { label: string; kinds: string[] }[] = [
  { label: 'Framing', kinds: ['title-card', 'cinematic'] },
  { label: 'Meet cast', kinds: ['meet', 'meet-group', 'hello-doors', 'name-gate', 'voice-stage'] },
  { label: 'Phonics core', kinds: ['sound-model', 'echo', 'trace'] },
  { label: 'Discrimination', kinds: ['basket', 'sound-sort', 'sound-pop', 'dash', 'brick-crush'] },
  { label: 'Blending / spell', kinds: ['word-build', 'alphabet-blocks', 'alphabet-order'] },
  { label: 'Retrieval', kinds: ['memory', 'puzzle', 'friend-pop', 'who-said-it', 'gather'] },
  {
    label: 'Feelings & grammar',
    kinds: [
      'feelings', 'feelings-tap', 'feelings-wheel', 'feelings-dice', 'feelings-bingo',
      'x-is-feeling', 'i-am-feeling', 'feed-monsters', 'feeling-quiz',
      'he-she-model', 'he-she-sort', 'he-she-say',
    ],
  },
  { label: 'Speaking', kinds: ['roleplay', 'join-stage'] },
  { label: 'Song / finale', kinds: ['song', 'finale', 'color-friends'] },
];

const STARTER = `[
  { "id": "l7-01-title", "kind": "title-card", "bg": "bgMeadow", "level": "Pre-A1", "unit": "Unit 2", "lessonLabel": "Lesson 7", "title": "TODO title", "subtitle": "TODO subtitle" },
  { "id": "l7-02-meet-pip", "kind": "meet", "bg": "bgMeadow", "who": "pip", "teacher": "Say hi to Pip.", "line": "Hi, I'm Pip!" },
  { "id": "l7-03-finale", "kind": "finale", "bg": "bgMeadow", "who": "teacher", "line": "You did it!" }
]`;

export default function PlaygroundLessonBuilder() {
  const [lessonNumber, setLessonNumber] = useState('7');
  const [targetLetters, setTargetLetters] = useState('');
  const [targetVocab, setTargetVocab] = useState('');
  const [source, setSource] = useState(STARTER);

  const { parsed, parseError } = useMemo(() => {
    try {
      const arr = JSON.parse(source);
      if (!Array.isArray(arr)) return { parsed: null as unknown[] | null, parseError: 'Root must be an array.' };
      return { parsed: arr as unknown[], parseError: null as string | null };
    } catch (e) {
      return { parsed: null as unknown[] | null, parseError: (e as Error).message };
    }
  }, [source]);

  const result: ValidationResult | null = useMemo(() => {
    if (!parsed) return null;
    return validateLesson(parsed, {
      lessonNumber,
      targetLetters: targetLetters.split(',').map((s) => s.trim()).filter(Boolean),
      targetVocab: targetVocab.split(',').map((s) => s.trim()).filter(Boolean),
    });
  }, [parsed, lessonNumber, targetLetters, targetVocab]);

  const insertSkeleton = (kind: string) => {
    if (!parsed) {
      toast.error('Fix the JSON parse error first.');
      return;
    }
    const n = Number(lessonNumber) || 0;
    const skeleton = {
      id: `l${n}-${String(parsed.length + 1).padStart(2, '0')}-${kind}`,
      kind,
      bg: 'bgMeadow',
    };
    setSource(JSON.stringify([...parsed, skeleton], null, 2));
    toast.success(`Inserted "${kind}" skeleton`);
  };

  const copyExport = () => {
    if (!parsed) return;
    const ts = `export const LESSON_${lessonNumber}_SCENES: Scene[] = ${JSON.stringify(parsed, null, 2)};\n`;
    void navigator.clipboard.writeText(ts);
    toast.success('Copied TypeScript — remember to swap quoted "bg"/asset strings for real imports before pasting into scenes.ts.');
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Playground Lesson Builder</h1>
        <Badge variant="outline">Live-validated against sceneValidator.ts</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_340px]">
        {/* Left: scene picker */}
        <Card className="h-fit lg:sticky lg:top-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Insert scene</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {KIND_GROUPS.map((g) => {
              const available = g.kinds.filter((k) => (SCENE_KINDS as readonly string[]).includes(k));
              if (available.length === 0) return null;
              return (
                <div key={g.label}>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {g.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {available.map((k) => (
                      <button
                        key={k}
                        onClick={() => insertSkeleton(k)}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-primary/10 hover:border-primary/40 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <details className="pt-1 text-xs">
              <summary className="cursor-pointer text-muted-foreground">All kinds ({SCENE_KINDS.length})</summary>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {SCENE_KINDS.map((k) => (
                  <button
                    key={k}
                    onClick={() => insertSkeleton(k)}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px] hover:bg-primary/15"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </details>
          </CardContent>
        </Card>

        {/* Middle: editor */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="lesson-number" className="text-xs text-muted-foreground">Lesson #</Label>
                <Input
                  id="lesson-number"
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(e.target.value)}
                  className="w-24 h-8"
                />
              </div>
              <div className="flex-1 min-w-[160px] space-y-1">
                <Label htmlFor="target-letters" className="text-xs text-muted-foreground">Target letters (comma-separated)</Label>
                <Input id="target-letters" value={targetLetters} onChange={(e) => setTargetLetters(e.target.value)} className="h-8" placeholder="P" />
              </div>
              <div className="flex-1 min-w-[160px] space-y-1">
                <Label htmlFor="target-vocab" className="text-xs text-muted-foreground">Target vocab (comma-separated)</Label>
                <Input id="target-vocab" value={targetVocab} onChange={(e) => setTargetVocab(e.target.value)} className="h-8" placeholder="pig, pen, pear" />
              </div>
              <Button size="sm" onClick={copyExport} disabled={!parsed} className="gap-1.5">
                <Copy className="h-3.5 w-3.5" />
                Copy TypeScript
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              spellCheck={false}
              className="h-[65vh] w-full resize-none font-mono text-xs"
            />
          </CardContent>
        </Card>

        {/* Right: validation */}
        <Card className="h-fit lg:sticky lg:top-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {parseError ? (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 p-2 text-destructive">
                JSON error: {parseError}
              </div>
            ) : result ? (
              <>
                <div className={result.ok ? 'font-semibold text-emerald-600' : 'font-semibold text-destructive'}>
                  {result.ok ? '✓ All hard rules pass' : `✗ ${result.errors.length} error(s)`} · {result.warnings.length} warning(s) · {parsed?.length ?? 0} scenes
                </div>
                {result.errors.map((e, i) => (
                  <div key={`e${i}`} className="rounded bg-destructive/10 p-2 text-destructive">
                    <div className="font-mono">{e.code}</div>
                    <div>{e.message}</div>
                    {e.sceneId && <div className="opacity-70">{e.sceneId}</div>}
                  </div>
                ))}
                {result.warnings.map((w, i) => (
                  <div key={`w${i}`} className="rounded bg-amber-500/10 p-2 text-amber-700 dark:text-amber-400">
                    <div className="font-mono">{w.code}</div>
                    <div>{w.message}</div>
                    {w.sceneId && <div className="opacity-70">{w.sceneId}</div>}
                  </div>
                ))}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
