import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, Headphones } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { detectMediaKind, type MediaPlayerSlideShape } from './MediaPlayerRenderer';

type Hub = 'playground' | 'academy' | 'success';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  hub: Hub;
  cefrLevel?: string;
  /** Called when ready: returns the new media slide and any auto-quiz slides to append. */
  onCreate: (mediaSlide: MediaPlayerSlideShape, quizSlides: any[]) => void;
}

const HUB_BTN: Record<Hub, string> = {
  playground: 'from-fuchsia-500 to-orange-500',
  academy: 'from-indigo-600 to-purple-600',
  success: 'from-emerald-600 to-teal-600',
};

export function MediaAnalyzerModal({ open, onOpenChange, hub, cefrLevel, onCreate }: Props) {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => { setUrl(''); setTranscript(''); setTitle(''); setBusy(false); };

  const submit = async () => {
    if (!url.trim()) { toast.error('Media URL is required'); return; }
    if (transcript.trim().length < 30) { toast.error('A transcript (min ~30 chars) is required to generate comprehension'); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-media', {
        body: {
          transcript: transcript.trim(),
          media_url: url.trim(),
          cefr_level: cefrLevel || (hub === 'playground' ? 'A1' : hub === 'academy' ? 'B1' : 'B2'),
          hub_type: hub,
        },
      });
      if (error) throw error;
      const quiz = Array.isArray(data?.quiz_slides) ? data.quiz_slides : [];
      const mediaSlide: MediaPlayerSlideShape = {
        type: 'media_player',
        title: title.trim() || 'Listening Exercise',
        media_url: url.trim(),
        media_kind: detectMediaKind(url.trim()),
        transcript: transcript.trim(),
      };
      onCreate(mediaSlide, quiz);
      toast.success(`Added media slide + ${quiz.length} comprehension questions`);
      reset();
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Media analysis failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Headphones className="w-5 h-5" /> Add Listening Exercise
              </div>
              <button onClick={() => onOpenChange(false)} className="text-slate-500 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Title (optional)</label>
                <input className="w-full rounded-lg border px-3 py-2 text-sm mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. TED Talk: Body language" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Media URL <span className="text-red-500">*</span></label>
                <input className="w-full rounded-lg border px-3 py-2 text-sm mt-1" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube link or .mp3/.mp4 URL" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Transcript <span className="text-red-500">*</span></label>
                <textarea className="w-full rounded-lg border px-3 py-2 text-sm mt-1 h-32 resize-none" value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste the transcript or main script here. Required to generate accurate comprehension questions." />
              </div>
              <p className="text-[11px] text-slate-500">
                AI will append <strong>{hub === 'playground' ? '2 simple' : hub === 'academy' ? '3-4' : '4-5 analytical'}</strong> comprehension quiz slides immediately after the media player.
              </p>
            </div>
            <div className="px-5 py-3 border-t bg-slate-50 flex justify-end gap-2">
              <button disabled={busy} onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50">Cancel</button>
              <button disabled={busy} onClick={submit} className={`px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${HUB_BTN[hub]} shadow inline-flex items-center gap-2 disabled:opacity-50`}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {busy ? 'Generating…' : 'Generate Comprehension'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MediaAnalyzerModal;
