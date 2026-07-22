import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Image as ImageIcon, Mic, Music, Video, Layers, Sparkles, Loader2, Upload, Plus, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  generateSlideImage,
  generateSlideVoiceover,
  generateSlideMusic,
} from '@/components/creator-studio/steps/slide-studio/mediaGeneration';
import { uploadSlideAsset } from '@/components/creator-studio/steps/slide-studio/uploadSlideAsset';
import {
  IMAGE_STYLES_BY_HUB,
  DEFAULT_IMAGE_STYLE_ID,
  getImageStyle,
} from '@/components/creator-studio/shared/imageStyleOptions';

/**
 * Shared AI media editor used by Playground + Academy creators.
 * Operates on a generic slide object via an `onPatch` callback so the parent's
 * existing state reducer is the single source of truth.
 */

export interface SlideMediaPanelProps {
  slide: any;
  onPatch: (patch: Record<string, any>) => void;
  hub: 'playground' | 'academy' | 'success';
  lessonId: string | null;
  slideId: string;
  /** Set true when the current slide type supports flashcard editing. */
  enableFlashcards?: boolean;
}

const VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah · warm female' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily · friendly young' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', label: 'George · narrator male' },
  { id: 'IKne3meq5aSn9XLyUdCD', label: 'Charlie · upbeat male' },
];

// Canonical per-hub style catalog (single source of truth).
// Playground = 🥝 Kiwi (default), Academy = 🗡 Manga Comic (default), Success = 📷 Realistic (default).
// We adapt the shared catalog to this panel's { id, label, modifier } shape so the
// existing UI code keeps working without any other changes.
const IMAGE_STYLES: Record<'playground' | 'academy' | 'success', { id: string; label: string; modifier: string }[]> =
  (Object.fromEntries(
    (Object.keys(IMAGE_STYLES_BY_HUB) as Array<'playground' | 'academy' | 'success'>).map((hub) => [
      hub,
      IMAGE_STYLES_BY_HUB[hub].map((opt) => ({
        id: opt.id,
        label: opt.label,
        modifier: opt.promptSuffix,
      })),
    ]),
  ) as Record<'playground' | 'academy' | 'success', { id: string; label: string; modifier: string }[]>);

function YoutubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  return m ? m[1] : null;
}

export const SlideMediaPanel: React.FC<SlideMediaPanelProps> = ({
  slide, onPatch, hub, lessonId, slideId, enableFlashcards,
}) => {
  const safeLesson = lessonId || 'draft';

  // ── Image tab ──────────────────────────────────────────────────────────
  const [imgPrompt, setImgPrompt] = useState<string>(
    slide?.image_prompt || slide?.word || slide?.title || '',
  );
  const styleOptions = IMAGE_STYLES[hub] || IMAGE_STYLES.academy;
  // Always seed with the canonical hub default (kiwi / manga-comic / realistic),
  // not the first list entry. Teacher can still override per-slide.
  const [imgStyle, setImgStyle] = useState<string>(
    slide?.image_style || DEFAULT_IMAGE_STYLE_ID[hub] || styleOptions[0].id,
  );
  const [imgBusy, setImgBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);

  const buildStyledPrompt = (raw: string): string => {
    const preset = styleOptions.find((s) => s.id === imgStyle);
    if (!preset) return raw;
    return `${raw.trim()}. Style: ${preset.modifier}`;
  };

  const isStorySlide = (() => {
    const k = (slide?.kind || slide?.slide_kind || slide?.slide_type || '').toString().toLowerCase();
    return k.includes('story') || !!slide?.story_panel || !!slide?.is_story;
  })();

  const generateImage = async () => {
    const p = imgPrompt.trim();
    if (!p) { toast.error('Add an image prompt first'); return; }
    setImgBusy(true);
    onPatch({ image_loading: true, image_error: null, image_prompt: p, image_style: imgStyle });
    try {
      const res = await generateSlideImage(
        buildStyledPrompt(p),
        safeLesson,
        slideId,
        hub,
        undefined,
        isStorySlide ? { slideKind: 'story' } : undefined,
      );
      onPatch({ image_url: res.url, image_prompt: p, image_style: imgStyle, image_loading: false, image_error: null });
      toast.success('Image generated');
    } catch (e: any) {
      const msg = e?.message || 'Image generation failed';
      onPatch({ image_loading: false, image_error: msg });
      toast.error('Story image failed', { description: msg });
    } finally { setImgBusy(false); }
  };

  const handleUpload = async (file: File) => {
    setUploadBusy(true);
    onPatch({ image_loading: true, image_error: null });
    try {
      const res = await uploadSlideAsset(file, safeLesson);
      onPatch({ image_url: res.url, image_loading: false, image_error: null });
      toast.success('Image uploaded');
    } catch (e: any) {
      onPatch({ image_loading: false, image_error: e?.message || 'Upload failed' });
      toast.error(e?.message || 'Upload failed');
    } finally { setUploadBusy(false); }
  };

  // ── Audio tab ──────────────────────────────────────────────────────────
  const voice = slide?.voice || {};
  const [voiceText, setVoiceText] = useState<string>(voice.text || '');
  const [voiceId, setVoiceId] = useState<string>(voice.voice_id || VOICES[0].id);
  const [voiceBusy, setVoiceBusy] = useState(false);

  const generateVoice = async () => {
    const t = voiceText.trim();
    if (!t) { toast.error('Add narration text first'); return; }
    setVoiceBusy(true);
    try {
      const res = await generateSlideVoiceover(t, safeLesson, slideId, voiceId);
      onPatch({
        voice: { ...(slide?.voice || {}), text: t, voice_id: voiceId, audio_url: res.url, autoPlay: voice.autoPlay ?? true },
      });
      toast.success('Voiceover generated');
    } catch (e: any) {
      toast.error(e?.message || 'Voiceover failed');
    } finally { setVoiceBusy(false); }
  };

  // ── Music tab ──────────────────────────────────────────────────────────
  const [musicPrompt, setMusicPrompt] = useState<string>(slide?.music_prompt || '');
  const [musicSeconds, setMusicSeconds] = useState<number>(slide?.music_seconds || 20);
  const [musicBusy, setMusicBusy] = useState(false);

  const generateMusic = async () => {
    const p = musicPrompt.trim();
    if (!p) { toast.error('Describe the music first'); return; }
    setMusicBusy(true);
    try {
      const res = await generateSlideMusic(p, safeLesson, slideId, musicSeconds);
      onPatch({ music_url: res.url, music_prompt: p, music_seconds: musicSeconds });
      toast.success('Music generated');
    } catch (e: any) {
      toast.error(e?.message || 'Music generation failed');
    } finally { setMusicBusy(false); }
  };

  // ── Video tab ──────────────────────────────────────────────────────────
  const [videoUrl, setVideoUrl] = useState<string>(slide?.video_url || '');
  const ytId = useMemo(() => YoutubeId(videoUrl), [videoUrl]);

  const applyVideo = () => {
    const id = YoutubeId(videoUrl);
    onPatch({
      video_url: videoUrl.trim(),
      video_embed_url: id ? `https://www.youtube.com/embed/${id}` : videoUrl.trim(),
      video_provider: id ? 'youtube' : 'url',
    });
    toast.success('Video saved to slide');
  };

  // ── Flashcards tab ─────────────────────────────────────────────────────
  // Schema upgraded: { word, definition, image_url, audio_url } (legacy `front`/`back` still read)
  type Card = { word?: string; definition?: string; front?: string; back?: string; image_url?: string; audio_url?: string };
  const cards: Card[] = Array.isArray(slide?.flashcards) ? slide.flashcards : [];

  const setCards = (next: Card[]) => onPatch({ flashcards: next });

  const addCard = () => setCards([...cards, { word: '', definition: '' }]);
  const updateCard = (i: number, patch: Partial<Card>) =>
    setCards(cards.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  const removeCard = (i: number) => setCards(cards.filter((_, idx) => idx !== i));
  const generateCardImage = async (i: number) => {
    const c = cards[i];
    const p = c.word || c.front || c.definition || c.back;
    if (!p) { toast.error('Enter the word first'); return; }
    try {
      const res = await generateSlideImage(
        buildStyledPrompt(`Vocabulary illustration for: ${p}`),
        safeLesson, `${slideId}-card-${i}`, hub,
      );
      updateCard(i, { image_url: res.url });
      toast.success('Card image generated');
    } catch (e: any) {
      toast.error(e?.message || 'Image generation failed');
    }
  };
  const generateCardAudio = async (i: number) => {
    const c = cards[i];
    const text = c.word || c.front;
    if (!text) { toast.error('Enter the word first'); return; }
    try {
      const res = await generateSlideVoiceover(text, safeLesson, `${slideId}-card-${i}`, voiceId);
      updateCard(i, { audio_url: res.url });
      toast.success('Audio generated');
    } catch (e: any) {
      toast.error(e?.message || 'Audio generation failed');
    }
  };

  return (
    <Tabs defaultValue="image" className="w-full">
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="image" className="gap-1"><ImageIcon className="w-3.5 h-3.5" /> Image</TabsTrigger>
        <TabsTrigger value="audio" className="gap-1"><Mic className="w-3.5 h-3.5" /> Audio</TabsTrigger>
        <TabsTrigger value="music" className="gap-1"><Music className="w-3.5 h-3.5" /> Music</TabsTrigger>
        <TabsTrigger value="video" className="gap-1"><Video className="w-3.5 h-3.5" /> Video</TabsTrigger>
        <TabsTrigger value="cards" className="gap-1" disabled={!enableFlashcards}>
          <Layers className="w-3.5 h-3.5" /> Cards
        </TabsTrigger>
      </TabsList>

      {/* IMAGE */}
      <TabsContent value="image" className="space-y-3 pt-3">
        <div className="flex gap-3 items-start">
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden flex-shrink-0">
            {slide?.image_url ? (
              <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <Label className="text-xs">Image Style</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {styleOptions.map((s) => {
                  const active = s.id === imgStyle;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setImgStyle(s.id); onPatch({ image_style: s.id }); }}
                      className={
                        'text-[11px] font-semibold rounded-full px-2.5 py-1 border transition ' +
                        (active
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-700')
                      }
                      title={s.modifier}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground leading-snug">
                Style is appended to your prompt and reused for flashcard images.
              </p>
            </div>
            <Label className="text-xs">AI Image Prompt</Label>
            <Textarea
              rows={2}
              value={imgPrompt}
              onChange={(e) => setImgPrompt(e.target.value)}
              placeholder="e.g. happy cartoon dog wagging its tail"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={generateImage} disabled={imgBusy} className="gap-1">
                {imgBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate
              </Button>
              <label className="cursor-pointer">
                <Button size="sm" variant="outline" asChild disabled={uploadBusy}>
                  <span className="gap-1 inline-flex items-center">
                    {uploadBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload
                  </span>
                </Button>
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        </div>
        <div>
          <Label className="text-xs">Image URL (manual)</Label>
          <Input
            value={slide?.image_url || ''}
            onChange={(e) => onPatch({ image_url: e.target.value })}
            placeholder="https://…"
          />
        </div>
      </TabsContent>

      {/* AUDIO */}
      <TabsContent value="audio" className="space-y-3 pt-3">
        <div>
          <Label className="text-xs">Narration text</Label>
          <Textarea
            rows={3}
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            placeholder="What should the narrator say…"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Voice</Label>
            <Select value={voiceId} onValueChange={setVoiceId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VOICES.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Auto-play</Label>
            <Select
              value={voice.autoPlay === false ? 'no' : 'yes'}
              onValueChange={(v) =>
                onPatch({ voice: { ...(slide?.voice || {}), autoPlay: v === 'yes' } })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">On</SelectItem>
                <SelectItem value="no">Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={generateVoice} disabled={voiceBusy} className="gap-1">
            {voiceBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Generate voiceover
          </Button>
          {voice.audio_url && (
            <audio controls src={voice.audio_url} className="h-8" />
          )}
        </div>
      </TabsContent>

      {/* MUSIC */}
      <TabsContent value="music" className="space-y-3 pt-3">
        <div>
          <Label className="text-xs">Music prompt</Label>
          <Textarea
            rows={2}
            value={musicPrompt}
            onChange={(e) => setMusicPrompt(e.target.value)}
            placeholder="e.g. cheerful cartoon ukulele intro, kid-friendly"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="w-28">
            <Label className="text-xs">Seconds</Label>
            <Input
              type="number" min={5} max={60} value={musicSeconds}
              onChange={(e) => setMusicSeconds(parseInt(e.target.value) || 20)}
            />
          </div>
          <Button size="sm" onClick={generateMusic} disabled={musicBusy} className="gap-1">
            {musicBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Generate
          </Button>
          {slide?.music_url && <audio controls src={slide.music_url} className="h-8 ml-auto" />}
        </div>
      </TabsContent>

      {/* VIDEO */}
      <TabsContent value="video" className="space-y-3 pt-3">
        <div>
          <Label className="text-xs">Video URL (YouTube, Vimeo, MP4)</Label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={applyVideo}>Save video</Button>
          {ytId && (
            <span className="text-xs text-muted-foreground">YouTube id: <code>{ytId}</code></span>
          )}
        </div>
        {slide?.video_embed_url && ytId && (
          <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden border">
            <iframe
              src={slide.video_embed_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video preview"
            />
          </div>
        )}
      </TabsContent>

      {/* FLASHCARDS */}
      <TabsContent value="cards" className="space-y-3 pt-3">
        {!enableFlashcards && (
          <p className="text-xs text-muted-foreground">
            Flashcards apply only to vocabulary or matching slides.
          </p>
        )}
        {enableFlashcards && (
          <>
            <div className="flex justify-between items-center">
              <Label className="text-xs">Flashcards · {cards.length}</Label>
              <Button size="sm" variant="outline" onClick={addCard} className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Add card
              </Button>
            </div>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {cards.map((c, i) => {
                const word = c.word ?? c.front ?? '';
                const definition = c.definition ?? c.back ?? '';
                return (
                <div key={i} className="grid grid-cols-12 gap-2 border rounded-lg p-2 items-start bg-card">
                  <div className="col-span-3">
                    {c.image_url ? (
                      <img src={c.image_url} className="w-full aspect-square rounded object-cover border" alt={word} />
                    ) : (
                      <div className="w-full aspect-square rounded border-2 border-dashed flex items-center justify-center bg-muted/30">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="col-span-7 space-y-1.5">
                    <div>
                      <Label className="text-[10px]">Word</Label>
                      <Input value={word} onChange={(e) => updateCard(i, { word: e.target.value, front: e.target.value })} placeholder="apple" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Definition</Label>
                      <Input value={definition} onChange={(e) => updateCard(i, { definition: e.target.value, back: e.target.value })} placeholder="A round red or green fruit." />
                    </div>
                    {c.audio_url && <audio controls src={c.audio_url} className="h-7 w-full" />}
                  </div>
                  <div className="col-span-2 flex flex-col items-end gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => generateCardImage(i)} title="🪄 AI image">
                      <Sparkles className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => generateCardAudio(i)} title="🔊 Generate audio">
                      <Mic className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeCard(i)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              );})}
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SlideMediaPanel;
