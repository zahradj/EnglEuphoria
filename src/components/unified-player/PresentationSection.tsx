/**
 * Renders a `mode: 'presentation'` UnifiedMoment — the PPP-style beats
 * (intro, vocab/phonics discovery, storybook, reward summary) using the
 * existing 9 LessonBlock kinds from src/game-runtime/engine/types.ts.
 */
import type { UnifiedMoment } from '@/unified-lessons/types';
import { useHubTheme } from './HubTheme';

function BlockView({ block }: { block: UnifiedMoment['blocks'][number] }) {
  switch (block.type) {
    case 'intro':
      return (
        <div className="text-center">
          <h1 className="text-4xl font-black" style={{ color: 'var(--unified-accent)' }}>{block.title}</h1>
          {block.subtitle && <p className="mt-2 text-lg text-slate-600">{block.subtitle}</p>}
        </div>
      );
    case 'vocab_solo':
      return (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xl font-black text-slate-800">{block.word}</div>
          <p className="mt-1 text-slate-600">{block.definition}</p>
        </div>
      );
    case 'phonics_focus':
      return (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xl font-black text-slate-800">/{block.sound}/</div>
          <p className="mt-1 text-slate-600">{block.examples.join(', ')}</p>
        </div>
      );
    case 'storybook':
      return (
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-slate-800">{block.title}</h2>
          {block.pages.map((page, i) => (
            <p key={i} className="rounded-xl bg-slate-50 p-4 text-slate-700">{page.text}</p>
          ))}
        </div>
      );
    case 'lesson_summary':
      return (
        <div className="text-center">
          <h2 className="text-3xl font-black" style={{ color: 'var(--unified-accent)' }}>{block.title}</h2>
          <ul className="mx-auto mt-3 max-w-md space-y-2 text-left">
            {block.bullets.map((b, i) => (
              <li key={i} className="rounded-lg bg-slate-50 px-4 py-2 text-slate-700">✓ {b}</li>
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
        className="mx-auto rounded-2xl px-8 py-3 text-lg font-black text-white shadow-md transition-transform hover:scale-105"
        style={{ backgroundColor: theme.accent }}
      >
        {isLast ? 'Finish' : 'Continue'}
      </button>
    </div>
  );
}
