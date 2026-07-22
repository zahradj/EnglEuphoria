import { useState } from 'react';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { ScaffoldedMediaSlide, ScaffoldedMediaSegment } from './canvasSchema';
import { detectMediaKind } from './MediaPlayerRenderer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  slide: ScaffoldedMediaSlide;
  onChange: (next: ScaffoldedMediaSlide) => void;
  hub?: 'playground' | 'academy' | 'success';
}

export function ScaffoldedMediaEditor({ slide, onChange, hub = 'playground' }: Props) {
  const [busy, setBusy] = useState(false);

  const update = (patch: Partial<ScaffoldedMediaSlide>) => onChange({ ...slide, ...patch });
  const updateSeg = (i: number, patch: Partial<ScaffoldedMediaSegment>) => {
    update({ segments: slide.segments.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  };
  const updateQ = (i: number, patch: Partial<ScaffoldedMediaSegment['question']>) => {
    update({
      segments: slide.segments.map((s, idx) =>
        idx === i ? { ...s, question: { ...s.question, ...patch } } : s,
      ),
    });
  };
  const addSeg = () => {
    const last = slide.segments[slide.segments.length - 1];
    const start = last ? last.end_time : 0;
    update({
      segments: [
        ...slide.segments,
        { start_time: start, end_time: start + 30, question: { prompt: 'New question?', options: ['A', 'B', 'C'], answer: 'A' } },
      ],
    });
  };
  const removeSeg = (i: number) => update({ segments: slide.segments.filter((_, idx) => idx !== i) });

  const analyze = async () => {
    if (!slide.media_url) { toast.error('Add media URL first'); return; }
    const transcript = (slide.transcript || '').trim();
    if (transcript.length < 30) {
      toast.error('Paste a transcript of at least 30 characters before generating checkpoints');
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-media', {
        body: {
          media_url: slide.media_url,
          media_kind: slide.media_kind,
          transcript,
          hub_type: hub,
          hub, // legacy alias
          cefr_level: 'A2',
        },
      });
      if (error) throw error;
      // Support both new (segments) and legacy (quiz_slides) responses
      const segments = Array.isArray(data?.segments) && data.segments.length
        ? data.segments
        : Array.isArray(data?.quiz_slides) && data.quiz_slides.length
          ? data.quiz_slides.map((q: any, i: number) => ({
              start_time: i * 30,
              end_time: (i + 1) * 30,
              question: {
                prompt: q.question || q.statement || q.text || q.prompt || `Checkpoint ${i + 1}`,
                options: Array.isArray(q.options) && q.options.length
                  ? q.options
                  : (typeof q.answer_bool === 'boolean' ? ['True', 'False'] : ['A', 'B', 'C']),
                answer: q.answer ?? (q.answer_bool === true ? 'True' : q.answer_bool === false ? 'False' : 'A'),
              },
            }))
          : [];
      if (segments.length) {
        update({ segments });
        toast.success(`AI generated ${segments.length} checkpoints`);
      } else {
        toast.error('No segments returned');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Analysis failed. Try a longer transcript.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="block text-xs font-bold uppercase text-slate-600 mb-1">Title</span>
        <input value={slide.title || ''} onChange={(e) => update({ title: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm" />
      </label>

      <label className="block">
        <span className="block text-xs font-bold uppercase text-slate-600 mb-1">Media URL</span>
        <input
          value={slide.media_url}
          onChange={(e) => update({ media_url: e.target.value, media_kind: detectMediaKind(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          placeholder="YouTube, audio or video URL"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-bold uppercase text-slate-600 mb-1">Transcript (optional)</span>
        <textarea
          value={slide.transcript || ''}
          onChange={(e) => update({ transcript: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border text-xs font-mono"
        />
      </label>

      <button
        onClick={analyze}
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg px-3 py-2 text-sm"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        AI: generate checkpoints from transcript
      </button>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-slate-600">Checkpoints ({slide.segments.length})</span>
          <button onClick={addSeg} className="inline-flex items-center gap-1 text-xs bg-slate-200 hover:bg-slate-300 rounded px-2 py-1 font-semibold">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>

        <div className="space-y-3">
          {slide.segments.map((seg, i) => (
            <div key={i} className="border rounded-lg p-3 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Checkpoint {i + 1}</span>
                <button onClick={() => removeSeg(i)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px]">
                  <span className="block font-semibold text-slate-600">Start (s)</span>
                  <input type="number" value={seg.start_time} onChange={(e) => updateSeg(i, { start_time: Number(e.target.value) })} className="w-full px-2 py-1 rounded border" />
                </label>
                <label className="text-[11px]">
                  <span className="block font-semibold text-slate-600">Pause at (s)</span>
                  <input type="number" value={seg.end_time} onChange={(e) => updateSeg(i, { end_time: Number(e.target.value) })} className="w-full px-2 py-1 rounded border" />
                </label>
              </div>
              <label className="block text-[11px]">
                <span className="block font-semibold text-slate-600">Question</span>
                <input value={seg.question.prompt} onChange={(e) => updateQ(i, { prompt: e.target.value })} className="w-full px-2 py-1 rounded border text-xs" />
              </label>
              <label className="block text-[11px]">
                <span className="block font-semibold text-slate-600">Options (one per line)</span>
                <textarea
                  value={seg.question.options.join('\n')}
                  onChange={(e) => updateQ(i, { options: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                  rows={3}
                  className="w-full px-2 py-1 rounded border text-xs font-mono"
                />
              </label>
              <label className="block text-[11px]">
                <span className="block font-semibold text-slate-600">Correct answer</span>
                <select
                  value={seg.question.answer}
                  onChange={(e) => updateQ(i, { answer: e.target.value })}
                  className="w-full px-2 py-1 rounded border text-xs"
                >
                  {seg.question.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
