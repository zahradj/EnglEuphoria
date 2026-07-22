import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowLeft } from 'lucide-react';
import { useLessonTemplates, cloneTemplateIntoEditor, type LessonTemplate } from '@/hooks/useLessonTemplates';
import { TemplateCard } from '@/components/creator-studio/marketplace/TemplateCard';
import { TemplatePreviewDialog } from '@/components/creator-studio/marketplace/TemplatePreviewDialog';
import { cn } from '@/lib/utils';

const LEVELS = ['all', 'Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
const HUBS: Array<{ id: 'all' | 'playground' | 'academy'; label: string }> = [
  { id: 'all', label: 'All hubs' },
  { id: 'playground', label: '🧒 Playground' },
  { id: 'academy', label: '🎓 Academy' },
];

export default function TemplateMarketplace() {
  const navigate = useNavigate();
  const [hub, setHub] = useState<'all' | 'playground' | 'academy'>('all');
  const [level, setLevel] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [previewing, setPreviewing] = useState<LessonTemplate | null>(null);

  const { templates, loading, error } = useLessonTemplates({ hub, level, search });

  const grouped = useMemo(() => ({
    playground: templates.filter((t) => t.hub === 'playground').length,
    academy: templates.filter((t) => t.hub === 'academy').length,
  }), [templates]);

  const handleClone = async (t: LessonTemplate) => {
    await cloneTemplateIntoEditor(t, navigate);
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/content-creator')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Creator Studio
        </button>

        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-indigo-600" /> Template Marketplace
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse {templates.length} ready-to-teach lessons · {grouped.playground} Playground · {grouped.academy} Academy
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lessons…"
              className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm w-72"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {HUBS.map((h) => (
            <button key={h.id} onClick={() => setHub(h.id)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-bold border transition',
                hub === h.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-500')}>
              {h.label}
            </button>
          ))}
          <span className="w-px bg-slate-200 mx-2" />
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-bold border transition',
                level === l ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-300 text-slate-600 hover:border-indigo-400')}>
              {l === 'all' ? 'All levels' : l}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading templates…</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No templates yet. Be the first to publish one from any creator!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onPreview={() => setPreviewing(t)}
                onClone={() => handleClone(t)}
              />
            ))}
          </div>
        )}
      </div>

      <TemplatePreviewDialog
        template={previewing}
        open={!!previewing}
        onOpenChange={(o) => { if (!o) setPreviewing(null); }}
        onClone={() => previewing && handleClone(previewing)}
      />
    </div>
  );
}
