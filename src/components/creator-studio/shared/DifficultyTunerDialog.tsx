import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, ArrowDown, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { handleAIResponse } from '@/lib/aiErrorHandler';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** The current slide object — read-only; we just extract editable text fields. */
  slide: any;
  /** Patch the slide back into the parent (same signature as `update`). */
  onPatch: (patch: Record<string, any>) => void;
  hub: 'playground' | 'academy' | 'success';
}

/** Text fields we know how to tune across both creators. */
const TUNABLE_FIELDS = [
  'title', 'subtitle', 'prompt', 'placeholder', 'question', 'statement',
  'passage', 'transcript', 'text', 'pattern',
];

function extractTexts(slide: any): { field: string; value: string }[] {
  if (!slide || typeof slide !== 'object') return [];
  const out: { field: string; value: string }[] = [];
  for (const f of TUNABLE_FIELDS) {
    const v = slide[f];
    if (typeof v === 'string' && v.trim().length > 3) out.push({ field: f, value: v });
  }
  // voice.text (Playground)
  if (slide.voice && typeof slide.voice.text === 'string' && slide.voice.text.trim()) {
    out.push({ field: 'voice.text', value: slide.voice.text });
  }
  // options array (multiple choice)
  if (Array.isArray(slide.options)) {
    slide.options.forEach((o: any, i: number) => {
      if (typeof o === 'string' && o.trim()) out.push({ field: `options.${i}`, value: o });
    });
  }
  return out;
}

function applyTexts(
  slide: any,
  rewritten: { field: string; value: string }[]
): Record<string, any> {
  const patch: Record<string, any> = {};
  for (const { field, value } of rewritten) {
    if (field === 'voice.text') {
      patch.voice = { ...(slide.voice || {}), text: value, audio_url: undefined };
    } else if (field.startsWith('options.')) {
      const idx = parseInt(field.split('.')[1], 10);
      const next = Array.isArray(patch.options) ? patch.options : [...(slide.options || [])];
      next[idx] = value;
      patch.options = next;
    } else {
      patch[field] = value;
    }
  }
  return patch;
}

export const DifficultyTunerDialog: React.FC<Props> = ({ open, onOpenChange, slide, onPatch, hub }) => {
  const [direction, setDirection] = useState<'easier' | 'harder'>('easier');
  const [targetLevel, setTargetLevel] = useState<string>(hub === 'playground' ? 'A1' : 'B1');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ field: string; before: string; after: string }[] | null>(null);

  const sources = useMemo(() => extractTexts(slide), [slide]);

  const run = async () => {
    if (sources.length === 0) {
      toast.info('No editable text on this slide');
      return;
    }
    setBusy(true);
    setPreview(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-rewrite-text', {
        body: { texts: sources.map((s) => s.value), direction, targetLevel, hub },
      });
      if (!handleAIResponse({ data, error, onRetry: run, context: 'Difficulty Tuner' })) {
        setBusy(false);
        return;
      }
      const rewritten: string[] = data?.rewritten || [];
      setPreview(sources.map((s, i) => ({ field: s.field, before: s.value, after: rewritten[i] || s.value })));
    } catch (e: any) {
      toast.error(e.message || 'Failed to tune difficulty');
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!preview) return;
    const patch = applyTexts(slide, preview.map((p) => ({ field: p.field, value: p.after })));
    onPatch(patch);
    toast.success(`Slide rewritten — ${direction === 'easier' ? 'simpler' : 'richer'}`);
    onOpenChange(false);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setPreview(null); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-600" /> Difficulty Tuner
          </DialogTitle>
          <DialogDescription>
            Rewrite this slide's text {direction === 'easier' ? 'simpler' : 'richer'} for a {targetLevel} learner.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            <button
              onClick={() => setDirection('easier')}
              className={`px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1 ${direction === 'easier' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}
            >
              <ArrowDown className="w-3.5 h-3.5" /> Easier
            </button>
            <button
              onClick={() => setDirection('harder')}
              className={`px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1 ${direction === 'harder' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
            >
              <ArrowUp className="w-3.5 h-3.5" /> Harder
            </button>
          </div>
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
            className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white"
          >
            {['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'].map((l) => <option key={l}>{l}</option>)}
          </select>
          <Button onClick={run} disabled={busy || sources.length === 0} size="sm" className="ml-auto">
            {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
            {preview ? 'Re-generate' : 'Generate'}
          </Button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-3 mt-2">
          {sources.length === 0 && (
            <p className="text-sm text-slate-500 italic">This slide has no editable text fields.</p>
          )}
          {preview ? (
            preview.map((p, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{p.field}</div>
                <div className="text-xs text-slate-500 line-through mb-1 whitespace-pre-wrap">{p.before}</div>
                <div className="text-sm text-slate-900 font-medium whitespace-pre-wrap">{p.after}</div>
              </div>
            ))
          ) : (
            sources.map((s, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{s.field}</div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{s.value}</div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={apply} disabled={!preview || busy}>Apply changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
