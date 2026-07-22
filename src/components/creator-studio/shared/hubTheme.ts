export type Hub = 'playground' | 'academy' | 'success';

export interface HubTheme {
  canvasBg: string;     // outer canvas background
  canvasFont: string;   // font class applied on canvas root
  ring: string;         // border accent
  shadow: string;       // drop-shadow class
  corners: string;      // rounded-* class
  accentText: string;
  accentBtn: string;
  dot: string;
}

export const HUB_THEME: Record<Hub, HubTheme> = {
  playground: {
    canvasBg: 'bg-gradient-to-br from-orange-300 via-amber-200 to-yellow-100',
    canvasFont: 'font-fredoka',
    ring: 'border-orange-300',
    shadow: 'shadow-[0_18px_40px_-12px_rgba(254,106,47,0.45)]',
    corners: 'rounded-3xl',
    accentText: 'text-orange-600',
    accentBtn: 'bg-orange-500 hover:bg-orange-600 text-white',
    dot: 'bg-orange-500',
  },
  academy: {
    canvasBg: 'bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.10)_1px,transparent_0)] bg-[length:18px_18px] bg-slate-50',
    canvasFont: 'font-sans',
    ring: 'border-indigo-200',
    shadow: 'shadow-[0_18px_40px_-14px_rgba(79,70,229,0.35)]',
    corners: 'rounded-2xl',
    accentText: 'text-indigo-700',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    dot: 'bg-indigo-600',
  },
  success: {
    canvasBg: 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800',
    canvasFont: 'font-serif',
    ring: 'border-amber-400/30',
    shadow: 'shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]',
    corners: 'rounded-xl',
    accentText: 'text-amber-300',
    accentBtn: 'bg-amber-400 hover:bg-amber-500 text-slate-900',
    dot: 'bg-amber-400',
  },
};
