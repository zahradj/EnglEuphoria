import type { StorybookPage } from '@/storybook/types';
import { ComicLayout } from './comic/ComicLayout';
import { VocabSpotlightPage } from './pages/VocabSpotlightPage';
import { ComprehensionPage } from './pages/ComprehensionPage';
import { SpeakingCheckpointPage } from './pages/SpeakingCheckpointPage';
import { InteractionPage } from './pages/InteractionPage';
import { ReflectionPage } from './pages/ReflectionPage';

export interface PageRendererProps {
  page: StorybookPage;
  onVocabLookup?: (word: string) => void;
  onComprehension?: (correct: boolean) => void;
  onSpeakingAttempt?: (payload: Record<string, unknown>) => void;
}

export function PageRenderer(props: PageRendererProps) {
  const { page } = props;
  switch (page.page_type) {
    // Comic-rendered story page types
    case 'narration':
    case 'dialogue':
    case 'illustration':
      return <ComicLayout page={page} onVocabLookup={props.onVocabLookup} />;

    // Pedagogy / interactive page types keep their existing renderers
    case 'vocab_spotlight': return <VocabSpotlightPage {...props} />;
    case 'comprehension': return <ComprehensionPage {...props} />;
    case 'speaking_checkpoint': return <SpeakingCheckpointPage {...props} />;
    case 'interaction': return <InteractionPage {...props} />;
    case 'reflection': return <ReflectionPage {...props} />;
    default: return <div className="p-8 text-muted-foreground">Unsupported page type.</div>;
  }
}
