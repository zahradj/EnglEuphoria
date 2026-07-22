
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, Download, MessageCircle, Clock, FileText, Users, CheckCircle, ClipboardList, Inbox, Award } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { CreateAssignmentDialog } from "@/components/classroom/assignment/CreateAssignmentDialog";
import { GradingInterface } from "@/components/classroom/assignment/GradingInterface";
import { Assignment, AssignmentSubmission } from "@/services/assignmentService";

export const AssignmentsTab = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("assignments");
  const { toast } = useToast();

  useEffect(() => {
    loadAssignments();
    loadSubmissions();
  }, []);

  const loadAssignments = async () => {
    try {
      // Real-data hook: assignments will be loaded from Supabase
      // (homework_assignments) once the assignment-creation flow is wired up.
      // Empty state is shown until then; new assignments created via the dialog
      // are kept in local state.
      setAssignments([]);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAssignments([]);
    }
  };

  const loadSubmissions = async () => {
    try {
      // Real-data hook: assignment submissions feed will be wired to Supabase
      // (homework_assignments + homework_assignment_students) once the grading
      // workflow ships. Until then, render the empty state instead of fixtures.
      setSubmissions([]);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      setSubmissions([]);
    }
  };

  const handleAssignmentCreated = (assignment: Assignment) => {
    setAssignments([assignment, ...assignments]);
    toast({
      title: "Assignment Created",
      description: `"${assignment.title}" has been created successfully.`,
    });
  };

  const handleGradeSubmission = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
  };

  const handleGradeSubmitted = (gradedSubmission: AssignmentSubmission) => {
    setSubmissions(submissions.map(sub => 
      sub.id === gradedSubmission.id ? gradedSubmission : sub
    ));
    setSelectedSubmission(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'graded': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');

  if (selectedSubmission) {
    return (
      <GradingInterface
        submission={selectedSubmission}
        onGradeSubmitted={handleGradeSubmitted}
        onClose={() => setSelectedSubmission(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Assignments & Homework</h1>
        <Button 
          className="bg-teal-500 hover:bg-teal-600" 
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments">
            My Assignments ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Need Grading ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="graded">
            Recently Graded ({gradedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          {assignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No assignments yet"
              description="Create your first assignment to give students homework, quizzes, or projects to complete between lessons."
              actionLabel="Create Assignment"
              onAction={() => setIsCreateDialogOpen(true)}
            />
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {assignment.type}
                        </Badge>
                        <Badge variant="secondary">
                          {assignment.points} pts
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {submissions.filter(s => s.assignmentId === assignment.id).length} submitted
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No submissions waiting"
              description="When students turn in assignments, they will appear here ready for grading."
            />
          ) : (
            <div className="grid gap-4">
              {pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{submission.studentName}</CardTitle>
                      <Badge className={getStatusColor(submission.status)}>
                        Needs Grading
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Assignment: {assignments.find(a => a.id === submission.assignmentId)?.title}
                      </p>

                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-sm line-clamp-3">{submission.content}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Submitted: {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}
                          </div>
                          {submission.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {submission.attachments.length} file(s)
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            className="bg-indigo-500 hover:bg-indigo-600"
                            onClick={() => handleGradeSubmission(submission)}
                          >
                            Grade Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          {gradedSubmissions.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Nothing graded yet"
              description="Once you grade student submissions, the latest results will be listed here."
            />
          ) : (
            <div className="grid gap-4">
              {gradedSubmissions.map((submission) => (
                <Card key={submission.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{submission.studentName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(submission.status)}>
                          Graded
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {submission.grade}/{assignments.find(a => a.id === submission.assignmentId)?.points} pts
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Assignment: {assignments.find(a => a.id === submission.assignmentId)?.title}
                      </p>

                      {submission.feedback && (
                        <div className="bg-green-50 p-3 rounded border border-green-200">
                          <Label className="text-sm font-medium text-green-800 mb-1 block">Your Feedback:</Label>
                          <p className="text-sm text-green-700">{submission.feedback}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Graded: {new Date(submission.updatedAt).toLocaleDateString()}
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message Student
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGradeSubmission(submission)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateAssignmentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onAssignmentCreated={handleAssignmentCreated}
        selectedStudents={selectedStudents}
      />
    </div>
  );
};
