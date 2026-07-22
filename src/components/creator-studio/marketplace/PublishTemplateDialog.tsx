import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  hub: 'playground' | 'academy' | 'success';
  title: string;
  level?: string;
  slides: any[];
}

export const PublishTemplateDialog: React.FC<Props> = ({ open, onOpenChange, hub, title, level, slides }) => {
  const [tplTitle, setTplTitle] = useState(title || '');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>(() => {
    // Try to auto-detect a cover image from first slide containing one
    for (const s of slides || []) {
      if (typeof s?.imageUrl === 'string') return s.imageUrl;
      if (typeof s?.media?.imageUrl === 'string') return s.media.imageUrl;
    }
    return '';
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (tplTitle.trim().length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }
    if (!Array.isArray(slides) || slides.length < 8) {
      toast.error('Lesson must have at least 8 slides to publish');
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('publish-lesson-template', {
        body: {
          hub,
          title: tplTitle.trim(),
          description: description.trim() || null,
          level,
          coverImageUrl: coverImageUrl.trim() || null,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          slides,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.message || 'Publish failed');
      toast.success('🎉 Published to the Template Marketplace');
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to publish template');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" /> Publish as template
          </DialogTitle>
          <DialogDescription>
            Share this lesson with other creators. They'll be able to clone it into their own editor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase">Title</span>
            <input value={tplTitle} onChange={(e) => setTplTitle(e.target.value)}
              className="w-full mt-1 border border-slate-300 rounded-md px-2 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase">Short description</span>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this lesson cover? Who is it for?"
              className="min-h-[80px] text-sm" />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase">Tags (comma-separated)</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. food, present-simple, conversation"
              className="w-full mt-1 border border-slate-300 rounded-md px-2 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase">Cover image URL (optional)</span>
            <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://…"
              className="w-full mt-1 border border-slate-300 rounded-md px-2 py-2 text-sm" />
          </label>

          <div className="text-[11px] text-slate-500">
            {slides.length} slides · Hub: <strong>{hub}</strong>{level ? <> · Level: <strong>{level}</strong></> : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing…</> : <><Upload className="w-4 h-4 mr-2" /> Publish</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
