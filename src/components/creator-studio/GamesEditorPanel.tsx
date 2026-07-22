/**
 * GamesEditorPanel — inline "dashboard" for editing game-style slides
 * (vocab_games_slot + phonics_focus) inside AcademyCreator / SuccessCreator.
 *
 * Purpose: give creators a single, structured surface where they can tune
 * every game/phonics knob without dropping into raw JSON. It composes with the
 * existing Content tab in the creator shell.
 *
 * Rules honored:
 *   - image_url stays null at generation; only image_prompt is edited.
 *   - No random AI generation — invokes existing edge functions (ai-vocab-cards,
 *     ai-image-generation) that already flow through the governance pipeline.
 *   - Hub × CEFR pass-through only; this panel never overrides pedagogy tiers.
 */

import { useState } from 'react';
import { Plus, Trash2, Sparkles, Image as ImageIcon, Loader2, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Hub = 'academy' | 'success';

interface VocabTarget {
  word: string;
  definition?: string;
  example?: string;
  image_url?: string | null;
  image_prompt?: string;
}

interface PhonicsItem {
  word: string;
  image_url?: string;
  audio_url?: string;
  spoken_text?: string;
}

interface AnySlide {
  type: string;
  // vocab_games_slot
  hub?: string;
  cefr?: string;
  targets?: VocabTarget[];
  mode?: 'lesson' | 'review' | 'quiz';
  maxGames?: number;
  passThreshold?: number;
  // phonics_focus
  phoneme?: string;
  grapheme?: string;
  sound_ipa?: string;
  label?: string;
  audio_url?: string;
  phonics_items?: PhonicsItem[];
  example_words?: string[];
  [k: string]: any;
}

interface Props {
  slide: AnySlide;
  onChange: (patch: Partial<AnySlide>) => void;
  hub: Hub;
  cefrLevel?: string;
  topic?: string;
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none';
const labelCls = 'text-[11px] font-bold uppercase tracking-widest text-slate-500';
const cardCls = 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm';
const sectionTitleCls = 'text-sm font-bold text-slate-800';

export default function GamesEditorPanel({ slide, onChange, hub, cefrLevel, topic }: Props) {
  if (slide.type === 'vocab_games_slot') {
    return <VocabGamesEditor slide={slide} onChange={onChange} hub={hub} cefrLevel={cefrLevel} topic={topic} />;
  }
  if (slide.type === 'phonics_focus') {
    return <PhonicsEditor slide={slide} onChange={onChange} />;
  }
  return null;
}

export function isGamesEditorSlide(type?: string) {
  return type === 'vocab_games_slot' || type === 'phonics_focus';
}

/* ---------------- Vocab Games ---------------- */

function VocabGamesEditor({ slide, onChange, hub, cefrLevel, topic }: Props) {
  const targets = Array.isArray(slide.targets) ? slide.targets : [];
  const mode = slide.mode ?? 'lesson';
  const maxGames = slide.maxGames ?? (hub === 'success' ? 3 : 4);
  const passThreshold = slide.passThreshold ?? 0.8;
  const [busy, setBusy] = useState<string | null>(null);

  const patchTargets = (next: VocabTarget[]) => onChange({ targets: next });
  const patchTarget = (i: number, patch: Partial<VocabTarget>) => {
    const n = targets.slice();
    n[i] = { ...n[i], ...patch };
    patchTargets(n);
  };

  const addTarget = () => patchTargets([...targets, { word: '', definition: '', example: '', image_url: null }]);
  const removeTarget = (i: number) => patchTargets(targets.filter((_, j) => j !== i));

  const fillMissingDefs = async () => {
    const missing = targets
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => (t.word || '').trim() && (!t.definition || !t.example));
    if (missing.length === 0) return;
    setBusy('defs');
    try {
      const { data, error } = await supabase.functions.invoke('ai-vocab-cards', {
        body: { words: missing.map((m) => m.t.word.trim()), hub, cefr: cefrLevel, topic },
      });
      if (error || !data) return;
      const cards: Array<{ word: string; definition?: string; example?: string }> = (data as any).cards || [];
      const next = targets.slice();
      missing.forEach((m, k) => {
        const c = cards[k];
        if (!c) return;
        next[m.i] = {
          ...next[m.i],
          definition: next[m.i].definition || c.definition,
          example: next[m.i].example || c.example,
        };
      });
      patchTargets(next);
    } finally {
      setBusy(null);
    }
  };

  const generateImage = async (i: number) => {
    const t = targets[i];
    const word = (t.word || '').trim();
    if (!word) return;
    setBusy(`img-${i}`);
    try {
      const promptText =
        t.image_prompt?.trim() ||
        `A single "${word}" on a soft pastel illustrated background, centered, thick outlines, child-safe. NO TEXT.`;
      const { data, error } = await supabase.functions.invoke('ai-image-generation', {
        body: { prompt: promptText, style: 'educational' },
      });
      if (error) return;
      const url = (data as any)?.imageUrl || (data as any)?.url;
      if (url) patchTarget(i, { image_url: url });
    } finally {
      setBusy(null);
    }
  };

  const generateAllImages = async () => {
    for (let i = 0; i < targets.length; i++) {
      if (!targets[i].image_url && (targets[i].word || '').trim()) {
        await generateImage(i);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={sectionTitleCls}>🎮 Vocab Games Slot</h3>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-purple-500">
            {hub} · {cefrLevel || 'A2'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Mode</label>
            <select
              className={inputCls}
              value={mode}
              onChange={(e) => onChange({ mode: e.target.value as any })}
            >
              <option value="lesson">Lesson (varied arc)</option>
              <option value="review">Review (unit recap)</option>
              <option value="quiz">Quiz (80% gate)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Max games</label>
            <input
              type="number"
              min={1}
              max={6}
              className={inputCls}
              value={maxGames}
              onChange={(e) => onChange({ maxGames: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelCls}>Pass threshold</label>
            <input
              type="number"
              step={0.05}
              min={0.5}
              max={1}
              className={inputCls}
              value={passThreshold}
              onChange={(e) => onChange({ passThreshold: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={sectionTitleCls}>🎯 Reinforcement targets ({targets.length})</h3>
          <div className="flex gap-2">
            <button
              onClick={fillMissingDefs}
              disabled={busy === 'defs'}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-50"
            >
              {busy === 'defs' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              Fill defs/examples
            </button>
            <button
              onClick={generateAllImages}
              disabled={busy?.startsWith('img-')}
              className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-50"
            >
              <ImageIcon className="w-3 h-3" /> Generate missing images
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {targets.map((t, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5">#{i + 1}</span>
                <input
                  className={inputCls + ' flex-1'}
                  placeholder="Headword"
                  value={t.word || ''}
                  onChange={(e) => patchTarget(i, { word: e.target.value })}
                />
                <button
                  onClick={() => removeTarget(i)}
                  className="text-red-500 hover:bg-red-50 rounded-lg px-2 py-1"
                  aria-label="Remove target"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                className={inputCls}
                placeholder="Definition"
                value={t.definition || ''}
                onChange={(e) => patchTarget(i, { definition: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Example sentence (must contain headword)"
                value={t.example || ''}
                onChange={(e) => patchTarget(i, { example: e.target.value })}
              />
              <div className="flex gap-2 items-start">
                <div className="w-16 h-16 rounded-md border border-slate-200 bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.word} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    className={inputCls}
                    placeholder="image_prompt (optional — auto-composed if empty)"
                    value={t.image_prompt || ''}
                    onChange={(e) => patchTarget(i, { image_prompt: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <input
                      className={inputCls + ' flex-1 text-xs'}
                      placeholder="image_url"
                      value={t.image_url || ''}
                      onChange={(e) => patchTarget(i, { image_url: e.target.value || null })}
                    />
                    <button
                      onClick={() => generateImage(i)}
                      disabled={busy === `img-${i}` || !(t.word || '').trim()}
                      className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
                    >
                      {busy === `img-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addTarget}
          className="mt-3 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded px-2 py-1.5 inline-flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add target
        </button>

        <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
          The Matching game (MemoryGrid), Meaning Maze, and Word Rush all read from this
          target list. Images set here appear on the word-face cards.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Phonics ---------------- */

function PhonicsEditor({ slide, onChange }: { slide: AnySlide; onChange: Props['onChange'] }) {
  const items: PhonicsItem[] =
    Array.isArray(slide.phonics_items) && slide.phonics_items.length > 0
      ? slide.phonics_items
      : (slide.example_words || []).map((w) => ({ word: w }));

  const patchItems = (next: PhonicsItem[]) => onChange({ phonics_items: next, example_words: undefined });
  const patchItem = (i: number, patch: Partial<PhonicsItem>) => {
    const n = items.slice();
    n[i] = { ...n[i], ...patch };
    patchItems(n);
  };
  const addItem = () => patchItems([...items, { word: '' }]);
  const removeItem = (i: number) => patchItems(items.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <h3 className={sectionTitleCls + ' mb-3'}>🔊 Phonics Focus</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Grapheme</label>
            <input
              className={inputCls}
              placeholder="a / Magic e / sh"
              value={slide.grapheme || ''}
              onChange={(e) => onChange({ grapheme: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Phoneme</label>
            <input
              className={inputCls}
              placeholder="/æ/"
              value={slide.phoneme || ''}
              onChange={(e) => onChange({ phoneme: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>IPA (optional)</label>
            <input
              className={inputCls}
              placeholder="/æ/"
              value={slide.sound_ipa || ''}
              onChange={(e) => onChange({ sound_ipa: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Label</label>
            <input
              className={inputCls}
              placeholder="Executive Pronunciation / Word Stress"
              value={slide.label || ''}
              onChange={(e) => onChange({ label: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Isolated-sound audio URL</label>
            <input
              className={inputCls}
              placeholder="https://…"
              value={slide.audio_url || ''}
              onChange={(e) => onChange({ audio_url: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={sectionTitleCls}>Example words ({items.length})</h3>
          <button
            onClick={addItem}
            className="text-xs font-bold text-purple-600 hover:bg-purple-50 rounded px-2 py-1 inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5">#{i + 1}</span>
                <input
                  className={inputCls + ' flex-1'}
                  placeholder="Word (e.g. cat)"
                  value={it.word || ''}
                  onChange={(e) => patchItem(i, { word: e.target.value })}
                />
                <button
                  onClick={() => removeItem(i)}
                  className="text-red-500 hover:bg-red-50 rounded-lg px-2 py-1"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                className={inputCls}
                placeholder="Spoken text (override for TTS, optional)"
                value={it.spoken_text || ''}
                onChange={(e) => patchItem(i, { spoken_text: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputCls}
                  placeholder="image_url"
                  value={it.image_url || ''}
                  onChange={(e) => patchItem(i, { image_url: e.target.value })}
                />
                <input
                  className={inputCls}
                  placeholder="audio_url"
                  value={it.audio_url || ''}
                  onChange={(e) => patchItem(i, { audio_url: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
