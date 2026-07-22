// Clean digital-storybook page layout.
// One generous illustration per page + a clearly framed caption/dialogue area.
// No duplicated panels, no oversized text boxes drowning the artwork.
import type { StorybookPage, NarrationContent, DialogueContent, IllustrationContent } from '@/storybook/types';
import { ComicPanel } from './ComicPanel';
import { SpeechBubble } from './SpeechBubble';
import { RichText } from '../RichText';

interface Props {
  page: StorybookPage;
  onVocabLookup?: (word: string) => void;
}

function narrationText(page: StorybookPage): string {
  if (page.page_type === 'narration') {
    return (page.content as { data?: NarrationContent })?.data?.text ?? '';
  }
  if (page.page_type === 'illustration') {
    const d = (page.content as { data?: IllustrationContent })?.data;
    return d?.caption || d?.alt || '';
  }
  return '';
}

export function ComicLayout({ page, onVocabLookup }: Props) {
  const altText = narrationText(page) || 'Story illustration';

  // ── Dialogue page ─────────────────────────────────────────
  // Big illustration on top, speech bubbles stacked below.
  if (page.page_type === 'dialogue') {
    const lines = (page.content as { data?: DialogueContent })?.data?.lines ?? [];
    return (
      <div
        dir="ltr"
        className="flex flex-col h-full gap-3 p-2 md:p-4 bg-[hsl(var(--comic-page-bg))] rounded-2xl"
      >
        <ComicPanel
          imageUrl={page.illustration_url ?? undefined}
          alt={altText}
          className="flex-[3] min-h-0"
        />
        <div className="shrink-0 flex flex-col gap-2 max-h-[42%] overflow-y-auto px-1">
          {lines.map((l, i) => (
            <SpeechBubble
              key={i}
              character={l.character_id}
              emotion={l.emotion}
              side={i % 2 === 0 ? 'left' : 'right'}
            >
              <span className="font-sans text-[1.05em] md:text-[1.15em] leading-relaxed">
                <RichText text={l.text} vocab={page.vocab_inline ?? []} onLookup={onVocabLookup} />
              </span>
            </SpeechBubble>
          ))}
        </div>
      </div>
    );
  }

  // ── Narration / illustration page ─────────────────────────
  // One large hero illustration with a single caption strip below it.
  const text = narrationText(page);
  const isShort = text.length < 140;
  return (
    <div
      dir="ltr"
      className="flex flex-col h-full gap-3 p-2 md:p-4 bg-[hsl(var(--comic-page-bg))] rounded-2xl"
    >
      <ComicPanel
        imageUrl={page.illustration_url ?? undefined}
        alt={altText}
        className="flex-[3] min-h-0"
      />
      {text && (
        <div className="shrink-0 max-h-[38%] overflow-y-auto rounded-xl border-2 border-[hsl(var(--comic-caption-border))] bg-[hsl(var(--comic-caption-bg))] px-5 md:px-7 py-4 md:py-5 shadow-[4px_4px_0_0_hsl(var(--comic-caption-border))]">
          <p
            className={
              'font-serif text-[hsl(var(--comic-caption-fg))] leading-relaxed tracking-[0.005em] ' +
              'text-[1.05em] md:text-[1.2em] lg:text-[1.3em] ' +
              (isShort ? 'text-center italic' : 'text-left')
            }
          >
            <RichText text={text} vocab={page.vocab_inline ?? []} onLookup={onVocabLookup} />
          </p>
        </div>
      )}
    </div>
  );
}
