import { Backpack, BookText, Clock, Headphones, Mic, PenLine, Sparkles } from 'lucide-react';
import { buildPreviewHomeworkPack } from '@/components/lesson-player/buildPreviewHomeworkPack';
import type { HomeworkTask } from '@/coherence/types';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';

type HomeworkPreviewHub = 'playground' | 'academy' | 'success' | 'professional';

interface HomeworkSlidesPreviewProps {
  hub: HomeworkPreviewHub;
  title: string;
  slides: Record<string, any>[];
  selectedTaskIndex?: number | null;
  onSelect?: (task: HomeworkTask, index: number) => void;
}

const MODALITY_ICON: Record<HomeworkTask['modality'], typeof Mic> = {
  speaking: Mic,
  listening: Headphones,
  reading: BookText,
  writing: PenLine,
  mixed: Sparkles,
};

const HUB_STYLES: Record<HomeworkPreviewHub, { accent: string; bg: string; border: string; text: string }> = {
  playground: { accent: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  academy: { accent: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  success: { accent: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  professional: { accent: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
};

export function HomeworkSlidesPreview({ hub, title, slides, selectedTaskIndex, onSelect }: HomeworkSlidesPreviewProps) {
  const style = HUB_STYLES[hub];
  const packHub: HubType = hub === 'success' ? 'professional' : hub;
  const pack = buildPreviewHomeworkPack(packHub, title, slides);

  if (!pack.tasks.length) return null;

  return (
    <div className={`mt-3 border-t ${style.border} pt-3`} aria-label="Homework slides preview">
      <div className={`rounded-xl border ${style.border} ${style.bg} p-2`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${style.text}`}>
            <Backpack className="w-3.5 h-3.5" /> Homework Slides Preview
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <Clock className="w-3 h-3" /> {pack.total_minutes}m
          </div>
        </div>
        <div className="text-[10px] font-semibold text-slate-500 mb-2">Appears after Auto-Summary</div>
        <div className="space-y-1.5">
          {pack.tasks.map((task, index) => {
            const Icon = MODALITY_ICON[task.modality] || Sparkles;
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelect?.(task, index)}
                className={`w-full text-left rounded-lg border p-2 shadow-sm transition ${
                  selectedTaskIndex === index
                    ? `${style.border} bg-white ring-2 ring-current/20 ${style.text}`
                    : 'border-white/80 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${style.text}`}>
                    <Icon className="w-3 h-3" /> HW {index + 1}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{task.estimated_minutes} min</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-700 line-clamp-2">{task.prompt}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}