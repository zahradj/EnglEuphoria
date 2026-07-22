import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Trash2, GripVertical, Copy, Eye, Upload, 
  FileText, Volume2, BookOpen, ListOrdered, CheckSquare 
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  points: number;
  options?: any;
  correct_answer?: string;
  rubric?: string;
  audio_url?: string;
  passage?: string;
  order: number;
}

interface AssessmentQuestionBuilderProps {
  assessmentId?: string;
  onQuestionsChange: (questions: Question[]) => void;
  initialQuestions?: Question[];
}

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare },
  { value: 'true_false', label: 'True/False', icon: CheckSquare },
  { value: 'short_answer', label: 'Short Answer', icon: FileText },
  { value: 'essay', label: 'Essay', icon: FileText },
  { value: 'listening', label: 'Listening Comprehension', icon: Volume2 },
  { value: 'reading', label: 'Reading Comprehension', icon: BookOpen },
  { value: 'fill_blank', label: 'Fill in the Blank', icon: FileText },
  { value: 'matching', label: 'Matching Pairs', icon: ListOrdered },
  { value: 'ordering', label: 'Ordering/Sequencing', icon: ListOrdered },
];

const QUESTION_TEMPLATES = {
  grammar: [
    { text: 'Choose the correct form of the verb: "She _____ to the store yesterday."', type: 'multiple_choice', options: ['go', 'goes', 'went', 'going'], answer: 'went' },
    { text: 'Identify if the sentence is grammatically correct: "They has finished their homework."', type: 'true_false', answer: 'false' },
  ],
  vocabulary: [
    { text: 'What does "benevolent" mean?', type: 'multiple_choice', options: ['Kind and helpful', 'Angry', 'Confused', 'Fast'], answer: 'Kind and helpful' },
    { text: 'Use "ubiquitous" in a sentence.', type: 'short_answer' },
  ],
  comprehension: [
    { text: 'Read the passage below and answer: What is the main idea?', type: 'reading', passage: '[Insert passage here]' },
    { text: 'Listen to the audio and answer: What did the speaker say about...?', type: 'listening' },
  ],
};

export function AssessmentQuestionBuilder({ 
  assessmentId, 
  onQuestionsChange,
  initialQuestions = [] 
}: AssessmentQuestionBuilderProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [activeTab, setActiveTab] = useState('builder');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const addQuestion = (type: string = 'multiple_choice') => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      question_text: '',
      question_type: type,
      points: 1,
      order: questions.length,
    };

    if (type === 'multiple_choice') {
      newQuestion.options = { options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'] };
    } else if (type === 'matching') {
      newQuestion.options = { 
        pairs: [
          { left: 'Item 1', right: 'Match 1' },
          { left: 'Item 2', right: 'Match 2' }
        ] 
      };
    } else if (type === 'fill_blank') {
      newQuestion.options = { wordBank: [] };
    }

    setQuestions([...questions, newQuestion]);
    setEditingQuestion(newQuestion);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const updated = questions.map(q => q.id === id ? { ...q, ...updates } : q);
    setQuestions(updated);
    onQuestionsChange(updated);
  };

  const deleteQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id).map((q, idx) => ({ ...q, order: idx }));
    setQuestions(updated);
    onQuestionsChange(updated);
    toast({ title: 'Question deleted' });
  };

  const duplicateQuestion = (question: Question) => {
    const duplicate = { ...question, id: `temp-${Date.now()}`, order: questions.length };
    setQuestions([...questions, duplicate]);
    toast({ title: 'Question duplicated' });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const updated = items.map((q, idx) => ({ ...q, order: idx }));
    setQuestions(updated);
    onQuestionsChange(updated);
  };

  const addTemplateQuestion = (template: any, category: string) => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      question_text: template.text,
      question_type: template.type,
      points: 1,
      order: questions.length,
      correct_answer: template.answer,
      passage: template.passage,
    };

    if (template.options) {
      newQuestion.options = { options: template.options };
    }

    setQuestions([...questions, newQuestion]);
    toast({ title: `${category} template added` });
  };

  const handleBulkImport = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const imported: Question[] = [];

    lines.forEach((line, idx) => {
      const [questionText, type, optionsStr, answer] = line.split(',').map(s => s.trim());
      if (questionText && type) {
        const question: Question = {
          id: `temp-import-${idx}`,
          question_text: questionText,
          question_type: type,
          points: 1,
          order: questions.length + idx,
          correct_answer: answer,
        };

        if (optionsStr && type === 'multiple_choice') {
          question.options = { options: optionsStr.split('|').map(o => o.trim()) };
        }

        imported.push(question);
      }
    });

    setQuestions([...questions, ...imported]);
    onQuestionsChange([...questions, ...imported]);
    toast({ title: `Imported ${imported.length} questions` });
  };

  const renderQuestionEditor = (question: Question) => {
    return (
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>Question Text</Label>
          <Textarea
            value={question.question_text}
            onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
            placeholder="Enter your question here..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={question.question_type}
              onValueChange={(value) => updateQuestion(question.id, { question_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Points</Label>
            <Input
              type="number"
              value={question.points}
              onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) })}
              min={1}
            />
          </div>
        </div>

        {/* Type-specific options */}
        {question.question_type === 'multiple_choice' && (
          <div className="space-y-2">
            <Label>Options</Label>
            {(question.options?.options || []).map((option: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options?.options || [])];
                    newOptions[idx] = e.target.value;
                    updateQuestion(question.id, { options: { options: newOptions } });
                  }}
                  placeholder={`Option ${idx + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newOptions = question.options?.options.filter((_: any, i: number) => i !== idx);
                    updateQuestion(question.id, { options: { options: newOptions } });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newOptions = [...(question.options?.options || []), ''];
                updateQuestion(question.id, { options: { options: newOptions } });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>
        )}

        {question.question_type === 'reading' && (
          <div className="space-y-2">
            <Label>Reading Passage</Label>
            <Textarea
              value={question.passage || ''}
              onChange={(e) => updateQuestion(question.id, { passage: e.target.value })}
              placeholder="Enter the reading passage..."
              rows={6}
            />
          </div>
        )}

        {question.question_type === 'listening' && (
          <div className="space-y-2">
            <Label>Audio URL</Label>
            <Input
              value={question.audio_url || ''}
              onChange={(e) => updateQuestion(question.id, { audio_url: e.target.value })}
              placeholder="https://example.com/audio.mp3"
            />
          </div>
        )}

        {question.question_type === 'fill_blank' && (
          <div className="space-y-2">
            <Label>Word Bank (comma-separated)</Label>
            <Input
              value={(question.options?.wordBank || []).join(', ')}
              onChange={(e) => {
                const wordBank = e.target.value.split(',').map(w => w.trim()).filter(Boolean);
                updateQuestion(question.id, { options: { wordBank } });
              }}
              placeholder="word1, word2, word3"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Correct Answer / Rubric</Label>
          <Textarea
            value={question.correct_answer || question.rubric || ''}
            onChange={(e) => updateQuestion(question.id, { 
              correct_answer: e.target.value,
              rubric: e.target.value 
            })}
            placeholder="Enter correct answer or grading rubric..."
            rows={2}
          />
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Question Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={() => addQuestion()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          {questions.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No questions yet</p>
              <p className="text-muted-foreground mb-4">Add your first question to get started</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {QUESTION_TYPES.slice(0, 5).map(type => (
                  <Button
                    key={type.value}
                    variant="outline"
                    onClick={() => addQuestion(type.value)}
                  >
                    <type.icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </Card>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {questions.map((question, index) => (
                      <Draggable key={question.id} draggableId={question.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="space-y-2"
                          >
                            <Card className="p-4">
                              <div className="flex items-start gap-4">
                                <div {...provided.dragHandleProps} className="mt-2 cursor-grab">
                                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">Q{index + 1}</Badge>
                                      <Badge variant="secondary">{question.question_type}</Badge>
                                      <span className="text-sm text-muted-foreground">{question.points} pts</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => duplicateQuestion(question)}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteQuestion(question.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {editingQuestion?.id === question.id ? (
                                    <div className="mt-4">
                                      {renderQuestionEditor(question)}
                                      <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => setEditingQuestion(null)}
                                      >
                                        Done
                                      </Button>
                                    </div>
                                  ) : (
                                    <div
                                      className="cursor-pointer hover:bg-accent/50 p-2 rounded"
                                      onClick={() => setEditingQuestion(question)}
                                    >
                                      <p className="font-medium">
                                        {question.question_text || 'Click to edit question...'}
                                      </p>
                                      {question.question_type === 'multiple_choice' && question.options?.options && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                          {question.options.options.length} options
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <p className="text-sm text-muted-foreground">Select from common question templates</p>
          {Object.entries(QUESTION_TEMPLATES).map(([category, templates]) => (
            <Card key={category} className="p-4">
              <h4 className="font-semibold mb-3 capitalize">{category}</h4>
              <div className="space-y-2">
                {templates.map((template, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 hover:bg-accent rounded">
                    <div className="flex-1">
                      <p className="text-sm">{template.text.substring(0, 80)}...</p>
                      <Badge variant="outline" className="mt-1">{template.type}</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addTemplateQuestion(template, category)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card className="p-6">
            <h4 className="font-semibold mb-2">Bulk Import from CSV</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Format: Question Text, Type, Options (separated by |), Correct Answer
            </p>
            <Textarea
              placeholder="What is 2+2?, multiple_choice, 2|3|4|5, 4"
              rows={10}
              className="mb-4"
              id="csv-import"
            />
            <Button onClick={() => {
              const textarea = document.getElementById('csv-import') as HTMLTextAreaElement;
              if (textarea?.value) handleBulkImport(textarea.value);
            }}>
              <Upload className="w-4 h-4 mr-2" />
              Import Questions
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
