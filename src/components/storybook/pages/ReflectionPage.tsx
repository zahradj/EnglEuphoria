import type { PageRendererProps } from '../PageRenderer';
import type { ReflectionContent } from '@/storybook/types';
import { Textarea } from '@/components/ui/textarea';

export function ReflectionPage({ page }: PageRendererProps) {
  const data = (page.content as { type: 'reflection'; data: ReflectionContent }).data;
  return (
    <div className="flex flex-col h-full justify-center gap-6 px-2">
      <span className="text-xs uppercase tracking-widest text-primary font-semibold">{data.style === 'emotional' ? 'How do you feel?' : 'Reflect'}</span>
      <h3 className="text-2xl md:text-3xl font-semibold text-foreground">{data.prompt}</h3>
      <Textarea placeholder="Write your thoughts…" rows={6} className="rounded-2xl" />
    </div>
  );
}
