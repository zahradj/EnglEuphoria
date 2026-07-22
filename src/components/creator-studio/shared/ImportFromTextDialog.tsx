import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { handleAIResponse } from '@/lib/aiErrorHandler';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Optional pre-selected hub. If omitted, user picks. */
  defaultHub?: 'playground' | 'academy' | 'success';
}

const STORAGE_KEY = 'engl_imported_lesson_payload';

/**
 * Lets the user paste any raw text → AI converts it into a full slide deck →
 * we stash the result in sessionStorage and navigate to the matching creator,
 * which reads the payload on mount and injects it via setSlides.
 */
export const ImportFromTextDialog: React.FC<Props> = ({ open, onOpenChange, defaultHub }) => {
  const navigate = useNavigate();
  const [hub, setHub] = useState<'playground' | 'academy' | 'success'>(defaultHub || 'academy');
  const [level, setLevel] = useState('B1');
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [slideCount, setSlideCount] = useState(20);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (rawText.trim().length < 60) {
      toast.error('Paste at least 60 characters of source text');
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-extract-lesson-from-text', {
        body: { rawText, hub, level, title, slideCount },
      });
      if (!handleAIResponse({ data, error, onRetry: run, context: 'Lesson Importer' })) {
        setBusy(false);
        return;
      }
      const payload = {
        title: data.title,
        level: data.level,
        slides: data.slides,
        hub: data.hub,
        validation: data.validation,
        importedAt: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      const v = data.validation;
      if (v?.warnings?.length) {
        toast.warning(`Generated ${data.slides.length} slides with ${v.warnings.length} warning(s)`, {
          description: `Vocab ${v.vocabCoverage} · Quiz ${v.quizVerified} · ${v.retries} retry round(s)`,
        });
      } else {
        toast.success(`✅ Generated ${data.slides.length} slides — all checks passed`);
      }
      onOpenChange(false);
      navigate(hub === 'playground' ? '/playground-creator?imported=1' : hub === 'success' ? '/success-creator?imported=1' : '/academy-creator?imported=1');
    } catch (e: any) {
      toast.error(e.message || 'Failed to import lesson');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-indigo-600" /> Import lesson from text
          </DialogTitle>
          <DialogDescription>
            Paste any article, story, or transcript. AI will turn it into a ready-to-teach slide deck.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          {!defaultHub && (
            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase">Hub</span>
              <select value={hub} onChange={(e) => setHub(e.target.value as any)}
                className="w-full mt-1 border border-slate-300 rounded-md px-2 py-2 text-sm">
                <option value="academy">Academy (teens/adults)</option>
                <option value="playground">Playground (kids)</option>
              </select>
            </label>
          )}
          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase">CEFR level</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)}
              className="w-full mt-1 border border-slate-300 rounded-md px-2 py-2 text-sm">
              {['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase">Title (optional)</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 border border-slate-300 rounded-md px-2 py-2 text-sm"
              placeholder="e.g. The history of pizza" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase">Slide count</span>
            <input type="number" min={8} max={40} value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value) || 20)}
              className="w-full mt-1 border border-slate-300 rounded-md px-2 py-2 text-sm" />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-slate-500 uppercase">Source text</span>
          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste an article, story, or transcript (60+ characters)…"
            className="min-h-[220px] font-mono text-xs"
          />
          <span className="text-[10px] text-slate-400">{rawText.length} chars · max ~8000 used</span>
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={run} disabled={busy || rawText.trim().length < 60}>
            {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                  : <><Sparkles className="w-4 h-4 mr-2" /> Generate lesson</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const IMPORTED_LESSON_STORAGE_KEY = STORAGE_KEY;

