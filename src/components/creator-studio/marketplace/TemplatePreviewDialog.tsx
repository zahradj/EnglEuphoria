import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import type { LessonTemplate } from '@/hooks/useLessonTemplates';

interface Props {
  template: LessonTemplate | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onClone: () => void;
}

export const TemplatePreviewDialog: React.FC<Props> = ({ template, open, onOpenChange, onClone }) => {
  if (!template) return null;
  const slides: any[] = Array.isArray(template.payload?.slides) ? template.payload.slides : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.title}
            {template.level && <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{template.level}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {template.description && <p className="text-sm text-slate-600 mb-3">{template.description}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {slides.map((s, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">#{i + 1} · {s.type || 'slide'}</div>
                <div className="text-xs font-semibold text-slate-800 line-clamp-2">
                  {s.title || s.prompt || s.question || s.statement || s.passage?.slice(0, 80) || '(no title)'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={onClone}><Copy className="w-4 h-4 mr-2" /> Clone into editor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
