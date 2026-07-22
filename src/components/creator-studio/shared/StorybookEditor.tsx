import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Loader2, Plus, Trash2, ImageIcon, Volume2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateOnePlaygroundImage } from '@/hooks/usePlaygroundImages';
import { listCharactersForHub } from '@/services/characterService';
import type { CustomCharacter, CharacterHub, StarringCharacterPayload } from '@/types/character';
import { toStarringPayload } from '@/types/character';
import { resolveStarringCharacter, getDefaultCharacterForHub } from '@/constants/defaultCharacters';
import { pickVoiceForCharacter } from '@/constants/characterVoices';
import type { StorybookSlideShape, StorybookPage, StorybookLayoutMode, StorybookTheme } from './StorybookRenderer';

type Hub = 'playground' | 'academy' | 'success';

interface Props {
  slide: StorybookSlideShape;
  hub: Hub;
  cefrLevel?: string;
  targetVocab?: string[];
  grammarFocus?: string;
  /** Lesson-wide context for the Story Brain auto-fill */
  lessonTitle?: string;
  lessonSlides?: any[];
  onPatch: (patch: Partial<StorybookSlideShape>) => void;
  onAppendQuiz?: (quizSlides: any[]) => void;
}

const DEFAULT_LAYOUT: Record<Hub, StorybookLayoutMode> = {
  playground: 'classic',
  academy: 'comic',
  success: 'case_study',
};

const THEME_OPTIONS: { value: StorybookTheme; label: string }[] = [
  { value: 'adventure', label: '🗺️ Adventure' },
  { value: 'school', label: '🎒 School Day' },
  { value: 'mystery', label: '🔍 Mystery' },
  { value: 'business_trip', label: '✈️ Business Trip' },
  { value: 'negotiation', label: '🤝 Negotiation' },
  { value: 'custom', label: '✨ Custom' },
];

const LAYOUT_OPTIONS: { value: StorybookLayoutMode; label: string }[] = [
  { value: 'classic', label: 'Classic (image + text)' },
  { value: 'comic', label: 'Comic (panels)' },
  { value: 'case_study', label: 'Case Study (vertical)' },
];

/**
 * Composition + aspect-ratio instructions injected into every image prompt so
 * the rendered illustration fills the page frame edge-to-edge (no letterboxing,
 * no off-center crops) for the layout the teacher chose.
 */
const LAYOUT_COMPOSITION: Record<StorybookLayoutMode, string> = {
  classic: 'Aspect ratio 16:9 landscape. Wide cinematic composition that fills the entire frame edge-to-edge. Subject centered with comfortable headroom, no borders, no letterboxing, no text overlays.',
  comic: 'Aspect ratio 1:1 perfect square comic panel. Bold composition that fills the entire square frame edge-to-edge. Subject centered, dynamic action pose, no borders, no letterboxing, no speech bubbles, no text overlays.',
  case_study: 'Aspect ratio 16:9 landscape, professional editorial composition. Subject centered, fills the entire frame edge-to-edge, clean uncluttered background, no borders, no letterboxing, no text overlays.',
};

function composeImagePrompt(subject: string, layout: StorybookLayoutMode, starring: { name: string; visual_blueprint: string }): string {
  return [
    subject,
    `The image MUST feature ${starring.name}. Visual blueprint: ${starring.visual_blueprint}.`,
    LAYOUT_COMPOSITION[layout],
  ].join(' ');
}

const HUB_TONE: Record<Hub, string> = {
  playground: 'border-orange-200 focus:border-orange-500 ring-orange-100',
  academy: 'border-indigo-200 focus:border-indigo-500 ring-indigo-100',
  success: 'border-emerald-200 focus:border-emerald-500 ring-emerald-100',
};

const HUB_BTN: Record<Hub, string> = {
  playground: 'from-fuchsia-500 to-orange-500',
  academy: 'from-indigo-600 to-purple-600',
  success: 'from-emerald-600 to-teal-600',
};

const HUB_LABEL: Record<Hub, string> = {
  playground: 'Playground',
  academy: 'Academy',
  success: 'Success',
};

const AUTO_HUB = '__auto__';

function patchPageDraft(
  draft: StorybookPage[],
  index: number,
  patch: Partial<StorybookPage>,
  onPatch: (patch: Partial<StorybookSlideShape>) => void,
) {
  draft[index] = { ...draft[index], ...patch };
  onPatch({ pages: [...draft] });
}

function resolveCharacterVoiceId(hub: Hub, character: StarringCharacterPayload): string {
  return character.voice_id || pickVoiceForCharacter(hub, {
    name: character.name,
    personality: character.personality_traits,
    visual: character.visual_blueprint,
  }).id;
}

/**
 * Story Brain: scan the lesson's slide deck and pull the lesson title +
 * every target vocabulary word the teacher has authored so far.
 */
function gatherLessonContext(lessonTitle: string | undefined, allSlides: any[] | undefined): {
  title: string;
  vocab: string[];
} {
  const slides = Array.isArray(allSlides) ? allSlides : [];
  let inferredTitle = lessonTitle?.trim() || '';
  if (!inferredTitle) {
    const intro = slides.find((s) => s?.type === 'intro');
    if (intro?.title) inferredTitle = String(intro.title).trim();
  }

  const seen = new Set<string>();
  const vocab: string[] = [];
  const push = (raw: unknown) => {
    if (!raw) return;
    const w = String(raw).trim();
    if (!w) return;
    const k = w.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    vocab.push(w);
  };

  for (const s of slides) {
    if (!s || typeof s !== 'object') continue;
    const t = String(s.type || '').toLowerCase();
    if (t === 'vocab' || t === 'vocabulary' || t === 'matching' || t === 'flashcards') {
      const items = (s as any).items || (s as any).cards || (s as any).pairs || [];
      if (Array.isArray(items)) {
        for (const it of items) {
          push((it as any)?.word || (it as any)?.term || (it as any)?.text || (it as any)?.left);
        }
      }
      const targets = (s as any).target_words || (s as any).vocabulary;
      if (Array.isArray(targets)) targets.forEach(push);
    }
  }
  return { title: inferredTitle, vocab };
}

export function StorybookEditor({
  slide, hub, cefrLevel, targetVocab = [], grammarFocus,
  lessonTitle, lessonSlides,
  onPatch, onAppendQuiz,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [imgBusyIdx, setImgBusyIdx] = useState<number | null>(null);
  const [audBusyIdx, setAudBusyIdx] = useState<number | null>(null);
  const [characters, setCharacters] = useState<CustomCharacter[]>([]);
  const [starringId, setStarringId] = useState<string>(AUTO_HUB);

  // Cast Vault: load characters scoped to the active hub.
  useEffect(() => {
    let active = true;
    listCharactersForHub(hub as CharacterHub)
      .then((rows) => { if (active) setCharacters(rows); })
      .catch(() => { /* silent — vault may simply be empty */ });
    return () => { active = false; };
  }, [hub]);

  const pages = slide.pages || [];
  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${HUB_TONE[hub]}`;
  const layoutMode: StorybookLayoutMode = slide.layout_mode || DEFAULT_LAYOUT[hub];
  const themeChoice: StorybookTheme = slide.theme || (hub === 'success' ? 'business_trip' : hub === 'academy' ? 'school' : 'adventure');

  /** The character that will actually be sent to the AI. */
  const activeCharacter: StarringCharacterPayload = useMemo(() => {
    if (starringId !== AUTO_HUB) {
      const picked = characters.find((c) => c.id === starringId);
      if (picked) return toStarringPayload(picked);
    }
    return getDefaultCharacterForHub(hub);
  }, [starringId, characters, hub]);

  /** ✨ Story Brain — assemble the perfect prompt from lesson context. */
  const runStoryBrain = () => {
    const ctx = gatherLessonContext(lessonTitle, lessonSlides);
    const mergedVocab = Array.from(new Set([...(ctx.vocab || []), ...(targetVocab || [])]
      .map((v) => String(v).trim()).filter(Boolean)));
    const lessonName = ctx.title || lessonTitle || 'this lesson topic';
    const c = activeCharacter;

    const prompt =
      `Write a 4-panel story about "${lessonName}". ` +
      `The main character is ${c.name} (${c.personality_traits || 'consistent recurring voice'}). ` +
      (mergedVocab.length
        ? `The story MUST naturally include these vocabulary words: ${mergedVocab.join(', ')}. `
        : '') +
      (grammarFocus ? `Weave in the grammar focus: ${grammarFocus}. ` : '') +
      `Make the style suitable for the ${HUB_LABEL[hub]} Hub at CEFR ${cefrLevel || (hub === 'playground' ? 'A1' : hub === 'academy' ? 'B1' : 'B2')}.`;

    onPatch({ topic: prompt, title: slide.title || lessonName });
    toast.success('Story Brain filled the prompt ✨');
  };

  const generate = async () => {
    const topic = (slide.topic || '').trim();
    if (!topic) { toast.error('Add a story prompt first (or click ✨ Auto-Fill with Story Brain)'); return; }
    setBusy(true);
    try {
      // Always send a hydrated character so the backend image generator can
      // draw the same protagonist on every panel. Resolves to the Hub's
      // default character if the teacher chose Auto-Select.
      const starring = resolveStarringCharacter(activeCharacter, hub);
      const { data, error } = await supabase.functions.invoke('generate-storybook', {
        body: {
          prompt: topic,
          target_vocab: targetVocab,
          grammar_focus: grammarFocus || '',
          theme: themeChoice,
          layout_mode: layoutMode,
          cefr_level: cefrLevel || (hub === 'playground' ? 'A1' : hub === 'academy' ? 'B1' : 'B2'),
          hub_type: hub,
          starring_character: starring,
          character_visual_blueprint: starring.visual_blueprint,
        },
      });
      if (error) {
        const ctx: any = (error as any).context;
        const status = ctx?.status;
        const msg = ctx?.error || (error as any).message || '';
        if (status === 402 || /credit/i.test(msg)) {
          toast.error('Out of AI credits — add credits in Workspace → Usage to generate stories.');
          return;
        }
        if (status === 429) {
          toast.error('Rate limited. Please retry in a few seconds.');
          return;
        }
        throw error;
      }
      const newPages: StorybookPage[] = (data?.pages || []).map((p: any, i: number) => ({
        page_number: p.page_number ?? i + 1,
        text: p.text || '',
        image_prompt: p.image_prompt || '',
        image_url: p.image_url || '',
        audio_url: p.audio_url || '',
      }));
      const highlight: string[] = Array.isArray(data?.highlight_words) && data.highlight_words.length
        ? data.highlight_words
        : targetVocab;
      const generatedTitle = (data?.title || '').toString().trim();
      const fallbackTitle = (slide.title || '').toString().trim() || topic.slice(0, 60);
      onPatch({
        title: generatedTitle || fallbackTitle,
        pages: newPages,
        layout_mode: (data?.layout_mode as StorybookLayoutMode) || layoutMode,
        theme: (data?.theme as StorybookTheme) || themeChoice,
        highlight_words: highlight,
      });
      if (Array.isArray(data?.quiz_slides) && data.quiz_slides.length > 0 && onAppendQuiz) {
        onAppendQuiz(data.quiz_slides);
      }
      toast.success(`Generated ${newPages.length} pages + ${data?.quiz_slides?.length ?? 0} comprehension slides ✨`);

      // background image enrichment — append the character's visual blueprint
      // + layout aspect ratio so each panel keeps the same protagonist art and
      // fills the page frame edge-to-edge.
      const voiceId = resolveCharacterVoiceId(hub, starring);
      for (let i = 0; i < newPages.length; i++) {
        const p = newPages[i];
        try {
          if (!p.image_url) {
            const subj = p.image_prompt || `${topic} - page ${i + 1}`;
            const enriched = composeImagePrompt(subj, layoutMode, starring);
            const url = await generateOnePlaygroundImage(enriched);
            if (url) {
              patchPageDraft(newPages, i, { image_url: url }, onPatch);
            }
          }
        } catch { /* silent */ }

        try {
          if (p.text?.trim()) {
            const { data: audioData, error: audioError } = await supabase.functions.invoke('generate-slide-voiceover', {
              body: {
                text: p.text,
                hub,
                lessonId: 'storybook-draft',
                slideId: `page-${i + 1}`,
                voiceId,
              },
            });
            if (!audioError) {
              const audioUrl = audioData?.audio_url || audioData?.url;
              if (audioUrl) patchPageDraft(newPages, i, { audio_url: audioUrl }, onPatch);
            }
          }
        } catch { /* silent */ }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Story generation failed');
    } finally {
      setBusy(false);
    }
  };

  const updatePage = (i: number, patch: Partial<StorybookPage>) => {
    onPatch({ pages: pages.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  };
  const addPage = () => {
    onPatch({
      pages: [...pages, { page_number: pages.length + 1, text: '', image_url: '', audio_url: '' }],
    });
  };
  const removePage = (i: number) => onPatch({ pages: pages.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, page_number: idx + 1 })) });

  const regenImage = async (i: number) => {
    const p = pages[i];
    const subj = p.image_prompt || p.text.slice(0, 80);
    if (!subj) { toast.error('Add page text first'); return; }
    setImgBusyIdx(i);
    try {
      const enriched = composeImagePrompt(subj, layoutMode, activeCharacter);
      const url = await generateOnePlaygroundImage(enriched);
      if (!url) throw new Error('No image returned');
      updatePage(i, { image_url: url });
    } catch (e: any) {
      toast.error(e?.message || 'Image failed');
    } finally {
      setImgBusyIdx(null);
    }
  };

  const regenAudio = async (i: number) => {
    const p = pages[i];
    if (!p.text) { toast.error('Add page text first'); return; }
    setAudBusyIdx(i);
    try {
      const { data, error } = await supabase.functions.invoke('generate-slide-voiceover', {
        body: {
          text: p.text,
          hub,
          // Use the starring character's ElevenLabs voice if set, so the
          // narrator is consistent across every page of the story.
          voiceId: resolveCharacterVoiceId(hub, activeCharacter),
        },
      });
      if (error) throw error;
      const url = data?.audio_url || data?.url;
      if (!url) throw new Error('No audio returned');
      updatePage(i, { audio_url: url });
    } catch (e: any) {
      toast.error(e?.message || 'Audio failed');
    } finally {
      setAudBusyIdx(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">📖 Mini Story Generator</div>

        <label className="block text-xs font-semibold text-slate-600 mb-1">Story Title</label>
        <input
          className={inputCls + ' mb-2'}
          value={slide.title || ''}
          placeholder="e.g. Lost at the Airport"
          onChange={(e) => onPatch({ title: e.target.value })}
        />

        {/* Cast Vault — Starring Character */}
        <label className="block text-xs font-semibold text-slate-600 mb-1">Starring Character</label>
        <select
          className={inputCls + ' text-xs mb-1'}
          value={starringId}
          onChange={(e) => setStarringId(e.target.value)}
        >
          <option value={AUTO_HUB}>
            ✨ Auto-Select by Hub — {getDefaultCharacterForHub(hub).name}
          </option>
          {characters.length > 0 && (
            <optgroup label="From your Cast Vault">
              {characters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
          )}
        </select>
        <p className="text-[10px] text-slate-500 mb-2">
          Active: <span className="font-semibold text-slate-700">{activeCharacter.name}</span> — used as the protagonist in the story and every panel.
        </p>

        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-600">Story Prompt / Topic</label>
          <button
            type="button"
            onClick={runStoryBrain}
            className="text-[10px] font-bold inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            title="Auto-fill the prompt from this lesson's title, vocab, and the chosen character"
          >
            <Wand2 className="w-3 h-3" /> ✨ Auto-Fill with Story Brain
          </button>
        </div>
        <textarea
          className={inputCls + ' h-24 resize-none'}
          value={slide.topic || ''}
          placeholder="Click ✨ Auto-Fill, or describe what the story should be about (3-5 pages)"
          onChange={(e) => onPatch({ topic: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Story Theme</label>
            <select className={inputCls + ' text-xs'} value={themeChoice}
              onChange={(e) => onPatch({ theme: e.target.value as StorybookTheme })}>
              {THEME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Layout Style</label>
            <select className={inputCls + ' text-xs'} value={layoutMode}
              onChange={(e) => onPatch({ layout_mode: e.target.value as StorybookLayoutMode })}>
              {LAYOUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {targetVocab.length > 0 && (
          <div className="mt-2 text-[11px] text-slate-500">
            Target vocab to weave in: <span className="font-semibold text-slate-700">{targetVocab.slice(0, 8).join(', ')}</span>
          </div>
        )}
        {grammarFocus && (
          <div className="mt-1 text-[11px] text-slate-500">
            Grammar focus: <span className="font-semibold text-slate-700">{grammarFocus}</span>
          </div>
        )}

        <button
          disabled={busy}
          onClick={generate}
          className={`mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${HUB_BTN[hub]} text-white font-bold py-2.5 text-sm shadow disabled:opacity-50`}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {busy ? 'Generating story…' : '✨ AI Generate Story Sequence'}
        </button>
        <p className="mt-2 text-[10px] text-slate-500 leading-snug">
          Auto-creates 3-5 illustrated pages and {hub === 'playground' ? '2' : hub === 'academy' ? '3-4' : '4-5'} comprehension quiz slides scaled to {hub.toUpperCase()}.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pages ({pages.length})</div>
          <button onClick={addPage} className="text-[11px] font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add page
          </button>
        </div>
        {pages.map((p, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Page {i + 1}</span>
              <button onClick={() => removePage(i)} className="text-red-500 hover:bg-red-50 rounded p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              className={inputCls + ' h-16 resize-none'}
              value={p.text}
              placeholder="Page text…"
              onChange={(e) => updatePage(i, { text: e.target.value })}
            />
            <input
              className={inputCls + ' text-xs'}
              value={p.image_prompt || ''}
              placeholder="Image brief (optional)…"
              onChange={(e) => updatePage(i, { image_prompt: e.target.value })}
            />
            <div className="flex gap-2 items-center">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="w-12 h-12 rounded object-cover border" />
              ) : (
                <div className="w-12 h-12 rounded border border-dashed flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
              )}
              <button onClick={() => regenImage(i)} disabled={imgBusyIdx === i}
                className="flex-1 text-xs font-bold rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-1.5 inline-flex items-center justify-center gap-1 disabled:opacity-50">
                {imgBusyIdx === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Image
              </button>
              <button onClick={() => regenAudio(i)} disabled={audBusyIdx === i}
                className="flex-1 text-xs font-bold rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-1.5 inline-flex items-center justify-center gap-1 disabled:opacity-50">
                {audBusyIdx === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />} Audio
              </button>
            </div>
            {p.audio_url && <audio controls src={p.audio_url} className="w-full h-8" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StorybookEditor;
