import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Sparkles, Save, Trash2, Wand2, Users, ImageIcon, Volume2, Play, Square, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/integrations/supabase/client';
import { extractEdgeError } from '@/lib/extractEdgeError';
import {
  listCharactersForHub,
  saveCharacter,
  deleteCharacter,
} from '@/services/characterService';
import type { CharacterHub, CustomCharacter } from '@/types/character';
import { VOICES_BY_HUB, findVoiceById, pickVoiceForCharacter } from '@/constants/characterVoices';
import { PLAYGROUND_CAST_PRESETS } from '@/constants/playgroundCastPresets';

const HUB_LABEL: Record<CharacterHub, string> = {
  playground: 'Playground (Kids)',
  academy: 'Academy (Teens)',
  success: 'Success (Adults)',
};

const HUB_ACCENT: Record<CharacterHub, string> = {
  playground: 'from-orange-500 to-amber-500',
  academy: 'from-indigo-500 to-purple-600',
  success: 'from-emerald-500 to-teal-600',
};

const HUB_PREVIEW_LINE: Record<CharacterHub, string> = {
  playground: "Hi friend! I'm so excited to learn new words with you today!",
  academy: "Hey! Ready to level up your English? Let's make this lesson actually fun.",
  success: "Welcome. Today we'll sharpen the language you need to lead the room with confidence.",
};

interface SuggestedCharacter {
  name: string;
  personality_traits: string;
  visual_blueprint: string;
  suggested_voice?: string;
}

const emptyForm = (hub: CharacterHub) => ({
  id: undefined as string | undefined,
  name: '',
  hub,
  personality_traits: '',
  visual_blueprint: '',
  avatar_url: '' as string,
  voice_id: '' as string,
  voice_name: '' as string,
});

type ArtStyle = 'animated' | 'realistic' | 'semi-realistic' | 'anime' | '3d';

const ART_STYLE_OPTIONS: { id: ArtStyle; label: string; hint: string }[] = [
  { id: 'animated', label: '🎨 Animated / Cartoon', hint: 'Bright illustrated cartoon — great for Playground & Academy' },
  { id: 'realistic', label: '📷 Realistic Photo', hint: 'Photorealistic editorial portrait — best for Success' },
  { id: 'semi-realistic', label: '🎬 Semi-Realistic', hint: 'Painterly concept-art look — sits between cartoon & photo' },
  { id: 'anime', label: '🗡 Anime / Manga', hint: 'Cel-shaded anime style — great for Academy' },
  { id: '3d', label: '🧊 3D Render', hint: 'Pixar-style 3D character render' },
];

const DEFAULT_ART_STYLE_BY_HUB: Record<CharacterHub, ArtStyle> = {
  playground: 'animated',
  academy: 'animated',
  success: 'realistic',
};

export const CharacterCreator: React.FC = () => {
  const [hub, setHub] = useState<CharacterHub>('academy');
  const [list, setList] = useState<CustomCharacter[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [form, setForm] = useState(emptyForm('academy'));
  const [artStyle, setArtStyle] = useState<ArtStyle>(DEFAULT_ART_STYLE_BY_HUB.academy);
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  // AI suggestions
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedCharacter[]>([]);

  // Voice preview
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [seedingPlayground, setSeedingPlayground] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voiceOptions = useMemo(() => VOICES_BY_HUB[hub], [hub]);

  const refresh = async (h: CharacterHub) => {
    setLoadingList(true);
    try {
      setList(await listCharactersForHub(h));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load characters');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    refresh(hub);
    setForm((f) => ({ ...f, hub }));
    setSuggestions([]);
    setArtStyle(DEFAULT_ART_STYLE_BY_HUB[hub]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hub]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const resetForm = () => setForm(emptyForm(hub));
  const loadIntoForm = (c: CustomCharacter) =>
    setForm({
      id: c.id,
      name: c.name,
      hub: c.hub,
      personality_traits: c.personality_traits,
      visual_blueprint: c.visual_blueprint,
      avatar_url: c.avatar_url ?? '',
      voice_id: c.voice_id ?? '',
      voice_name: c.voice_name ?? '',
    });

  const handleGenerateAvatar = async () => {
    if (!form.visual_blueprint.trim()) {
      toast.error('Add a visual description first.');
      return;
    }
    setGeneratingAvatar(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-character-image', {
        body: {
          characterName: form.name || 'Unnamed character',
          characterDescription: `${form.visual_blueprint}. Hub: ${form.hub}.`,
          artStyle,
        },
      });
      if (error) throw error;
      const imageUrl = (data as any)?.imageUrl;
      if (!imageUrl) throw new Error('Character image generator returned no image.');
      setForm((f) => ({ ...f, avatar_url: imageUrl }));
      toast.success('Avatar generated ✓');
    } catch (e: any) {
      toast.error(await extractEdgeError({ error: e, fallback: 'Avatar generation failed' }));
    } finally {
      setGeneratingAvatar(false);
    }
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const existingNames = list.map((c) => c.name);
      const { data, error } = await supabase.functions.invoke('suggest-characters', {
        body: { hub, count: 2, existingNames },
      });
      if (error) throw error;
      const chars = (data as any)?.characters as SuggestedCharacter[] | undefined;
      if (!chars || chars.length === 0) throw new Error('AI returned no suggestions');
      setSuggestions(chars);
      if ((data as any)?.warning) toast.message((data as any).warning);
      toast.success(`AI cast suggestions ready (${chars.length}) ✨`);
    } catch (e: any) {
      toast.error(await extractEdgeError({ error: e, fallback: 'Suggestion failed' }));
    } finally {
      setSuggesting(false);
    }
  };

  const useSuggestion = (s: SuggestedCharacter) => {
    const auto = pickVoiceForCharacter(hub, {
      name: s.name,
      personality: s.personality_traits,
      visual: s.visual_blueprint,
    });
    setForm((f) => ({
      ...f,
      id: undefined,
      name: s.name,
      hub,
      personality_traits: s.personality_traits,
      visual_blueprint: s.visual_blueprint,
      avatar_url: '',
      voice_id: auto.id,
      voice_name: auto.label,
    }));
    toast.message(`Loaded "${s.name}" — voice auto-set to ${auto.label}. Generate an avatar next.`);
  };

  const handleAutoPickVoice = () => {
    const auto = pickVoiceForCharacter(form.hub, {
      name: form.name,
      personality: form.personality_traits,
      visual: form.visual_blueprint,
    });
    setForm((f) => ({ ...f, voice_id: auto.id, voice_name: auto.label }));
    toast.success(`Auto-assigned ${auto.label}`);
  };

  const handlePreviewVoice = async (voiceId: string) => {
    if (!voiceId) return;
    // Stop existing playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (previewingVoice === voiceId) {
      setPreviewingVoice(null);
      return;
    }
    // Create the Audio element synchronously inside the click gesture so
    // browsers don't block playback after the awaited fetch resolves.
    const audio = new Audio();
    audioRef.current = audio;
    setPreviewingVoice(voiceId);
    try {
      const sampleLine = HUB_PREVIEW_LINE[hub];
      const text = form.name
        ? `Hi, I'm ${form.name}. ${sampleLine}`
        : sampleLine;
      // IMPORTANT: do NOT use supabase.functions.invoke for binary audio —
      // it tries to parse the response and corrupts the MP3 bytes. Hit the
      // edge function directly with fetch and read the blob.
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      const url = `${supabaseUrl}/functions/v1/elevenlabs-tts`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text, voiceId }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `TTS failed (${res.status})`);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      audio.src = objectUrl;
      audio.onended = () => {
        setPreviewingVoice(null);
        URL.revokeObjectURL(objectUrl);
      };
      await audio.play();
    } catch (e: any) {
      setPreviewingVoice(null);
      toast.error(e?.message || 'Voice preview failed (check ElevenLabs key)');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Give your character a name.');
    if (!form.visual_blueprint.trim()) return toast.error('Add a visual description.');
    setSaving(true);
    try {
      // Auto-assign a hub-appropriate voice if none picked
      let voiceId = form.voice_id;
      let voiceName = form.voice_name;
      if (!voiceId) {
        const auto = pickVoiceForCharacter(form.hub, {
          name: form.name,
          personality: form.personality_traits,
          visual: form.visual_blueprint,
        });
        voiceId = auto.id;
        voiceName = auto.label;
      }
      const saved = await saveCharacter({
        id: form.id,
        name: form.name,
        hub: form.hub,
        personality_traits: form.personality_traits,
        visual_blueprint: form.visual_blueprint,
        avatar_url: form.avatar_url || null,
        voice_id: voiceId || null,
        voice_name: voiceName || null,
      });
      toast.success(`Saved "${saved.name}" — voice: ${voiceName} ✨`);
      resetForm();
      await refresh(hub);
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedPlaygroundCast = async () => {
    setSeedingPlayground(true);
    let created = 0;
    try {
      const existingNames = new Set(list.map((c) => c.name.toLowerCase().trim()));
      for (const preset of PLAYGROUND_CAST_PRESETS) {
        if (existingNames.has(preset.name.toLowerCase().trim())) continue;
        // Generate avatar (best-effort; skip on failure so we still save the character)
        let avatarUrl: string | null = null;
        try {
          const { data, error } = await supabase.functions.invoke('generate-character-image', {
            body: {
              characterName: preset.name,
              characterDescription: `${preset.image_prompt} Hub: playground.`,
              artStyle: 'animated',
            },
          });
          if (!error) avatarUrl = (data as any)?.imageUrl ?? null;
        } catch { /* avatar best-effort */ }

        await saveCharacter({
          name: preset.name,
          hub: 'playground',
          personality_traits: preset.personality_traits,
          visual_blueprint: preset.visual_blueprint,
          avatar_url: avatarUrl,
          voice_id: preset.voice_id,
          voice_name: preset.voice_name,
        });
        created += 1;
      }
      await refresh('playground');
      if (created === 0) toast.message('All Playground mascots already exist in the Vault.');
      else toast.success(`🦊 Added ${created} Playground mascot${created === 1 ? '' : 's'} to the Vault`);
    } catch (e: any) {
      toast.error(await extractEdgeError({ error: e, fallback: 'Could not seed Playground cast' }));
    } finally {
      setSeedingPlayground(false);
    }
  };

  const handleDelete = async (c: CustomCharacter) => {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    try {
      await deleteCharacter(c.id);
      toast.success('Character removed');
      if (form.id === c.id) resetForm();
      await refresh(hub);
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className={cn('h-10 w-10 rounded-xl text-white grid place-items-center bg-gradient-to-br', HUB_ACCENT[hub])}>
          <Users className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Cast Vault — Character Creator</h1>
          <p className="text-sm text-muted-foreground">Design re-usable characters, give them a voice, and inject them into AI-generated lessons & stories.</p>
        </div>
        <div className="w-56">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Hub</Label>
          <Select value={hub} onValueChange={(v) => setHub(v as CharacterHub)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(HUB_LABEL) as CharacterHub[]).map((h) => (
                <SelectItem key={h} value={h}>{HUB_LABEL[h]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Suggestions */}
      <Card className={cn('p-5 border-0 text-white bg-gradient-to-br', HUB_ACCENT[hub])}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg">
              <Sparkles className="h-5 w-5" /> AI Cast Director — {HUB_LABEL[hub]}
            </div>
            <p className="text-sm opacity-90 mt-0.5">
              Get 1–2 brand-new character ideas tuned for this hub's age, tone & art style.
            </p>
          </div>
          <Button onClick={handleSuggest} disabled={suggesting} variant="secondary" className="bg-white/95 hover:bg-white text-slate-900">
            {suggesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Suggest 1–2 new characters
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {suggestions.map((s, i) => (
              <Card key={i} className="p-3 text-foreground bg-white/95 space-y-2">
                <div className="font-bold">{s.name}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-4">{s.personality_traits}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-3 italic">{s.visual_blueprint}</div>
                <Button size="sm" className={cn('w-full text-white bg-gradient-to-r', HUB_ACCENT[hub])} onClick={() => useSuggestion(s)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Use this
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Playground Mascot Quick-Seed */}
      {hub === 'playground' && (
        <Card className="p-5 border-orange-300/60 bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg text-orange-900">
                🦊 Playground Mascots — Quick Cast
              </div>
              <p className="text-sm text-orange-900/70 mt-0.5">
                One click adds Pip the Fox and friends to the Vault — each with a Playground-tuned voice pre-pinned and an avatar generated.
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {PLAYGROUND_CAST_PRESETS.map((p) => (
                  <Badge key={p.name} variant="outline" className="bg-white/70 border-orange-300 text-orange-900 text-[10px]">
                    {p.name} · {p.voice_name.split(' — ')[0]}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              onClick={handleSeedPlaygroundCast}
              disabled={seedingPlayground}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
            >
              {seedingPlayground ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Playground Mascots
            </Button>
          </div>
        </Card>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Form */}
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mia the Inventor"
              />
            </div>
            <div>
              <Label>Target Hub</Label>
              <Select value={form.hub} onValueChange={(v) => setForm({ ...form, hub: v as CharacterHub })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(HUB_LABEL) as CharacterHub[]).map((h) => (
                    <SelectItem key={h} value={h}>{HUB_LABEL[h]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Personality</Label>
            <Textarea
              rows={2}
              value={form.personality_traits}
              onChange={(e) => setForm({ ...form, personality_traits: e.target.value })}
              placeholder="e.g. Brave but clumsy, loves animals, asks lots of questions."
            />
          </div>

          <div>
            <Label>Visual Description</Label>
            <Textarea
              rows={3}
              value={form.visual_blueprint}
              onChange={(e) => setForm({ ...form, visual_blueprint: e.target.value })}
              placeholder="e.g. A teenager with spiky red hair, freckles, round glasses, and a green bomber jacket."
            />
            <p className="text-xs text-muted-foreground mt-1">Used as the visual blueprint for every AI-generated image starring this character.</p>
          </div>

          {/* Voice picker */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label className="m-0">Character Voice</Label>
              {form.voice_name && <Badge variant="secondary" className="text-[10px]">{form.voice_name}</Badge>}
            </div>
            <div className="flex gap-2">
              <Select
                value={form.voice_id || undefined}
                onValueChange={(v) => {
                  const voice = voiceOptions.find((o) => o.id === v);
                  setForm({ ...form, voice_id: v, voice_name: voice?.label ?? '' });
                }}
              >
                <SelectTrigger className="flex-1"><SelectValue placeholder="Pick a voice for this character" /></SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="font-medium">{v.label}</span>
                      <span className="text-muted-foreground"> — {v.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="secondary"
                disabled={!form.voice_id}
                onClick={() => form.voice_id && handlePreviewVoice(form.voice_id)}
              >
                {previewingVoice === form.voice_id ? (
                  <><Square className="h-4 w-4 mr-2" /> Stop</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Preview</>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleAutoPickVoice} title="Auto-pick a voice from this hub based on personality">
                <Wand2 className="h-4 w-4 mr-2" /> Auto
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-matched to the hub: Playground gets childish cartoon voices, Academy peer-like teen voices, Success polished adult voices. Pinned to this character so every narration & storybook page uses the same voice.
            </p>
          </div>

          {/* Art style picker */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <Label className="m-0">Image Art Style</Label>
              <Badge variant="secondary" className="text-[10px]">{ART_STYLE_OPTIONS.find(s => s.id === artStyle)?.label}</Badge>
            </div>
            <Select value={artStyle} onValueChange={(v) => setArtStyle(v as ArtStyle)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ART_STYLE_OPTIONS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground"> — {s.hint}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Pick <strong>Realistic</strong> for photo-like portraits or <strong>Animated</strong> for cartoon characters. Default follows the hub (Playground/Academy → Animated, Success → Realistic).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerateAvatar} disabled={generatingAvatar} variant="secondary">
              {generatingAvatar ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Generate {ART_STYLE_OPTIONS.find(s => s.id === artStyle)?.label.replace(/^[^ ]+\s/, '') || 'Avatar'}
            </Button>
            <Button onClick={handleSave} disabled={saving} className={cn('text-white bg-gradient-to-r', HUB_ACCENT[form.hub])}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {form.id ? 'Update Character' : 'Save Character to Vault'}
            </Button>
            {form.id && (
              <Button variant="ghost" onClick={resetForm}>New Character</Button>
            )}
          </div>
        </Card>

        {/* Avatar preview */}
        <Card className="p-5 flex flex-col items-center justify-center text-center space-y-3 min-h-[280px]">
          <div className="h-40 w-40 rounded-2xl border bg-muted overflow-hidden grid place-items-center">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt={form.name || 'character avatar'} className="h-full w-full object-cover" />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-1">
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs">No avatar yet</span>
              </div>
            )}
          </div>
          <div className="font-bold">{form.name || 'Unnamed character'}</div>
          <div className="text-xs text-muted-foreground line-clamp-3">{form.personality_traits || '—'}</div>
          {form.voice_name && (
            <div className="text-[11px] inline-flex items-center gap-1 text-muted-foreground">
              <Volume2 className="h-3 w-3" /> {form.voice_name}
            </div>
          )}
        </Card>
      </div>

      {/* Vault */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Cast Vault — {HUB_LABEL[hub]}</h2>
          <span className="text-xs text-muted-foreground">{list.length} character{list.length === 1 ? '' : 's'}</span>
        </div>

        {loadingList ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : list.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Sparkles className="h-6 w-6 mx-auto mb-2 opacity-60" />
            No characters yet for this hub. Try the AI Cast Director above or create one manually.
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((c) => {
              const voice = findVoiceById(c.voice_id);
              return (
                <Card key={c.id} className="p-3 space-y-2">
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-muted grid place-items-center">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt={c.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="font-bold truncate">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2 min-h-[28px]">{c.personality_traits || '—'}</div>
                  {(voice || c.voice_name) && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Volume2 className="h-3 w-3" /> <span className="truncate">{voice?.label || c.voice_name}</span>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => loadIntoForm(c)}>Edit</Button>
                    {c.voice_id && (
                      <Button size="sm" variant="ghost" onClick={() => handlePreviewVoice(c.voice_id!)} aria-label="Preview voice">
                        {previewingVoice === c.voice_id ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(c)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterCreator;
