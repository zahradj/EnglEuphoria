/**
 * Renders a `mode: 'presentation'` UnifiedMoment — the PPP-style beats
 * (intro, vocab/phonics discovery, storybook, reward summary) using the
 * existing 9 LessonBlock kinds from src/game-runtime/engine/types.ts.
 *
 * Styled as glass cards floating over the player's full-bleed scene
 * gradient (see UnifiedLessonPlayer) rather than flat white boxes on a
 * plain background — matches how Playground's SceneRenderer actually
 * achieves its immersive look (layered gradients + blur + glow, not
 * photographic art).
 */
import type { UnifiedMoment } from '@/unified-lessons/types';
import { useHubTheme } from './HubTheme';

function BlockView({ block }: { block: UnifiedMoment['blocks'][number] }) {
  switch (block.type) {
    case 'intro':
      return (
        <div className="rounded-3xl bg-black/25 p-8 text-center shadow-2xl ring-1 ring-white/20 backdrop-blur-md">
          <h1 className="text-4xl font-black text-white drop-shadow-lg sm:text-5xl">{block.title}</h1>
          {block.subtitle && <p className="mx-auto mt-3 max-w-md text-lg font-medium text-white/90 drop-shadow">{block.subtitle}</p>}
        </div>
      );
    case 'vocab_solo':
      return (
        <div className="rounded-2xl bg-white/90 p-5 shadow-xl ring-1 ring-white/60 backdrop-blur-xl">
          <div className="text-xl font-black text-slate-800">{block.word}</div>
          <p className="mt-1 text-slate-600">{block.definition}</p>
        </div>
      );
    case 'phonics_focus':
      return (
        <div className="rounded-2xl bg-white/90 p-5 shadow-xl ring-1 ring-white/60 backdrop-blur-xl">
          <div className="text-xl font-black text-slate-800">/{block.sound}/</div>
          <p className="mt-1 text-slate-600">{block.examples.join(', ')}</p>
        </div>
      );
    case 'storybook':
      return (
        <div className="space-y-3 rounded-3xl bg-black/25 p-6 shadow-2xl ring-1 ring-white/20 backdrop-blur-md">
          <h2 className="text-2xl font-black text-white drop-shadow">{block.title}</h2>
          {block.pages.map((page, i) => (
            <p key={i} className="rounded-xl bg-white/90 p-4 text-slate-700 shadow">{page.text}</p>
          ))}
        </div>
      );
    case 'lesson_summary':
      return (
        <div className="rounded-3xl bg-white/90 p-7 text-center shadow-2xl ring-1 ring-white/60 backdrop-blur-xl">
          <h2 className="text-3xl font-black" style={{ color: 'var(--unified-accent)' }}>{block.title}</h2>
          <ul className="mx-auto mt-4 max-w-md space-y-2 text-left">
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
        className="mx-auto rounded-full px-10 py-4 text-lg font-black text-white shadow-2xl ring-4 ring-white/40 transition hover:scale-105 active:scale-95"
        style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }}
      >
        {isLast ? 'Finish ✨' : 'Continue →'}
      </button>
    </div>
  );
}
