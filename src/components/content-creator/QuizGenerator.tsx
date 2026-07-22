import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, HelpCircle, Copy, Download, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizQuestion {
  questionNumber: number;
  type: 'multiple_choice' | 'fill_in_the_blank' | 'matching' | 'sentence_ordering';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface GeneratedQuiz {
  topic: string;
  level: string;
  questions: QuizQuestion[];
}

const LEVELS = [
  { value: 'A1', label: 'Beginner (A1)' },
  { value: 'A2', label: 'Elementary (A2)' },
  { value: 'B1', label: 'Pre-Intermediate (B1)' },
  { value: 'B2', label: 'Intermediate (B2)' },
];

export const QuizGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set());

  const canGenerate = topic.trim() && level;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setGeneratedQuiz(null);
    setShowAnswers(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('quiz-generator', {
        body: { topic, level, questionCount },
      });

      if (error) throw error;

      if (data?.quiz) {
        setGeneratedQuiz(data.quiz);
        toast.success(`Generated ${data.quiz.questions.length} quiz questions!`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      // Fallback generation
      const fallback = generateFallbackQuiz();
      setGeneratedQuiz(fallback);
      toast.info('Generated quiz (offline mode)');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackQuiz = (): GeneratedQuiz => {
    const questions: QuizQuestion[] = Array.from({ length: questionCount }, (_, i) => ({
      questionNumber: i + 1,
      type: (['multiple_choice', 'fill_in_the_blank', 'multiple_choice', 'sentence_ordering', 'multiple_choice'] as const)[i % 5],
      question: `Sample question ${i + 1} about "${topic}" at ${level} level`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: `This tests understanding of ${topic} concepts at the ${level} level.`,
    }));

    return { topic, level, questions };
  };

  const toggleAnswer = (idx: number) => {
    setShowAnswers((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const copyAsJSON = () => {
    if (!generatedQuiz) return;
    navigator.clipboard.writeText(JSON.stringify(generatedQuiz, null, 2));
    toast.success('Quiz JSON copied to clipboard');
  };

  const downloadJSON = () => {
    if (!generatedQuiz) return;
    const blob = new Blob([JSON.stringify(generatedQuiz, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-${topic.replace(/\s+/g, '-').toLowerCase()}-${level}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Quiz downloaded');
  };

  const QUESTION_TYPE_LABELS: Record<string, string> = {
    multiple_choice: 'Multiple Choice',
    fill_in_the_blank: 'Fill in the Blank',
    matching: 'Matching',
    sentence_ordering: 'Sentence Ordering',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          Quiz Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate quizzes for any topic and level. Each quiz includes questions, correct answers, and explanations.
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiz Parameters</CardTitle>
          <CardDescription>Define the topic and level for your quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Topic / Lesson Title</Label>
              <Input
                placeholder="e.g., Present Simple Tense, Daily Routines, Food Vocabulary"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>CEFR Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label>Number of Questions</Label>
            <Input
              type="number"
              min={3}
              max={10}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
              className="w-32"
            />
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            disabled={!canGenerate || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating Quiz...</>
            ) : (
              <><HelpCircle className="h-4 w-4 mr-2" />Generate Quiz</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Quiz */}
      {generatedQuiz && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Generated Quiz: {generatedQuiz.topic}</CardTitle>
              <CardDescription>
                {generatedQuiz.questions.length} questions · Level {generatedQuiz.level}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyAsJSON}>
                <Copy className="h-3 w-3 mr-1" />JSON
              </Button>
              <Button size="sm" variant="outline" onClick={downloadJSON}>
                <Download className="h-3 w-3 mr-1" />Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQuiz.questions.map((q, idx) => (
              <div key={idx} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Q{q.questionNumber}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {QUESTION_TYPE_LABELS[q.type] || q.type}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleAnswer(idx)}
                  >
                    {showAnswers.has(idx) ? 'Hide Answer' : 'Show Answer'}
                  </Button>
                </div>

                <p className="font-medium text-foreground">{q.question}</p>

                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`rounded-md border px-3 py-2 text-sm ${
                          showAnswers.has(idx) && opt === q.correctAnswer
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                            : 'border-border text-foreground'
                        }`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                        {showAnswers.has(idx) && opt === q.correctAnswer && (
                          <CheckCircle2 className="h-4 w-4 inline-block ml-2 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showAnswers.has(idx) && (
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium text-foreground">
                      ✅ Answer: {q.correctAnswer}
                    </p>
                    <p className="text-muted-foreground mt-1">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
