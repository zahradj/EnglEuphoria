import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type StorybookPage = {
  page_number: number;
  text: string;
  image_url?: string;
  audio_url?: string;
  image_prompt?: string;
};

export type StorybookLayoutMode = 'classic' | 'comic' | 'case_study';
export type StorybookTheme =
  | 'adventure' | 'school' | 'mystery' | 'business_trip' | 'negotiation' | 'custom';

export type StorybookSlideShape = {
  type: 'storybook';
  title?: string;
  topic?: string;
  pages: StorybookPage[];
  layout_mode?: StorybookLayoutMode;
  theme?: StorybookTheme;
  highlight_words?: string[];
};

type Hub = 'playground' | 'academy' | 'success';

interface Props {
  slide: StorybookSlideShape;
  hub: Hub;
  onComplete?: () => void;
}

const HUB_THEME: Record<Hub, { wrap: string; arrow: string; pageNum: string; bodyFont: string; titleColor: string; mark: string }> = {
  playground: {
    wrap: 'bg-gradient-to-br from-yellow-100 via-orange-100 to-amber-50 border-orange-300',
    arrow: 'bg-orange-500 hover:bg-orange-600 text-white',
    pageNum: 'text-orange-600',
    bodyFont: 'text-2xl md:text-3xl font-extrabold leading-snug text-slate-800',
    titleColor: 'text-orange-600',
    mark: 'bg-yellow-300/70 text-orange-900 font-black rounded px-1',
  },
  academy: {
    wrap: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-300',
    arrow: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    pageNum: 'text-indigo-600',
    bodyFont: 'text-lg leading-relaxed text-slate-800',
    titleColor: 'text-indigo-700',
    mark: 'bg-indigo-200/70 text-indigo-900 font-bold rounded px-0.5',
  },
  success: {
    wrap: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-300',
    arrow: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    pageNum: 'text-emerald-700',
    bodyFont: 'font-serif text-lg leading-relaxed text-slate-800',
    titleColor: 'text-emerald-700',
    mark: 'bg-emerald-100 text-emerald-900 font-semibold border-b-2 border-emerald-400',
  },
};

const DEFAULT_LAYOUT: Record<Hub, StorybookLayoutMode> = {
  playground: 'classic',
  academy: 'comic',
  success: 'case_study',
};

function HighlightedText({ text, words, markCls }: { text: string; words?: string[]; markCls: string }) {
  const parts = useMemo(() => {
    if (!words || words.length === 0) return [{ t: text, hl: false }];
    const escaped = words
      .filter(Boolean)
      .map((w) => w.trim())
      .filter((w) => w.length > 0)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (escaped.length === 0) return [{ t: text, hl: false }];
    const re = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
    const out: { t: string; hl: boolean }[] = [];
    let last = 0;
    text.replace(re, (m, _g, idx: number) => {
      if (idx > last) out.push({ t: text.slice(last, idx), hl: false });
      out.push({ t: m, hl: true });
      last = idx + m.length;
      return m;
    });
    if (last < text.length) out.push({ t: text.slice(last), hl: false });
    return out;
  }, [text, words]);

  return (
    <>
      {parts.map((p, i) =>
        p.hl ? <mark key={i} className={markCls}>{p.t}</mark> : <span key={i}>{p.t}</span>,
      )}
    </>
  );
}

export function StorybookRenderer({ slide, hub, onComplete }: Props) {
  const theme = HUB_THEME[hub];
  const layout: StorybookLayoutMode = slide.layout_mode || DEFAULT_LAYOUT[hub];
  const pages = slide.pages || [];
  const [idx, setIdx] = useState(0);
  const [completedFired, setCompletedFired] = useState(false);

  if (pages.length === 0) {
    return (
      <div className={`w-full rounded-3xl border-4 p-10 text-center ${theme.wrap}`}>
        <div className="text-5xl mb-3">📖</div>
        <p className="text-slate-600 font-semibold">No story pages yet — generate one in the editor.</p>
      </div>
    );
  }

  const safeIdx = Math.min(idx, pages.length - 1);
  const page = pages[safeIdx];
  const isFirst = safeIdx === 0;
  const isLast = safeIdx === pages.length - 1;

  const next = () => {
    if (isLast) {
      if (!completedFired) { setCompletedFired(true); onComplete?.(); }
      return;
    }
    const n = safeIdx + 1;
    setIdx(n);
    if (n === pages.length - 1 && !completedFired) {
      setCompletedFired(true);
      onComplete?.();
    }
  };

  const Body = (
    <div className={theme.bodyFont}>
      <HighlightedText text={page.text} words={slide.highlight_words} markCls={theme.mark} />
    </div>
  );

  // CLASSIC: full image top, big text bottom
  if (layout === 'classic') {
    return (
      <div className={`w-full rounded-3xl border-4 ${theme.wrap} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`text-xs font-extrabold uppercase tracking-wider ${theme.titleColor}`}>📖 {slide.title || 'Story'}</div>
          <div className={`text-sm font-extrabold ${theme.pageNum}`}>Page {safeIdx + 1} / {pages.length}</div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={safeIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="rounded-2xl overflow-hidden border-4 border-orange-300 bg-white aspect-[16/9] flex items-center justify-center mb-4">
              {page.image_url ? <img src={page.image_url} alt="" className="w-full h-full object-cover" /> : <div className="text-7xl">🖼️</div>}
            </div>
            <div className="text-center px-2">{Body}</div>
          </motion.div>
        </AnimatePresence>
        {page.audio_url && <audio controls src={page.audio_url} className="w-full mt-4" />}
        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => setIdx(Math.max(0, safeIdx - 1))} disabled={isFirst} className={`rounded-full p-3 disabled:opacity-30 ${theme.arrow}`}><ChevronLeft className="w-7 h-7" /></button>
          <div className="flex gap-1.5">
            {pages.map((_, i) => <span key={i} className={`w-2.5 h-2.5 rounded-full ${i === safeIdx ? 'bg-orange-500' : 'bg-orange-200'}`} />)}
          </div>
          <button onClick={next} disabled={isLast} className={`rounded-full p-3 disabled:opacity-30 ${theme.arrow}`}><ChevronRight className="w-7 h-7" /></button>
        </div>
      </div>
    );
  }

  // COMIC: panel layout with speech bubble
  if (layout === 'comic') {
    return (
      <div className={`w-full rounded-2xl border-2 ${theme.wrap} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${theme.titleColor}`}>💥 {slide.title || 'Comic Story'}</h3>
          <span className={`text-xs font-bold ${theme.pageNum}`}>Panel {safeIdx + 1} / {pages.length}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={safeIdx} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border-4 border-indigo-900 bg-white aspect-square shadow-[6px_6px_0_0_rgba(49,46,129,0.9)]">
              {page.image_url ? <img src={page.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl">💭</div>}
            </div>
            <div className="relative bg-white border-4 border-indigo-900 rounded-2xl p-5 shadow-[6px_6px_0_0_rgba(49,46,129,0.9)]">
              <div className="absolute -left-3 top-8 w-0 h-0 border-y-8 border-y-transparent border-r-[14px] border-r-indigo-900 hidden md:block" />
              {Body}
              {page.audio_url && <audio controls src={page.audio_url} className="w-full mt-4" />}
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="mt-5 flex items-center justify-between">
          <button onClick={() => setIdx(Math.max(0, safeIdx - 1))} disabled={isFirst} className={`rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-30 ${theme.arrow}`}>← Prev</button>
          <button onClick={next} disabled={isLast} className={`rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-30 ${theme.arrow}`}>Next →</button>
        </div>
      </div>
    );
  }

  // CASE STUDY: clean vertical, key-terms sidebar
  return (
    <div className={`w-full rounded-2xl border ${theme.wrap} p-7`}>
      <div className="flex items-center justify-between border-b border-emerald-200 pb-3 mb-4">
        <h3 className={`text-xl font-bold ${theme.titleColor}`}>Case Study · {slide.title || 'Scenario'}</h3>
        <span className={`text-xs font-semibold tracking-wide ${theme.pageNum}`}>PAGE {safeIdx + 1} OF {pages.length}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={safeIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 items-start">
          <div>
            {page.image_url && (
              <div className="rounded-lg overflow-hidden border border-emerald-200 bg-white aspect-[16/9] mb-4">
                <img src={page.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            {Body}
            {page.audio_url && <audio controls src={page.audio_url} className="w-full mt-4" />}
          </div>
          {(slide.highlight_words?.length ?? 0) > 0 && (
            <aside className="rounded-lg border border-emerald-200 bg-white/70 p-4">
              <div className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold mb-2">Key terms</div>
              <ul className="space-y-1.5">
                {slide.highlight_words!.slice(0, 8).map((w) => (
                  <li key={w} className="text-sm text-slate-700"><span className="font-semibold text-emerald-800">{w}</span></li>
                ))}
              </ul>
            </aside>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => setIdx(Math.max(0, safeIdx - 1))} disabled={isFirst} className={`rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-30 ${theme.arrow}`}>← Previous</button>
        <button onClick={next} disabled={isLast} className={`rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-30 ${theme.arrow}`}>Continue →</button>
      </div>
    </div>
  );
}

export default StorybookRenderer;
