import type { PageRendererProps } from '../PageRenderer';
import { RichText } from '../RichText';
import type { NarrationContent } from '@/storybook/types';

export function NarrationPage({ page, onVocabLookup }: PageRendererProps) {
  const data = (page.content as { type: 'narration'; data: NarrationContent }).data;
  return (
    <div className="flex flex-col h-full">
      {page.illustration_url && (
        <div className="flex-shrink-0 mb-6">
          <img src={page.illustration_url} alt="" className="w-full max-h-72 object-cover rounded-2xl" />
        </div>
      )}
      <div className="flex-1 flex items-center">
        <p className="text-xl md:text-2xl leading-relaxed font-serif text-foreground">
          <RichText text={data.text} vocab={page.vocab_inline ?? []} onLookup={onVocabLookup} />
        </p>
      </div>
    </div>
  );
}
