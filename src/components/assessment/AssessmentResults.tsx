import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Award, Home } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function AssessmentResults() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [submissionId]);

  const loadResults = async () => {
    try {
      const { data: submissionData } = await supabase
        .from('assessment_submissions')
        .select(`
          *,
          assessments (
            title,
            passing_score,
            certificate_eligible
          )
        `)
        .eq('id', submissionId)
        .single();

      setSubmission(submissionData);

      const { data: answersData } = await supabase
        .from('assessment_answers')
        .select(`
          *,
          assessment_questions (
            question_text,
            question_type,
            correct_answer,
            points
          )
        `)
        .eq('submission_id', submissionId);

      setAnswers(answersData || []);

      if (submissionData?.passed && submissionData?.assessments?.certificate_eligible) {
        const { data: certData } = await supabase
          .from('certificates')
          .select('*')
          .eq('student_id', submissionData.student_id)
          .eq('metadata->>assessment_id', submissionData.assessment_id)
          .maybeSingle();

        setCertificate(certData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading results:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-dvh">Loading results...</div>;
  }

  if (!submission) {
    return <div className="flex items-center justify-center min-h-dvh">Submission not found</div>;
  }

  const percentage = submission.percentage || 0;
  const passed = submission.passed;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <CheckCircle className="h-6 w-6 text-success" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
            {submission.assessments?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Your Score</span>
              <span className="text-2xl font-bold">{percentage.toFixed(1)}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{submission.total_score} / {answers.reduce((sum, a) => sum + (a.assessment_questions?.points || 0), 0)} points</span>
              <span>Passing: {submission.assessments?.passing_score}%</span>
            </div>
          </div>

          <div className="flex items-center justify-center p-4 rounded-lg bg-muted">
            {passed ? (
              <Badge variant="default" className="text-lg px-6 py-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                Passed
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-lg px-6 py-2">
                <XCircle className="h-5 w-5 mr-2" />
                Not Passed
              </Badge>
            )}
          </div>

          {certificate && (
            <div className="p-4 border rounded-lg bg-primary/5 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Certificate Earned!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Congratulations! You've earned a certificate for this assessment.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/certificates/${certificate.id}`)}
              >
                View Certificate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {answers.map((answer, index) => (
            <div key={answer.id} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-medium">Question {index + 1}</h4>
                {answer.is_correct !== null && (
                  answer.is_correct ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )
                )}
              </div>
              <p className="text-sm">{answer.assessment_questions?.question_text}</p>
              <div className="text-sm">
                <span className="font-medium">Your Answer: </span>
                <span>{answer.answer_text || 'No answer provided'}</span>
              </div>
              {answer.feedback && (
                <div className="text-sm bg-muted p-2 rounded">
                  <span className="font-medium">Feedback: </span>
                  <span>{answer.feedback}</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Points: {answer.points_earned || 0} / {answer.assessment_questions?.points || 0}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={() => navigate('/dashboard')}>
          <Home className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default AssessmentResults;