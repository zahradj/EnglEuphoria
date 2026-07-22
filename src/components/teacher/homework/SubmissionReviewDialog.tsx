import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { homeworkService, HomeworkSubmission } from "@/services/homeworkService";
import { FileText, Download, Award } from "lucide-react";
import { format } from "date-fns";

interface SubmissionReviewDialogProps {
  assignmentId: string;
  assignmentTitle: string;
  maxPoints: number;
  open: boolean;
  onClose: () => void;
}

export const SubmissionReviewDialog = ({
  assignmentId,
  assignmentTitle,
  maxPoints,
  open,
  onClose,
}: SubmissionReviewDialogProps) => {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadSubmissions();
    }
  }, [open, assignmentId]);

  const loadSubmissions = async () => {
    setLoading(true);
    const data = await homeworkService.getAssignmentSubmissions(assignmentId);
    setSubmissions(data);
    setLoading(false);
  };

  const handleSelectSubmission = (submission: HomeworkSubmission) => {
    setSelectedSubmission(submission);
    setPointsEarned(submission.points_earned || 0);
    setFeedback(submission.teacher_feedback || "");
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    if (pointsEarned > maxPoints) {
      toast({
        title: "Invalid Points",
        description: `Points cannot exceed ${maxPoints}`,
        variant: "destructive"
      });
      return;
    }

    setIsGrading(true);
    const result = await homeworkService.gradeSubmission(
      selectedSubmission.id,
      pointsEarned,
      feedback
    );

    if (result.success) {
      toast({
        title: "✅ Graded Successfully",
        description: `${pointsEarned} points awarded`,
      });
      await loadSubmissions();
      setSelectedSubmission(null);
      setPointsEarned(0);
      setFeedback("");
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to grade submission",
        variant: "destructive"
      });
    }
    setIsGrading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Review Submissions: {assignmentTitle}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 h-[600px]">
          {/* Submissions List */}
          <ScrollArea className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Submissions ({submissions.length})</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions yet</p>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedSubmission?.id === sub.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium text-sm">Student #{sub.student_id.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">
                      {sub.submitted_at
                        ? format(new Date(sub.submitted_at), "MMM d, h:mm a")
                        : "Not submitted"}
                    </div>
                    {sub.status === "graded" && (
                      <div className="text-xs font-semibold text-green-600 mt-1">
                        ✓ {sub.points_earned}/{maxPoints} points
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Submission Details & Grading */}
          <div className="col-span-2 border rounded-lg p-4">
            {selectedSubmission ? (
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Student Response</h3>
                    {selectedSubmission.text_response ? (
                      <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                        {selectedSubmission.text_response}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No text response</p>
                    )}
                  </div>

                  {selectedSubmission.attachment_urls && selectedSubmission.attachment_urls.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Attachments</h3>
                      <div className="space-y-2">
                        {selectedSubmission.attachment_urls.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm flex-1">Attachment {idx + 1}</span>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Grading
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Points (Max: {maxPoints})</Label>
                        <Input
                          type="number"
                          min="0"
                          max={maxPoints}
                          value={pointsEarned}
                          onChange={(e) => setPointsEarned(Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Feedback</Label>
                        <Textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Provide feedback to the student..."
                          className="mt-1"
                          rows={4}
                        />
                      </div>

                      <Button
                        onClick={handleGradeSubmission}
                        disabled={isGrading}
                        className="w-full"
                      >
                        {isGrading ? "Grading..." : "Submit Grade"}
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a submission to review
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
