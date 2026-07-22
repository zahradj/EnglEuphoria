import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'react-i18next';

const HIGHLIGHTS = [
  'C1 Business English',
  'Grammar Wizard',
  'Negotiation Masterclass',
  'IELTS Prep',
  '500 XP',
  '10th session',
  'B2 level',
  'Advanced Vocabulary',
];

const EMOJIS = ['🌟', '🚀', '📅', '🎯', '⚡', '🎧', '🏆', '📚'];

function BadgeItem({ text, emoji, highlight, isDark }: { text: string; emoji: string; highlight: string; isDark: boolean }) {
  // Split on the highlight phrase if present, otherwise just render plain text.
  const idx = text.indexOf(highlight);
  const before = idx >= 0 ? text.slice(0, idx) : text;
  const after = idx >= 0 ? text.slice(idx + highlight.length) : '';

  return (
    <div
      className={`flex-shrink-0 mx-3 px-5 py-2.5 rounded-full backdrop-blur-sm text-sm whitespace-nowrap transition-all duration-300 ${
        isDark
          ? 'bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-slate-300'
          : 'bg-white/80 border border-slate-200/60 text-slate-600 shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:border-slate-300 hover:text-slate-700'
      }`}
    >
      {emoji}{' '}
      {before}
      {idx >= 0 && (
        <span
          className={`font-semibold ${
            isDark
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600'
          }`}
        >
          {highlight}
        </span>
      )}
      {after}
    </div>
  );
}

export function ActivityMarquee() {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { t } = useTranslation();

  const badges = HIGHLIGHTS.map((highlight, i) => ({
    text: t(`lp.marquee.${i}`),
    emoji: EMOJIS[i],
    highlight,
  }));

  return (
    <section className={`py-8 overflow-hidden relative transition-colors duration-300 ${
      isDark ? 'bg-[#09090B]' : 'bg-[#FAFAFA]'
    }`}>
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div className="flex animate-marquee">
          {[...badges, ...badges].map((badge, i) => (
            <BadgeItem key={i} {...badge} isDark={isDark} />
          ))}
        </div>
      </div>
      <div className="h-12" />
    </section>
  );
}
