// Renders narrative text with inline vocab popovers.
import { Fragment } from 'react';
import type { InlineVocab } from '@/storybook/types';
import { VocabPopover } from './VocabPopover';

export function RichText({ text, vocab, onLookup }: { text: string; vocab: InlineVocab[]; onLookup?: (w: string) => void }) {
  if (!vocab.length) return <>{text}</>;
  const lookup = new Map(vocab.map((v) => [v.word.toLowerCase(), v]));
  const parts = text.split(/(\b[\w'-]+\b)/g);
  return (
    <>
      {parts.map((part, i) => {
        const v = lookup.get(part.toLowerCase());
        if (v) {
          return (
            <VocabPopover key={i} vocab={v} onLookup={() => onLookup?.(v.word)}>
              {part}
            </VocabPopover>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
