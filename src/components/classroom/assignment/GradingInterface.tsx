
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { FileText, Download, MessageCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AssignmentSubmission, RubricScore, assignmentService } from "@/services/assignmentService";

interface GradingInterfaceProps {
  submission: AssignmentSubmission;
  onGradeSubmitted: (gradedSubmission: AssignmentSubmission) => void;
  onClose: () => void;
}

export function GradingInterface({ submission, onGradeSubmitted, onClose }: GradingInterfaceProps) {
  const [grade, setGrade] = useState(submission.grade || 0);
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [rubricScores, setRubricScores] = useState<RubricScore[]>(submission.rubricScores || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Mock rubric for demonstration
  const mockRubric = {
    id: "rubric-1",
    criteria: [
      {
        id: "content",
        name: "Content & Ideas",
        description: "Quality and relevance of ideas",
        points: 10,
        levels: [
          { id: "excellent", name: "Excellent", description: "Outstanding ideas", points: 10 },
          { id: "good", name: "Good", description: "Clear ideas", points: 8 },
          { id: "fair", name: "Fair", description: "Basic ideas", points: 6 },
          { id: "poor", name: "Poor", description: "Unclear ideas", points: 4 }
        ]
      },
      {
        id: "grammar",
        name: "Grammar & Usage",
        description: "Correct use of grammar and vocabulary",
        points: 10,
        levels: [
          { id: "excellent", name: "Excellent", description: "No errors", points: 10 },
          { id: "good", name: "Good", description: "Few errors", points: 8 },
          { id: "fair", name: "Fair", description: "Some errors", points: 6 },
          { id: "poor", name: "Poor", description: "Many errors", points: 4 }
        ]
      },
      {
        id: "organization",
        name: "Organization",
        description: "Structure and flow of writing",
        points: 5,
        levels: [
          { id: "excellent", name: "Excellent", description: "Well organized", points: 5 },
          { id: "good", name: "Good", description: "Mostly organized", points: 4 },
          { id: "fair", name: "Fair", description: "Basic organization", points: 3 },
          { id: "poor", name: "Poor", description: "Poor organization", points: 2 }
        ]
      }
    ],
    totalPoints: 25
  };

  const handleRubricScoreChange = (criterionId: string, levelId: string, points: number) => {
    const newScores = rubricScores.filter(score => score.criterionId !== criterionId);
    newScores.push({ criterionId, levelId, points });
    setRubricScores(newScores);
    
    // Calculate total grade from rubric scores
    const totalPoints = newScores.reduce((sum, score) => sum + score.points, 0);
    setGrade(totalPoints);
  };

  const handleSubmitGrade = async () => {
    if (grade < 0 || grade > mockRubric.totalPoints) {
      toast({
        title: "Invalid Grade",
        description: `Grade must be between 0 and ${mockRubric.totalPoints}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const gradedSubmission = await assignmentService.gradeSubmission(
        submission.id,
        grade,
        feedback,
        rubricScores
      );

      onGradeSubmitted(gradedSubmission);
      
      toast({
        title: "Grade Submitted",
        description: `${submission.studentName}'s assignment has been graded.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit grade. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grade Submission</h1>
          <p className="text-gray-600">
            {submission.studentName} • Submitted {formatDate(submission.submittedAt || submission.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
            {submission.status === 'graded' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
            {submission.status}
          </Badge>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Submission */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Text Content */}
                <div>
                  <Label className="text-sm font-medium">Written Response</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                    <p className="whitespace-pre-wrap">{submission.content}</p>
                  </div>
                </div>

                {/* File Attachments */}
                {submission.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Attachments</Label>
                    <div className="space-y-2 mt-2">
                      {submission.attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div>
                              <p className="font-medium text-sm">{file.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {(file.fileSize / 1024).toFixed(1)} KB • {file.fileType}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grading Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grading</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="rubric" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="rubric">Rubric</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>

                <TabsContent value="rubric" className="space-y-4">
                  {mockRubric.criteria.map((criterion) => (
                    <div key={criterion.id} className="space-y-2">
                      <Label className="text-sm font-medium">{criterion.name}</Label>
                      <p className="text-xs text-gray-600">{criterion.description}</p>
                      <div className="space-y-2">
                        {criterion.levels.map((level) => (
                          <label key={level.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={criterion.id}
                              value={level.id}
                              onChange={() => handleRubricScoreChange(criterion.id, level.id, level.points)}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{level.name}</span>
                                <span className="text-sm text-gray-600">{level.points}pts</span>
                              </div>
                              <p className="text-xs text-gray-500">{level.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div>
                    <Label>Grade (out of {mockRubric.totalPoints})</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[grade]}
                        onValueChange={(value) => setGrade(value[0])}
                        max={mockRubric.totalPoints}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>0</span>
                        <span className="font-medium">{grade}pts</span>
                        <span>{mockRubric.totalPoints}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label>Feedback</Label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback to the student..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Final Grade:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {grade}/{mockRubric.totalPoints} ({Math.round((grade / mockRubric.totalPoints) * 100)}%)
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmitGrade} 
                  disabled={isSubmitting} 
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit Grade"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
