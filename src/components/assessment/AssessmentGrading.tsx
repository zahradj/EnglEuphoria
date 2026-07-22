import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AssessmentGrading() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingSubmissions();
  }, []);

  const loadPendingSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('assessment_submissions')
        .select(`
          *,
          assessments!inner (
            id,
            title,
            teacher_id
          ),
          users!assessment_submissions_student_id_fkey (
            full_name,
            email
          )
        `)
        .eq('assessments.teacher_id', user.id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const loadSubmissionDetails = async (submissionId: string) => {
    try {
      const { data: submissionData } = await supabase
        .from('assessment_submissions')
        .select(`
          *,
          assessments (
            title
          )
        `)
        .eq('id', submissionId)
        .single();

      setSelectedSubmission(submissionData);

      const { data: answersData } = await supabase
        .from('assessment_answers')
        .select(`
          *,
          assessment_questions (
            question_text,
            question_type,
            correct_answer,
            points,
            rubric
          )
        `)
        .eq('submission_id', submissionId);

      setAnswers(answersData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const gradeAnswer = async (answerId: string, isCorrect: boolean, points: number, feedback: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('assessment_answers')
        .update({
          is_correct: isCorrect,
          points_earned: points,
          feedback,
          graded_by: user.id,
          graded_at: new Date().toISOString()
        })
        .eq('id', answerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Answer graded successfully"
      });

      loadSubmissionDetails(selectedSubmission.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-dvh">Loading...</div>;
  }

  if (selectedSubmission) {
    return (
      <div className="container mx-auto py-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Grade Submission</h1>
          <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
            Back to List
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedSubmission.assessments?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <GradingItem
                  key={answer.id}
                  answer={answer}
                  index={index}
                  onGrade={gradeAnswer}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Pending Grading</h1>
      
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No submissions pending grading
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => loadSubmissionDetails(submission.id)}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{submission.assessments?.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Student: {submission.users?.full_name || submission.users?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function GradingItem({ answer, index, onGrade }: any) {
  const [points, setPoints] = useState(answer.points_earned || 0);
  const [feedback, setFeedback] = useState(answer.feedback || '');
  const [isCorrect, setIsCorrect] = useState(answer.is_correct ?? true);

  const handleGrade = () => {
    onGrade(answer.id, isCorrect, points, feedback);
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div>
        <h4 className="font-medium mb-2">Question {index + 1}</h4>
        <p className="text-sm mb-2">{answer.assessment_questions?.question_text}</p>
        {answer.assessment_questions?.rubric && (
          <div className="bg-muted p-2 rounded text-sm mb-2">
            <strong>Rubric:</strong> {answer.assessment_questions.rubric}
          </div>
        )}
      </div>

      <div className="bg-muted p-3 rounded">
        <strong className="text-sm">Student Answer:</strong>
        <p className="mt-1">{answer.answer_text || 'No answer provided'}</p>
      </div>

      {answer.graded_at ? (
        <div className="space-y-2 bg-primary/5 p-3 rounded">
          <div className="flex items-center gap-2">
            {answer.is_correct ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <span className="font-medium">Already Graded</span>
          </div>
          <p className="text-sm">Points: {answer.points_earned} / {answer.assessment_questions?.points}</p>
          {answer.feedback && <p className="text-sm">Feedback: {answer.feedback}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              size="sm"
              variant={isCorrect ? "default" : "outline"}
              onClick={() => setIsCorrect(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Correct
            </Button>
            <Button
              size="sm"
              variant={!isCorrect ? "destructive" : "outline"}
              onClick={() => setIsCorrect(false)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Incorrect
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Points (Max: {answer.assessment_questions?.points})</Label>
            <Input
              type="number"
              min="0"
              max={answer.assessment_questions?.points}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback to the student..."
              rows={3}
            />
          </div>

          <Button onClick={handleGrade} className="w-full">
            Submit Grade
          </Button>
        </div>
      )}
    </div>
  );
}