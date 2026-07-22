import type { PageRendererProps } from '../PageRenderer';
import type { VocabSpotlightContent } from '@/storybook/types';
import { Volume2 } from 'lucide-react';

export function VocabSpotlightPage({ page }: PageRendererProps) {
  const data = (page.content as { type: 'vocab_spotlight'; data: VocabSpotlightContent }).data;
  const audio = page.audio_url;
  return (
    <div className="flex flex-col h-full items-center justify-center text-center gap-6 px-6">
      <span className="text-xs uppercase tracking-widest text-primary font-semibold">New word</span>
      <h2 className="text-5xl md:text-6xl font-bold text-foreground">{data.word}</h2>
      {data.pronunciation_ipa && (
        <p className="text-lg text-muted-foreground font-mono">/{data.pronunciation_ipa}/</p>
      )}
      {audio && (
        <button
          type="button"
          onClick={() => new Audio(audio).play().catch(() => {})}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90"
        >
          <Volume2 className="h-4 w-4" /> Listen
        </button>
      )}
      <p className="text-xl text-foreground max-w-xl">{data.definition}</p>
      <p className="text-base italic text-muted-foreground max-w-xl">"{data.example}"</p>
    </div>
  );
}
