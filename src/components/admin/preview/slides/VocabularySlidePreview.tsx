import React from 'react';
import { Volume2, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { cn } from '@/lib/utils';

interface VocabularyWord {
  word: string;
  ipa?: string;
  definition?: string;
  example?: string;
  partOfSpeech?: string;
}

interface VocabularySlidePreviewProps {
  slide: {
    title?: string;
    content?: {
      words?: VocabularyWord[];
    };
  };
}

function WordCard({ word, index }: { word: VocabularyWord; index: number }) {
  const { speakWord, speakSlow, isLoading, isPlaying } = useTextToSpeech();

  const handlePronounce = () => {
    speakWord(word.word, word.ipa);
  };

  const handleSlowPronounce = () => {
    speakSlow(word.word);
  };

  return (
    <div 
      className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-5 border border-primary/10"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-bold text-foreground">
              {word.word}
            </span>
            {word.partOfSpeech && (
              <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                {word.partOfSpeech}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handlePronounce}
                disabled={isLoading || isPlaying}
                className={cn(
                  "h-8 w-8 p-0 text-primary hover:bg-primary/10",
                  isPlaying && "animate-pulse bg-primary/10"
                )}
                title="Normal speed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSlowPronounce}
                disabled={isLoading || isPlaying}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                title="Slow speed"
              >
                🐢
              </Button>
            </div>
          </div>
          
          {word.ipa && (
            <p className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded inline-block">
              /{word.ipa}/
            </p>
          )}
          
          {word.definition && (
            <p className="text-foreground">
              {word.definition}
            </p>
          )}
          
          {word.example && (
            <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3 mt-2">
              "{word.example}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function VocabularySlidePreview({ slide }: VocabularySlidePreviewProps) {
  const words = slide.content?.words || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">
          {slide.title || 'Vocabulary'}
        </h2>
      </div>

      <div className="grid gap-4">
        {words.map((word, idx) => (
          <WordCard key={idx} word={word} index={idx} />
        ))}
      </div>
    </div>
  );
}
