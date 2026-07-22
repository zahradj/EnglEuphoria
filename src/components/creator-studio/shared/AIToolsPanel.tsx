import { Wand2, Sparkles, MessageSquare } from 'lucide-react';
import type { Hub } from './hubTheme';
import { SlideCommentsPanel } from './SlideCommentsPanel';

interface Props {
  hub: Hub;
  lessonId?: string | null;
  slideId?: string | null;
  onTuneDifficulty: () => void;
}

const HUB_ACCENT: Record<Hub, { btn: string; ring: string; text: string }> = {
  playground: { btn: 'border-orange-300 hover:bg-orange-50', ring: 'border-orange-200', text: 'text-orange-700' },
  academy:    { btn: 'border-indigo-300 hover:bg-indigo-50', ring: 'border-indigo-200', text: 'text-indigo-700' },
  success:    { btn: 'border-emerald-300 hover:bg-emerald-50', ring: 'border-emerald-200', text: 'text-emerald-700' },
};

/**
 * Right-sidebar "AI Tools" tab. Houses the slide-level rewriting tools and
 * the inline comments panel so the editor stays focused on content.
 */
export function AIToolsPanel({ hub, lessonId, slideId, onTuneDifficulty }: Props) {
  const a = HUB_ACCENT[hub];
  return (
    <div className="space-y-5">
      <section>
        <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${a.text}`}>
          <Sparkles className="inline w-3.5 h-3.5 mr-1" /> Slide-level AI
        </h3>
        <button
          onClick={onTuneDifficulty}
          className={`w-full inline-flex items-center justify-center gap-2 text-sm font-semibold border ${a.btn} rounded-lg px-3 py-2`}
        >
          <Wand2 className="w-4 h-4" /> Tune difficulty (CEFR)
        </button>
        <p className="text-xs text-slate-500 mt-2">
          Rewrites the whole slide easier/harder while keeping the lesson blueprint intact.
          Use the 🪄 buttons next to individual fields for focused tweaks.
        </p>
      </section>

      <section className={`rounded-xl border ${a.ring} bg-white/60 p-3`}>
        <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${a.text}`}>
          <MessageSquare className="inline w-3.5 h-3.5 mr-1" /> Slide comments
        </h3>
        <SlideCommentsPanel lessonId={lessonId} slideId={slideId} hub={hub} />
      </section>
    </div>
  );
}

export default AIToolsPanel;
