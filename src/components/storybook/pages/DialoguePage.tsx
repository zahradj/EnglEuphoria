import type { PageRendererProps } from '../PageRenderer';
import { RichText } from '../RichText';
import type { DialogueContent } from '@/storybook/types';

export function DialoguePage({ page, onVocabLookup }: PageRendererProps) {
  const data = (page.content as { type: 'dialogue'; data: DialogueContent }).data;
  return (
    <div className="flex flex-col h-full gap-4">
      {page.illustration_url && (
        <img src={page.illustration_url} alt="" className="w-full max-h-56 object-cover rounded-2xl" />
      )}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {data.lines.map((l, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${i % 2 === 0 ? 'bg-muted' : 'bg-primary/15 text-foreground'}`}>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {l.character_id}{l.emotion ? ` · ${l.emotion}` : ''}
              </p>
              <p className="text-base leading-relaxed">
                <RichText text={l.text} vocab={page.vocab_inline ?? []} onLookup={onVocabLookup} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
