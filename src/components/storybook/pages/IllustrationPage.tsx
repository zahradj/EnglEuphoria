import type { PageRendererProps } from '../PageRenderer';
import type { IllustrationContent } from '@/storybook/types';

export function IllustrationPage({ page }: PageRendererProps) {
  const data = (page.content as { type: 'illustration'; data: IllustrationContent }).data;
  return (
    <div className="flex flex-col h-full items-center justify-center gap-4">
      {page.illustration_url ? (
        <img src={page.illustration_url} alt={data.alt} className="max-h-[70vh] w-full object-contain rounded-2xl" />
      ) : (
        <div className="aspect-video w-full bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
          {data.alt}
        </div>
      )}
      {data.caption && <p className="text-center text-muted-foreground italic">{data.caption}</p>}
    </div>
  );
}
