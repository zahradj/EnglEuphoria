import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VocabularyItem {
  word: string;
  definition: string;
}

interface VocabularyRecallBoxProps {
  vocabulary: VocabularyItem[];
  cohortGroup: 'A' | 'B' | 'C';
  defaultOpen?: boolean;
}

const COHORT_STYLES = {
  A: {
    border: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-blue-50/50 dark:bg-blue-950/50',
    headerBg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-700 dark:text-blue-300',
    wordBg: 'bg-blue-100 dark:bg-blue-900',
  },
  B: {
    border: 'border-amber-200 dark:border-amber-800',
    bg: 'bg-amber-50/50 dark:bg-amber-950/50',
    headerBg: 'bg-amber-100 dark:bg-amber-900',
    text: 'text-amber-700 dark:text-amber-300',
    wordBg: 'bg-amber-100 dark:bg-amber-900',
  },
  C: {
    border: 'border-emerald-200 dark:border-emerald-800',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/50',
    headerBg: 'bg-emerald-100 dark:bg-emerald-900',
    text: 'text-emerald-700 dark:text-emerald-300',
    wordBg: 'bg-emerald-100 dark:bg-emerald-900',
  },
};

export const VocabularyRecallBox: React.FC<VocabularyRecallBoxProps> = ({
  vocabulary,
  cohortGroup,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const styles = COHORT_STYLES[cohortGroup];

  if (!vocabulary || vocabulary.length === 0) {
    return null;
  }

  return (
    <Card className={cn('border-2', styles.border, styles.bg)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className={cn('cursor-pointer rounded-t-lg transition-colors hover:opacity-90', styles.headerBg)}>
            <CardTitle className={cn('flex items-center justify-between text-base', styles.text)}>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Key Vocabulary
                <span className="text-sm font-normal opacity-75">
                  ({vocabulary.length} {vocabulary.length === 1 ? 'term' : 'terms'})
                </span>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-3">
            {vocabulary.map((item, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <span className={cn(
                  'inline-flex items-center justify-center px-2.5 py-1 rounded-md text-sm font-semibold',
                  styles.wordBg,
                  styles.text
                )}>
                  {item.word}
                </span>
                <span className="text-muted-foreground text-sm pt-0.5">
                  {item.definition}
                </span>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
