import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { InlineEditableText } from './InlineEditableText';
import { cn } from '@/lib/utils';

export interface LessonBlock {
  id: string;
  type?: string;
  title?: string;
  prompt?: string;
  question?: string;
  hint?: string;
  text?: string;
  word?: string;
  definition?: string;
  // tolerated freeform shape — we treat blocks as opaque editable cards
  [k: string]: any;
}

interface SortableBlockCardProps {
  block: LessonBlock;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<LessonBlock>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  vocab_solo: 'Vocabulary',
  vocab_flashcard: 'Vocabulary',
  grammar_matrix: 'Grammar Matrix',
  grammar_discovery: 'Grammar Discovery',
  storybook: 'Storybook',
  sentence_builder: 'Sentence Builder',
  drag_drop: 'Drag & Drop',
  matching_pairs: 'Matching Pairs',
  bubble_pop: 'Bubble Pop',
  memory_flip: 'Memory Flip',
  spinning_wheel_prompts: 'Spinning Wheel',
  voice_mimic: 'Voice Mimic',
  voice_mimic_check: 'Voice Mimic',
  multiple_choice: 'Quiz',
  fill_blank: 'Fill in the Blank',
  dialogue_comic: 'Dialogue Comic',
  error_detection: 'Error Detection',
  opinion_debate_voice: 'Debate',
  phonics_focus: 'Phonics',
  case_study_brief: 'Case Study',
  lexical_chunk_cards: 'Lexical Chunks',
  ai_roleplay_simulation: 'AI Roleplay',
};

function summarize(block: LessonBlock): string {
  return (
    block.title ||
    block.prompt ||
    block.question ||
    block.text ||
    block.word ||
    block.definition ||
    (block.type ? `Untitled ${block.type}` : 'Untitled block')
  );
}

export const SortableBlockCard: React.FC<SortableBlockCardProps> = ({
  block,
  index,
  expanded,
  onToggle,
  onChange,
  onDuplicate,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const label = TYPE_LABELS[block.type ?? ''] || block.type || 'Block';

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          'border-l-4 border-l-primary/60 border-primary/20 transition-shadow',
          isDragging && 'shadow-lg ring-2 ring-primary/40',
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            {/* Drag handle (6-dot) */}
            <button
              type="button"
              aria-label="Drag to reorder"
              className="mt-1 cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {index + 1}. {label}
                </Badge>
              </div>
              <InlineEditableText
                value={summarize(block)}
                onChange={(v) => {
                  // Update whichever primary field exists
                  if (block.title != null) return onChange({ title: v });
                  if (block.prompt != null) return onChange({ prompt: v });
                  if (block.question != null) return onChange({ question: v });
                  if (block.text != null) return onChange({ text: v });
                  if (block.word != null) return onChange({ word: v });
                  return onChange({ title: v });
                }}
                className="text-base font-semibold text-foreground"
                ariaLabel="Block title"
              />

              {expanded && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {block.definition != null && (
                    <Field label="Definition">
                      <InlineEditableText
                        value={block.definition}
                        onChange={(v) => onChange({ definition: v })}
                        multiline
                      />
                    </Field>
                  )}
                  {block.prompt != null && block.prompt !== summarize(block) && (
                    <Field label="Prompt">
                      <InlineEditableText
                        value={block.prompt}
                        onChange={(v) => onChange({ prompt: v })}
                        multiline
                      />
                    </Field>
                  )}
                  <Field label="Hint (Strike 2)">
                    <InlineEditableText
                      value={block.hint ?? ''}
                      onChange={(v) => onChange({ hint: v })}
                      placeholder="Add a level-appropriate hint…"
                    />
                  </Field>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Toggle details">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onDuplicate} aria-label="Duplicate">
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                aria-label="Delete"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
    {children}
  </div>
);

export default SortableBlockCard;
