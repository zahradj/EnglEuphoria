import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';

interface AssessmentQuestionDisplayProps {
  question: {
    id: string;
    question_text: string;
    question_type: string;
    options?: any;
    audio_url?: string;
    passage?: string;
  };
  value: string | any;
  onChange: (value: string | any) => void;
}

export function AssessmentQuestionDisplay({ question, value, onChange }: AssessmentQuestionDisplayProps) {
  const [fillBlankAnswers, setFillBlankAnswers] = useState<Record<number, string>>(
    typeof value === 'object' ? value : {}
  );
  const [matchingPairs, setMatchingPairs] = useState<Array<{left: string, right: string}>>(
    Array.isArray(value) ? value : question.options?.pairs || []
  );
  const [orderedItems, setOrderedItems] = useState<string[]>(
    Array.isArray(value) ? value : question.options?.items || []
  );

  const handleFillBlankChange = (index: number, word: string) => {
    const updated = { ...fillBlankAnswers, [index]: word };
    setFillBlankAnswers(updated);
    onChange(updated);
  };

  const handleMatchingDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(matchingPairs);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setMatchingPairs(items);
    onChange(items);
  };

  const handleOrderingDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(orderedItems);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setOrderedItems(items);
    onChange(items);
  };

  const renderQuestionInput = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        const options = question.options?.options || [];
        return (
          <RadioGroup value={value} onValueChange={onChange}>
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'true_false':
        return (
          <RadioGroup value={value} onValueChange={onChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        );

      case 'short_answer':
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full"
          />
        );

      case 'essay':
      case 'writing':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[200px]"
          />
        );

      case 'listening':
        return (
          <div className="space-y-4">
            {question.audio_url && (
              <Card className="p-4 bg-accent/10">
                <p className="text-sm text-muted-foreground mb-2">Listen to the audio and answer the question:</p>
                <audio controls className="w-full">
                  <source src={question.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </Card>
            )}
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[150px]"
            />
          </div>
        );

      case 'reading':
        return (
          <div className="space-y-4">
            {question.passage && (
              <Card className="p-6 bg-accent/10">
                <p className="text-sm font-semibold mb-3">Reading Passage:</p>
                <p className="whitespace-pre-wrap leading-relaxed">{question.passage}</p>
              </Card>
            )}
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[150px]"
            />
          </div>
        );

      case 'fill_blank':
        const questionText = question.question_text;
        const blanks = (questionText.match(/___/g) || []).length;
        const wordBank = question.options?.wordBank || [];

        return (
          <div className="space-y-4">
            <div className="p-4 bg-accent/10 rounded-lg">
              {wordBank.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Word Bank:</p>
                  <div className="flex flex-wrap gap-2">
                    {wordBank.map((word: string, idx: number) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const nextBlank = Object.keys(fillBlankAnswers).length;
                          if (nextBlank < blanks) {
                            handleFillBlankChange(nextBlank, word);
                          }
                        }}
                      >
                        {word}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {Array.from({ length: blanks }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Label className="min-w-[100px]">Blank {idx + 1}:</Label>
                    <Input
                      value={fillBlankAnswers[idx] || ''}
                      onChange={(e) => handleFillBlankChange(idx, e.target.value)}
                      placeholder="Type or select from word bank..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'matching':
        const pairs = question.options?.pairs || [];
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Drag items on the right to match with items on the left:</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-semibold text-sm">Items</p>
                {pairs.map((pair: any, idx: number) => (
                  <Card key={idx} className="p-3">
                    {pair.left}
                  </Card>
                ))}
              </div>
              
              <DragDropContext onDragEnd={handleMatchingDragEnd}>
                <Droppable droppableId="matching">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      <p className="font-semibold text-sm">Matches</p>
                      {matchingPairs.map((pair, idx) => (
                        <Draggable key={idx} draggableId={`match-${idx}`} index={idx}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-3 flex items-center gap-2 cursor-grab"
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              {pair.right}
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        );

      case 'ordering':
        const items = question.options?.items || [];
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Drag items to put them in the correct order:</p>
            <DragDropContext onDragEnd={handleOrderingDragEnd}>
              <Droppable droppableId="ordering">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {orderedItems.map((item, idx) => (
                      <Draggable key={idx} draggableId={`order-${idx}`} index={idx}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-4 flex items-center gap-3 cursor-grab"
                          >
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-5 h-5 text-muted-foreground" />
                              <span className="font-semibold text-muted-foreground">{idx + 1}.</span>
                            </div>
                            <span>{item}</span>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        );

      default:
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[150px]"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{question.question_text}</h3>
        {question.audio_url && (
          <audio controls className="w-full">
            <source src={question.audio_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
      {renderQuestionInput()}
    </div>
  );
}