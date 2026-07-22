import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AssessmentQuestionBuilder } from "@/components/assessment/AssessmentQuestionBuilder";

interface CreateAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateAssessmentDialog({ open, onOpenChange, onSuccess }: CreateAssessmentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assessment_type: "quiz",
    cefr_level: "B1",
    duration_minutes: 30,
    passing_score: 70,
  });

  const [questions, setQuestions] = useState<any[]>([]);

  const handleSubmit = async () => {
    if (!formData.title || questions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a title and at least one question',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          ...formData,
          teacher_id: user.id,
          total_points: totalPoints,
          is_published: false,
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      const questionsToInsert = questions.map((q, idx) => ({
        assessment_id: assessment.id,
        question_text: q.question_text,
        question_type: q.question_type,
        question_order: idx,
        points: q.points || 1,
        options: q.options,
        correct_answer: q.correct_answer,
        rubric: q.rubric,
        audio_url: q.audio_url,
      }));

      const { error: questionsError } = await supabase
        .from('assessment_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast({ title: 'Success', description: 'Assessment created successfully' });
      onSuccess();
      onOpenChange(false);
      setFormData({ title: "", description: "", assessment_type: "quiz", cefr_level: "B1", duration_minutes: 30, passing_score: 70 });
      setQuestions([]);
      setActiveTab('details');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Assessment</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Type</Label><Select value={formData.assessment_type} onValueChange={(v) => setFormData({ ...formData, assessment_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="quiz">Quiz</SelectItem><SelectItem value="test">Test</SelectItem><SelectItem value="exam">Exam</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>CEFR Level</Label><Select value={formData.cefr_level} onValueChange={(v) => setFormData({ ...formData, cefr_level: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="A1">A1</SelectItem><SelectItem value="A2">A2</SelectItem><SelectItem value="B1">B1</SelectItem><SelectItem value="B2">B2</SelectItem><SelectItem value="C1">C1</SelectItem><SelectItem value="C2">C2</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })} min="5" /></div>
              <div className="space-y-2 col-span-2"><Label>Passing Score (%)</Label><Input type="number" value={formData.passing_score} onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })} min="0" max="100" /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
            <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={() => setActiveTab('questions')}>Next: Add Questions</Button></div>
          </TabsContent>

          <TabsContent value="questions" className="pt-4">
            <AssessmentQuestionBuilder onQuestionsChange={setQuestions} initialQuestions={questions} />
            <div className="flex justify-end gap-2 pt-4 border-t mt-4"><Button variant="outline" onClick={() => setActiveTab('details')}>Back</Button><Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : 'Create Assessment'}</Button></div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}