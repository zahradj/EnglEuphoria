import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, Trash2 } from "lucide-react";

type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

interface Question {
  id: string;
  question_type: QuestionType;
  question_text: string;
  points: number;
  options?: string[];
  correct_answer?: string;
}

export function AssessmentCreator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState<string>("quiz");
  const [cefrLevel, setCefrLevel] = useState<string>("A1");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question_type: 'multiple_choice',
      question_text: '',
      points: 1,
      options: ['', '', '', ''],
      correct_answer: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }

    if (questions.length === 0) {
      toast({ title: "Add at least one question", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          teacher_id: user.id,
          title,
          description,
          assessment_type: assessmentType,
          cefr_level: cefrLevel,
          duration_minutes: durationMinutes,
          passing_score: passingScore,
          total_points: totalPoints,
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      const questionsToInsert = questions.map((q, index) => ({
        assessment_id: assessment.id,
        question_order: index + 1,
        question_type: q.question_type,
        question_text: q.question_text,
        points: q.points,
        options: q.question_type === 'multiple_choice' ? q.options : null,
        correct_answer: q.correct_answer
      }));

      const { error: questionsError } = await supabase
        .from('assessment_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast({
        title: publish ? "Assessment published!" : "Assessment saved as draft",
        description: "Your assessment has been created successfully."
      });

      navigate('/teacher/assessments');
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error saving assessment",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Unit 3 Grammar Quiz"
              />
            </div>
            <div>
              <Label htmlFor="type">Assessment Type</Label>
              <Select value={assessmentType} onValueChange={setAssessmentType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cefr">CEFR Level</Label>
              <Select value={cefrLevel} onValueChange={setCefrLevel}>
                <SelectTrigger id="cefr">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="passing">Passing Score (%)</Label>
              <Input
                id="passing"
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value))}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this assessment..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">Q{index + 1}</span>
                        <Select
                          value={question.question_type}
                          onValueChange={(value) => updateQuestion(question.id, { question_type: value as QuestionType })}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                            <SelectItem value="short_answer">Short Answer</SelectItem>
                            <SelectItem value="essay">Essay</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) })}
                          className="w-24"
                          placeholder="Points"
                          min="1"
                        />
                      </div>
                      
                      <Textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
                        placeholder="Enter your question..."
                        rows={2}
                      />

                      {question.question_type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {question.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correct_answer === option}
                                onChange={() => updateQuestion(question.id, { correct_answer: option })}
                              />
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])];
                                  newOptions[optIndex] = e.target.value;
                                  updateQuestion(question.id, { options: newOptions });
                                }}
                                placeholder={`Option ${optIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={loading}>
              Publish Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
