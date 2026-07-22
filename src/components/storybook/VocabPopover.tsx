import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Volume2 } from 'lucide-react';
import type { InlineVocab } from '@/storybook/types';

export function VocabPopover({ vocab, onLookup, children }: { vocab: InlineVocab; onLookup?: () => void; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={onLookup}
          className="underline decoration-dotted decoration-primary underline-offset-4 text-primary hover:bg-primary/10 rounded px-0.5"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{vocab.word}</h4>
            {vocab.audio_url && (
              <button
                type="button"
                onClick={() => new Audio(vocab.audio_url!).play().catch(() => {})}
                className="text-primary hover:text-primary/80"
                aria-label="Play pronunciation"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {vocab.pronunciation_ipa && (
            <p className="text-xs text-muted-foreground font-mono">/{vocab.pronunciation_ipa}/</p>
          )}
          <p className="text-sm">{vocab.definition}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
