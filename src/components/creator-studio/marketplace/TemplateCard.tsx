import React from 'react';
import { Copy, Eye, Layers, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonTemplate } from '@/hooks/useLessonTemplates';

interface Props {
  template: LessonTemplate;
  onPreview: () => void;
  onClone: () => void;
}

export const TemplateCard: React.FC<Props> = ({ template, onPreview, onClone }) => {
  const isPlayground = template.hub === 'playground';
  const accent = isPlayground
    ? 'from-orange-100 to-yellow-50 border-orange-200'
    : 'from-indigo-100 to-purple-50 border-indigo-200';
  const badge = isPlayground
    ? 'bg-orange-500 text-white'
    : 'bg-indigo-600 text-white';

  return (
    <div className={cn('group rounded-2xl border bg-gradient-to-br p-4 flex flex-col gap-3 transition hover:shadow-lg', accent)}>
      <div className="aspect-video rounded-lg bg-white/60 overflow-hidden flex items-center justify-center">
        {template.cover_image_url ? (
          <img src={template.cover_image_url} alt={template.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Layers className="w-10 h-10 text-slate-300" />
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{template.title}</h3>
        {template.level && <span className={cn('shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full', badge)}>{template.level}</span>}
      </div>

      {template.description && (
        <p className="text-xs text-slate-600 line-clamp-2">{template.description}</p>
      )}

      {template.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] bg-white/80 border border-slate-200 text-slate-600 rounded-full px-2 py-0.5">#{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-auto">
        <span>{template.slide_count} slides</span>
        <span className="inline-flex items-center gap-1"><Download className="w-3 h-3" /> {template.clone_count}</span>
      </div>

      <div className="flex gap-2">
        <button onClick={onPreview} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg px-3 py-2 text-xs font-semibold transition">
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button onClick={onClone} className={cn('flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition', badge, 'hover:opacity-90')}>
          <Copy className="w-3.5 h-3.5" /> Clone
        </button>
      </div>
    </div>
  );
};
