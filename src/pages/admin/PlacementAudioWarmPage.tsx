// Placement Studio — Content Creator surface for the live placement tests of
// ALL hubs (Playground / Academy / Success). Same editing pipeline for each:
// edit text, regenerate images via Gemini, generate voices via ElevenLabs,
// save to public.placement_content. Live tests pick up changes immediately.

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Loader2, Volume2, ImageIcon, Save, RotateCcw, Play, Sparkles, CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  HUB_DEFAULTS,
  HUB_LABELS,
  loadHubPlacementContent,
  saveHubPlacementContent,
  resetHubContentCache,
  type HubKey,
  type HubPlacementContent,
} from '@/placement/hubContent';
import { listCastForHub } from '@/services/castVault';
import type { CastVaultCharacter } from '@/storybook/types';

type BusyKey = string | null;

// Curated ElevenLabs voice library for the Pip/placement companion.
// Mix of cartoony, warm, and professional voices so each hub can pick a fit.
const VOICE_LIBRARY: { id: string; name: string; description: string }[] = [
  { id: 'kPtEHAvRnjUJFv7SK9WI', name: 'Glitch', description: 'Cartoony fox — default Pip (Playground)' },
  { id: 'e79twtVS2278lVZZQiAD', name: 'The Elf', description: 'Playful, whimsical kid-friendly' },
  { id: 'h6u4tPKmcPlxUdZOaVpH', name: 'The Reindeer', description: 'Warm storyteller for young learners' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', description: 'Clear British female — Academy default' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Soft warm female' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Friendly professional female — Success default' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Bright, confident female' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'Warm American female' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', description: 'Conversational young female' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Warm British male — Academy alt' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Casual Australian male' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Authoritative British male' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Articulate young male' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', description: 'Friendly American male' },
];

async function generateAsset(payload: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.functions.invoke('placement-content-asset', {
    body: payload,
  });
  if (error) throw error;
  const url = (data as any)?.url;
  if (!url) throw new Error('No URL returned');
  return url as string;
}

function playUrl(url: string) {
  const a = new Audio(url);
  a.play().catch((e) => toast.error(`Audio playback failed: ${e?.message ?? e}`));
}

const HUBS: HubKey[] = ['playground', 'academy', 'success'];

export default function PlacementAudioWarmPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Placement Studio</h1>
        <p className="text-sm text-muted-foreground">
          Edit, voice, and regenerate every screen of the placement tests across hubs.
        </p>
      </div>
      <Tabs defaultValue="playground" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          {HUBS.map((h) => (
            <TabsTrigger key={h} value={h}>{HUB_LABELS[h]}</TabsTrigger>
          ))}
        </TabsList>
        {HUBS.map((h) => (
          <TabsContent key={h} value={h} className="mt-6">
            <HubEditor hub={h} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function HubEditor({ hub }: { hub: HubKey }) {
  const [content, setContent] = useState<HubPlacementContent | null>(null);
  const [busy, setBusy] = useState<BusyKey>(null);
  const [saving, setSaving] = useState(false);
  const [cast, setCast] = useState<CastVaultCharacter[]>([]);

  useEffect(() => {
    setContent(null);
    loadHubPlacementContent(hub).then(setContent);
    listCastForHub(hub, { includeShared: true })
      .then(setCast)
      .catch(() => setCast([]));
  }, [hub]);

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const update = (mut: (draft: HubPlacementContent) => void) => {
    const draft = structuredClone(content);
    mut(draft);
    setContent(draft);
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveHubPlacementContent(hub, content);
      resetHubContentCache(hub);
      toast.success(`${HUB_LABELS[hub]} saved. Live test updated.`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    if (!confirm(`Reset ${HUB_LABELS[hub]} to defaults? Unsaved edits will be lost.`)) return;
    setContent(structuredClone(HUB_DEFAULTS[hub]));
  };

  const regenVoice = async (key: string, text: string) => {
    setBusy(key);
    try {
      return await generateAsset({ kind: 'voice', text, voiceId: content.pip.voiceId, key });
    } catch (e: any) {
      toast.error(e?.message ?? 'Voice failed'); return null;
    } finally { setBusy(null); }
  };

  const regenImage = async (key: string, prompt: string) => {
    setBusy(key);
    try {
      return await generateAsset({ kind: 'image', prompt, key, hub });
    } catch (e: any) {
      toast.error(e?.message ?? 'Image failed'); return null;
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={resetDefaults} disabled={saving || !!busy}>
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
        <Button onClick={save} disabled={saving || !!busy}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save
        </Button>
      </div>

      {/* Voice companion */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Voice companion</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Companion voice</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={
                VOICE_LIBRARY.some((v) => v.id === content.pip.voiceId)
                  ? content.pip.voiceId
                  : '__custom__'
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__custom__') return;
                update((d) => {
                  d.pip.voiceId = v;
                  // Invalidate cached audio so user regenerates with new voice.
                  d.pip.introAudioUrl = undefined;
                  d.sections.forEach((s) =>
                    s.questions.forEach((q) => { q.audioUrl = undefined; }),
                  );
                });
              }}
            >
              {VOICE_LIBRARY.map((v) => (
                <option key={v.id} value={v.id}>{v.name} — {v.description}</option>
              ))}
              {!VOICE_LIBRARY.some((v) => v.id === content.pip.voiceId) && (
                <option value="__custom__">Custom: {content.pip.voiceId}</option>
              )}
            </select>
            <div className="flex gap-2 mt-2">
              <Input
                className="h-8 text-xs font-mono"
                placeholder="Or paste an ElevenLabs voice ID"
                value={content.pip.voiceId}
                onChange={(e) => update((d) => { d.pip.voiceId = e.target.value; })}
              />
              <Button
                size="sm" variant="secondary"
                disabled={busy === 'voice-preview'}
                onClick={async () => {
                  setBusy('voice-preview');
                  try {
                    const url = await generateAsset({
                      kind: 'voice',
                      text: content.pip.intro || `Hi, I'm ${content.pip.label}!`,
                      voiceId: content.pip.voiceId,
                      key: `preview-${content.pip.voiceId}-${Date.now()}`,
                    });
                    playUrl(url);
                  } catch (e: any) {
                    toast.error(e?.message ?? 'Preview failed');
                  } finally { setBusy(null); }
                }}
              >
                {busy === 'voice-preview' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          <div>
            <Label>Companion label</Label>
            <Input value={content.pip.label}
              onChange={(e) => update((d) => { d.pip.label = e.target.value; })} />
            <p className="text-xs text-muted-foreground mt-2">
              Changing the voice clears cached audio — regenerate the welcome line and any
              question voice-overs to hear the new companion.
            </p>
          </div>
        </div>

        {/* Cast Vault picker — choose a recurring character as the companion */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <Label className="text-sm font-semibold">Pick from Cast Vault</Label>
              <p className="text-xs text-muted-foreground">
                Use any {HUB_LABELS[hub]} character — its name, avatar, and voice will become the companion.
              </p>
            </div>
            {content.pip.avatarUrl && (
              <Button size="sm" variant="ghost"
                onClick={() => update((d) => { d.pip.avatarUrl = null; d.pip.characterId = null; })}>
                Clear avatar
              </Button>
            )}
          </div>
          {cast.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No Cast Vault characters for {HUB_LABELS[hub]} yet. Create one in the Cast Vault to use it here.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {cast.map((c) => {
                const picked = content.pip.characterId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => update((d) => {
                      d.pip.characterId = c.id;
                      d.pip.label = c.name;
                      d.pip.avatarUrl = c.avatar_url ?? null;
                      if (c.voice_id) {
                        d.pip.voiceId = c.voice_id;
                        d.pip.introAudioUrl = undefined;
                        d.sections.forEach((s) =>
                          s.questions.forEach((q) => { q.audioUrl = undefined; }),
                        );
                      }
                    })}
                    className={`rounded-lg border p-2 text-left bg-background transition-all hover:shadow-md ${
                      picked ? 'border-primary ring-2 ring-primary' : 'border-border'
                    }`}
                  >
                    <div className="aspect-square mb-1 rounded bg-muted/40 overflow-hidden flex items-center justify-center">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-xs font-medium truncate">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{c.role}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <Label>Welcome line</Label>
          <Textarea rows={2} value={content.pip.intro}
            onChange={(e) => update((d) => { d.pip.intro = e.target.value; })} />
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="secondary" disabled={busy === 'intro'}
              onClick={async () => {
                const url = await regenVoice('intro', content.pip.intro);
                if (url) update((d) => { d.pip.introAudioUrl = url; });
              }}>
              {busy === 'intro' ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Volume2 className="w-3 h-3 mr-2" />}
              Generate voice
            </Button>
            {content.pip.introAudioUrl && (
              <>
                <Button size="sm" variant="ghost" onClick={() => playUrl(content.pip.introAudioUrl!)}>
                  <Play className="w-3 h-3 mr-1" /> Play
                </Button>
                <span className="text-xs text-muted-foreground self-center inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> cached
                </span>
              </>
            )}
          </div>
        </div>
        <div>
          <Label>Encouragements (one per line)</Label>
          <Textarea rows={3} value={content.pip.encouragements.join('\n')}
            onChange={(e) => update((d) => {
              d.pip.encouragements = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
            })} />
        </div>
      </Card>

      {/* Front page */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Front page</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Title</Label><Input value={content.frontPage.title}
            onChange={(e) => update((d) => { d.frontPage.title = e.target.value; })} /></div>
          <div><Label>Subtitle</Label><Input value={content.frontPage.subtitle}
            onChange={(e) => update((d) => { d.frontPage.subtitle = e.target.value; })} /></div>
          <div><Label>Primary CTA</Label><Input value={content.frontPage.ctaPrimary}
            onChange={(e) => update((d) => { d.frontPage.ctaPrimary = e.target.value; })} /></div>
          <div><Label>Beginner CTA</Label><Input value={content.frontPage.ctaBeginner}
            onChange={(e) => update((d) => { d.frontPage.ctaBeginner = e.target.value; })} /></div>
        </div>
        <div>
          <Label>Chips (comma-separated)</Label>
          <Input value={content.frontPage.chips.join(', ')}
            onChange={(e) => update((d) => {
              d.frontPage.chips = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
            })} />
        </div>
      </Card>

      {/* Sections */}
      {content.sections.map((section, sIdx) => (
        <Card key={section.id} className="p-6 space-y-5">
          <div>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="text-xs text-muted-foreground">{section.id}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Section title</Label><Input value={section.cardTitle}
              onChange={(e) => update((d) => { d.sections[sIdx].cardTitle = e.target.value; })} /></div>
            <div><Label>Section body</Label><Input value={section.cardBody}
              onChange={(e) => update((d) => { d.sections[sIdx].cardBody = e.target.value; })} /></div>
          </div>

          {section.questions.map((q, qIdx) => (
            <div key={q.id} className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono bg-background px-2 py-0.5 rounded">{q.id}</span>
                <span>Target: {q.targetLevel}</span>
                <span>Difficulty: {q.difficulty}</span>
                {q.listening && <span className="text-primary font-semibold">listening</span>}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Question prompt (shown)</Label><Input value={q.prompt}
                  onChange={(e) => update((d) => { d.sections[sIdx].questions[qIdx].prompt = e.target.value; })} /></div>
                <div><Label>Voice line</Label><Input value={q.audioPrompt}
                  onChange={(e) => update((d) => { d.sections[sIdx].questions[qIdx].audioPrompt = e.target.value; })} /></div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="secondary" disabled={busy === `q-${q.id}-voice`}
                  onClick={async () => {
                    const url = await regenVoice(`q-${q.id}-voice`, q.audioPrompt);
                    if (url) update((d) => { d.sections[sIdx].questions[qIdx].audioUrl = url; });
                  }}>
                  {busy === `q-${q.id}-voice` ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Volume2 className="w-3 h-3 mr-2" />}
                  Generate voice
                </Button>
                {q.audioUrl && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => playUrl(q.audioUrl!)}>
                      <Play className="w-3 h-3 mr-1" /> Play
                    </Button>
                    <span className="text-xs text-muted-foreground self-center inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-primary" /> cached
                    </span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = oIdx === q.correctIndex;
                  const key = `q-${q.id}-img-${oIdx}`;
                  return (
                    <div key={oIdx}
                      className={`rounded-lg p-2 bg-background border ${isCorrect ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                      <div className="aspect-square mb-2 rounded bg-muted/40 overflow-hidden flex items-center justify-center">
                        {opt.image ? (
                          <img src={opt.image} alt={opt.label} className="w-full h-full object-contain p-1" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <Input className="h-8 text-xs" value={opt.label}
                        onChange={(e) => update((d) => { d.sections[sIdx].questions[qIdx].options[oIdx].label = e.target.value; })} />
                      <Input className="h-8 text-[10px] mt-1" placeholder="image prompt"
                        value={opt.imagePrompt ?? ''}
                        onChange={(e) => update((d) => { d.sections[sIdx].questions[qIdx].options[oIdx].imagePrompt = e.target.value; })} />
                      <div className="flex gap-1 mt-2 flex-wrap">
                        <Button size="sm" variant="secondary" className="h-7 px-2 text-[11px]"
                          disabled={busy === key || !opt.imagePrompt}
                          onClick={async () => {
                            const url = await regenImage(key, opt.imagePrompt!);
                            if (url) update((d) => { d.sections[sIdx].questions[qIdx].options[oIdx].image = url; });
                          }}>
                          {busy === key ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                          Regenerate
                        </Button>
                        <Button size="sm" variant={isCorrect ? 'default' : 'ghost'} className="h-7 px-2 text-[11px]"
                          onClick={() => update((d) => { d.sections[sIdx].questions[qIdx].correctIndex = oIdx; })}>
                          {isCorrect ? '✓ Correct' : 'Mark correct'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving || !!busy} size="lg">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save all changes
        </Button>
      </div>
    </div>
  );
}
