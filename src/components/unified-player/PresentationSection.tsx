/**
 * Renders a `mode: 'presentation'` UnifiedMoment — the PPP-style beats
 * (intro, vocab/phonics discovery, storybook, reward summary) using the
 * existing 9 LessonBlock kinds from src/game-runtime/engine/types.ts.
 *
 * Light cards on a white page (see UnifiedLessonPlayer) — hub identity
 * comes through as accent-colored headings and a gradient CTA, not a full
 * backdrop wash, so the reading content stays the focus.
 */
import type { UnifiedMoment } from '@/unified-lessons/types';
import { useHubTheme } from './HubTheme';

function BlockView({ block }: { block: UnifiedMoment['blocks'][number] }) {
  switch (block.type) {
    case 'intro':
      if (block.heroImageUrl) {
        return (
          <div className="relative overflow-hidden rounded-3xl shadow-md ring-1 ring-slate-200">
            <img src={block.heroImageUrl} alt="" className="h-64 w-full object-cover sm:h-80" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)' }} />
            <div className="absolute inset-x-0 bottom-0 p-6 text-center sm:p-8">
              <h1 className="text-3xl font-black text-white drop-shadow-lg sm:text-4xl">{block.title}</h1>
              {block.subtitle && <p className="mx-auto mt-2 max-w-md text-base font-medium text-white/95 drop-shadow sm:text-lg">{block.subtitle}</p>}
            </div>
          </div>
        );
      }
      return (
        <div className="rounded-3xl bg-slate-50 p-8 text-center ring-1 ring-slate-200">
          <h1 className="text-4xl font-black sm:text-5xl" style={{ color: 'var(--unified-accent)' }}>{block.title}</h1>
          {block.subtitle && <p className="mx-auto mt-3 max-w-md text-lg font-medium text-slate-600">{block.subtitle}</p>}
        </div>
      );
    case 'vocab_solo':
      return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-xl font-black text-slate-800">{block.word}</div>
          <p className="mt-1 text-slate-600">{block.definition}</p>
        </div>
      );
    case 'phonics_focus':
      return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-xl font-black text-slate-800">/{block.sound}/</div>
          <p className="mt-1 text-slate-600">{block.examples.join(', ')}</p>
        </div>
      );
    case 'storybook':
      return (
        <div className="space-y-3 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <h2 className="text-2xl font-black" style={{ color: 'var(--unified-accent)' }}>{block.title}</h2>
          {block.pages.map((page, i) => (
            <p key={i} className="rounded-xl bg-white p-4 text-slate-700 shadow-sm">{page.text}</p>
          ))}
        </div>
      );
    case 'lesson_summary':
      return (
        <div className="rounded-3xl bg-slate-50 p-7 text-center ring-1 ring-slate-200">
          <h2 className="text-3xl font-black" style={{ color: 'var(--unified-accent)' }}>{block.title}</h2>
          <ul className="mx-auto mt-4 max-w-md space-y-2 text-left">
            {block.bullets.map((b, i) => (
              <li key={i} className="rounded-lg bg-white px-4 py-2 text-slate-700 shadow-sm">✓ {b}</li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
}

export function PresentationSection({
  moment,
  onNext,
  isLast,
}: {
  moment: UnifiedMoment;
  onNext: () => void;
  isLast: boolean;
}) {
  const theme = useHubTheme();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5" style={{ ['--unified-accent' as string]: theme.accent }}>
      {moment.blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
      <button
        onClick={onNext}
        className="mx-auto rounded-full px-10 py-4 text-lg font-black text-white shadow-md transition hover:scale-105 active:scale-95"
        style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }}
      >
        {isLast ? 'Finish ✨' : 'Continue →'}
      </button>
    </div>
  );
}
