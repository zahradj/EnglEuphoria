import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateSlideVoiceover } from '@/components/creator-studio/steps/slide-studio/mediaGeneration';
import { findSlidesMissingAudio } from './slideAudioHelpers';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slides: any[];
  lessonId: string | null;
  /** Apply patch to a single slide by index (creator's existing reducer). */
  patchSlide: (index: number, patch: Record<string, any>) => void;
  /** Default ElevenLabs voice id. */
  voiceId?: string;
}

type Status = 'idle' | 'running' | 'done' | 'cancelled';

export const BulkAudioDialog: React.FC<Props> = ({
  open, onOpenChange, slides, lessonId, patchSlide,
  voiceId = 'EXAVITQu4vr4xnSDxMaL',
}) => {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [errors, setErrors] = useState<{ index: number; message: string }[]>([]);
  const [currentLabel, setCurrentLabel] = useState<string>('');
  const [cancelRequested, setCancelRequested] = useState(false);

  const candidates = React.useMemo(() => findSlidesMissingAudio(slides), [slides, open]);

  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setTotal(0);
    setErrors([]);
    setCurrentLabel('');
    setCancelRequested(false);
  };

  const handleClose = () => {
    if (status === 'running') return; // block close while running
    reset();
    onOpenChange(false);
  };

  const start = async () => {
    if (!lessonId) {
      toast.error('Save the lesson once before generating audio.');
      return;
    }
    if (candidates.length === 0) return;
    setStatus('running');
    setTotal(candidates.length);
    setProgress(0);
    setErrors([]);
    setCancelRequested(false);

    let localCancel = false;
    for (let i = 0; i < candidates.length; i++) {
      if (cancelRequested || localCancel) break;
      const c = candidates[i];
      setCurrentLabel(`#${c.index + 1} · "${c.slideTitlePreview}${c.text.length > 60 ? '…' : ''}"`);
      try {
        const asset = await generateSlideVoiceover(
          c.text,
          lessonId,
          `slide-${c.index}`,
          voiceId,
        );
        patchSlide(c.index, c.apply(asset.url));
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        setErrors((prev) => [...prev, { index: c.index, message: msg }]);
        // 429 rate-limit → stop the loop early
        if (/rate|429/i.test(msg)) {
          toast.error('Rate-limited by ElevenLabs. Stopping bulk generation.');
          localCancel = true;
        }
      }
      setProgress(i + 1);
      // small delay to be gentle on the API
      if (i < candidates.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    setStatus(localCancel ? 'cancelled' : 'done');
    setCurrentLabel('');
    if (!localCancel) {
      const ok = candidates.length - errors.length;
      toast.success(`Generated audio for ${ok}/${candidates.length} slides.`);
    }
  };

  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : handleClose())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-600" />
            Bulk Audio Generation
          </DialogTitle>
          <DialogDescription>
            Scans your deck and generates ElevenLabs voiceovers for every slide
            that has narratable text but no audio yet.
          </DialogDescription>
        </DialogHeader>

        {status === 'idle' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm">
              {candidates.length === 0 ? (
                <p className="text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  All slides with text already have audio. 🎉
                </p>
              ) : (
                <>
                  <p className="font-semibold text-slate-800 mb-2">
                    {candidates.length} slide{candidates.length === 1 ? '' : 's'} need audio:
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1 max-h-40 overflow-y-auto">
                    {candidates.slice(0, 12).map((c) => (
                      <li key={c.index} className="truncate">
                        <span className="font-mono text-slate-400">#{c.index + 1}</span>{' '}
                        {c.slideTitlePreview}{c.text.length > 60 ? '…' : ''}
                      </li>
                    ))}
                    {candidates.length > 12 && (
                      <li className="text-slate-400">+ {candidates.length - 12} more…</li>
                    )}
                  </ul>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={start}
                disabled={candidates.length === 0 || !lessonId}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                <Mic className="w-4 h-4 mr-1" /> Generate {candidates.length} audio
              </Button>
            </div>
            {!lessonId && (
              <p className="text-xs text-amber-600">
                Save the lesson once before running bulk generation.
              </p>
            )}
          </div>
        )}

        {(status === 'running' || status === 'done' || status === 'cancelled') && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700">
                  Generating audio: {progress} / {total}
                </span>
                <span className="text-slate-500">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
              {currentLabel && (
                <p className="text-xs text-slate-500 mt-2 truncate flex items-center gap-2">
                  {status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {currentLabel}
                </p>
              )}
            </div>

            {errors.length > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 max-h-32 overflow-y-auto">
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {errors.length} error{errors.length === 1 ? '' : 's'}:
                </div>
                <ul className="space-y-0.5">
                  {errors.slice(0, 6).map((e, i) => (
                    <li key={i}>· #{e.index + 1}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {status === 'running' ? (
                <Button variant="outline" onClick={() => setCancelRequested(true)}>
                  <X className="w-4 h-4 mr-1" /> Stop
                </Button>
              ) : (
                <Button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-500">
                  Done
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
