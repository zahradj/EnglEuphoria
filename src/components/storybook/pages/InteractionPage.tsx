import type { PageRendererProps } from '../PageRenderer';
import type { InteractionContent } from '@/storybook/types';

export function InteractionPage({ page }: PageRendererProps) {
  const data = (page.content as { type: 'interaction'; data: InteractionContent }).data;
  return (
    <div className="flex flex-col h-full items-center justify-center text-center gap-4 px-6">
      <span className="text-xs uppercase tracking-widest text-primary font-semibold">Interactive moment</span>
      <h3 className="text-2xl font-semibold capitalize">{data.kind.replace(/_/g, ' ')}</h3>
      <div className="w-full max-w-md rounded-2xl border-2 border-dashed border-border p-8 text-muted-foreground">
        <pre className="text-xs text-left whitespace-pre-wrap">{JSON.stringify(data.payload, null, 2)}</pre>
      </div>
      <p className="text-sm text-muted-foreground">Interactive renderer wires here next.</p>
    </div>
  );
}
