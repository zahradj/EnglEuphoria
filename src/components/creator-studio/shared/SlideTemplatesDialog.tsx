import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTemplatesForHub, type SlideTemplate, type TemplateKind } from './slideTemplates';

interface Props<TSlide> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hub: TemplateKind;
  /** Hub-specific factory: maps a slide-type string to a default slide. */
  makeSlide: (type: string) => TSlide;
  /** Called with the array of slides built from the chosen template. */
  onInsert: (slides: TSlide[], template: SlideTemplate<TSlide>) => void;
}

export function SlideTemplatesDialog<TSlide = any>({
  open,
  onOpenChange,
  hub,
  makeSlide,
  onInsert,
}: Props<TSlide>) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const templates = useMemo(() => getTemplatesForHub(hub) as SlideTemplate<TSlide>[], [hub]);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    templates.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [templates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (activeCategory !== 'All' && t.category !== activeCategory) return false;
      if (!q) return true;
      return (
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [templates, query, activeCategory]);

  const accent = hub === 'playground'
    ? { ring: 'ring-orange-400', text: 'text-orange-600', bg: 'bg-orange-50', chip: 'bg-orange-100 text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600' }
    : { ring: 'ring-indigo-400', text: 'text-indigo-600', bg: 'bg-indigo-50', chip: 'bg-indigo-100 text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-500' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className={cn('w-5 h-5', accent.text)} />
            Slide Templates
          </DialogTitle>
          <DialogDescription>
            Drop in pre-built slide groups to speed up authoring. Templates append to the end of your deck.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={cn(
                  'text-xs font-semibold px-3 py-1 rounded-full border transition',
                  activeCategory === c
                    ? cn(accent.chip, 'border-transparent')
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto -mx-6 px-6 pt-2 pb-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center text-sm text-slate-500 py-12">
              No templates match your search.
            </div>
          ) : (
            filtered.map((tpl) => {
              const slides = tpl.build(makeSlide);
              return (
                <button
                  key={tpl.id}
                  onClick={() => {
                    onInsert(slides, tpl);
                    onOpenChange(false);
                  }}
                  className={cn(
                    'group text-left border border-slate-200 bg-white rounded-xl p-4 transition hover:border-slate-300 hover:shadow-md',
                    'focus:outline-none focus:ring-2', accent.ring
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tpl.emoji}</span>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{tpl.label}</div>
                        <div className={cn('text-[10px] font-semibold uppercase tracking-wider', accent.text)}>
                          {tpl.category}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-1">
                      {slides.length} slide{slides.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{tpl.description}</p>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
