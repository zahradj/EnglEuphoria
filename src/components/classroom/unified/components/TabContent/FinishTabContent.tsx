import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, Clock, Star, MessageSquare, BookOpen, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { endLesson } from "@/services/endLesson";
import { advanceCurriculumProgress } from "@/services/activeCoreLessonResolver";
import { useQueryClient } from "@tanstack/react-query";



interface FinishTabContentProps {
  onEndLesson: () => void;
  isTeacher: boolean;
  sessionStatus?: 'waiting' | 'started' | 'ended';
  roomId: string;
  studentId?: string;
  teacherId?: string;
  lessonId?: string;
}

interface FeedbackForm {
  studentPerformanceRating: string;
  lessonObjectivesMet: boolean;
  feedbackContent: string;
  homeworkAssigned: string;
  parentCommunicationNotes: string;
}

export function FinishTabContent({ 
  onEndLesson, 
  isTeacher, 
  sessionStatus = 'waiting',
  roomId,
  studentId,
  teacherId,
  lessonId
}: FinishTabContentProps) {
  const [isEnding, setIsEnding] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    studentPerformanceRating: '3',
    lessonObjectivesMet: true,
    feedbackContent: '',
    homeworkAssigned: '',
    parentCommunicationNotes: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEndLesson = async () => {
    if (!isTeacher) return;

    setIsEnding(true);
    try {
      // 1. Flip classroom_states so the student auto-redirects to feedback.
      await supabase
        .from('classroom_states')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('session_id', roomId);

      // 2. Atomic completion: booking + session + completion + earnings + ledger + metrics.
      //    roomId === bookingId in this project (see UnifiedClassroomPage).
      const result = await endLesson(roomId);

      // 2b. Advance the student's Master Library pointer so the NEXT booking
      //     auto-loads the following lesson (CEFR/unit/sequence-aware).
      if (!result.already_completed && studentId && lessonId) {
        try {
          await advanceCurriculumProgress(studentId, lessonId);
        } catch (e) {
          console.warn('[FinishTab] advanceCurriculumProgress failed:', e);
        }
      }

      // 3. Refresh every teacher-dashboard surface that reads from these tables.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['teacher-past-lessons'] }),
        queryClient.invalidateQueries({ queryKey: ['teacher-earnings'] }),
        queryClient.invalidateQueries({ queryKey: ['teacher-payouts'] }),
        queryClient.invalidateQueries({ queryKey: ['teacher-metrics'] }),
        queryClient.invalidateQueries({ queryKey: ['teacher-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['class-bookings'] }),
      ]);


      await onEndLesson();

      const credited = result.teacher_amount ?? 0;
      const currency = result.currency ?? 'EUR';
      toast({
        title: result.already_completed ? 'Lesson already completed' : 'Lesson Ended',
        description: result.already_completed
          ? 'Earnings were already credited for this lesson.'
          : `Credited ${credited.toFixed(2)} ${currency} to your earnings. Fill out the form below.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to end the lesson. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnding(false);
    }
  };


  const handleSubmitFeedback = async () => {
    if (!isTeacher || !studentId || !teacherId) {
      toast({
        title: "Error",
        description: "Missing required information to submit feedback.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('lesson_feedback_submissions')
        .insert({
          lesson_id: lessonId || null,
          teacher_id: teacherId,
          student_id: studentId,
          student_performance_rating: parseInt(feedbackForm.studentPerformanceRating),
          lesson_objectives_met: feedbackForm.lessonObjectivesMet,
          feedback_content: feedbackForm.feedbackContent,
          homework_assigned: feedbackForm.homeworkAssigned || null,
          parent_communication_notes: feedbackForm.parentCommunicationNotes || null,
          payment_unlocked: true
        });

      if (error) throw error;

      setFeedbackSubmitted(true);
      toast({
        title: "Feedback Submitted",
        description: "Your lesson feedback has been successfully submitted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (sessionStatus === 'waiting') {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Lesson Not Started</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Please start the lesson first before accessing the finish section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionStatus === 'ended' || feedbackSubmitted) {
    return (
      <div className="h-full p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Lesson Completed</h3>
                  <p className="text-sm text-green-600 mt-2">
                    {isTeacher 
                      ? "Thank you for submitting your feedback. The lesson summary has been sent to the student."
                      : "Your lesson has been completed. You will receive feedback from your teacher shortly."
                    }
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Completed
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lesson Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium">Duration</h4>
                  <p className="text-sm text-gray-600">60 minutes</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h4 className="font-medium">Performance</h4>
                  <p className="text-sm text-gray-600">
                    {feedbackForm.studentPerformanceRating}/5 stars
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium">Objectives</h4>
                  <p className="text-sm text-gray-600">
                    {feedbackForm.lessonObjectivesMet ? 'Met' : 'Partially Met'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        {sessionStatus === 'started' && isTeacher && (
          <Card>
            <CardHeader>
              <CardTitle>End Lesson</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Click the button below to end the current lesson and proceed to feedback.
              </p>
              <Button 
                onClick={handleEndLesson}
                disabled={isEnding}
                variant="destructive"
                size="lg"
                className="w-full"
              >
                {isEnding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Ending Lesson...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    End Lesson
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {isTeacher && ['ended', 'started'].includes(sessionStatus || '') && !feedbackSubmitted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Teacher Feedback Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="performance-rating">Student Performance Rating</Label>
                <RadioGroup 
                  value={feedbackForm.studentPerformanceRating} 
                  onValueChange={(value) => setFeedbackForm(prev => ({ ...prev, studentPerformanceRating: value }))}
                  className="flex gap-4"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                      <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {rating}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="objectives-met">Were the lesson objectives met?</Label>
                <RadioGroup 
                  value={feedbackForm.lessonObjectivesMet.toString()} 
                  onValueChange={(value) => setFeedbackForm(prev => ({ ...prev, lessonObjectivesMet: value === 'true' }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="objectives-yes" />
                    <Label htmlFor="objectives-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="objectives-no" />
                    <Label htmlFor="objectives-no">Partially</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="feedback-content">Detailed Feedback *</Label>
                <Textarea
                  id="feedback-content"
                  placeholder="Provide detailed feedback about the student's performance, areas of improvement, and achievements during the lesson..."
                  value={feedbackForm.feedbackContent}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedbackContent: e.target.value }))}
                  className="min-h-32"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="homework">Homework Assignment (Optional)</Label>
                <Textarea
                  id="homework"
                  placeholder="Describe any homework or practice exercises assigned to the student..."
                  value={feedbackForm.homeworkAssigned}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, homeworkAssigned: e.target.value }))}
                  className="min-h-24"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="parent-notes">Parent Communication Notes (Optional)</Label>
                <Textarea
                  id="parent-notes"
                  placeholder="Any specific notes or recommendations to share with parents..."
                  value={feedbackForm.parentCommunicationNotes}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, parentCommunicationNotes: e.target.value }))}
                  className="min-h-24"
                />
              </div>

              <Button 
                onClick={handleSubmitFeedback}
                disabled={!feedbackForm.feedbackContent.trim()}
                size="lg"
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        )}

        {!isTeacher && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Lesson in Progress</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Your teacher will end the lesson when complete. Feedback will be available after the lesson.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}