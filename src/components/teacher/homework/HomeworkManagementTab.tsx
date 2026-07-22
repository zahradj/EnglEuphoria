import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Users, Clock } from "lucide-react";
import { homeworkService, HomeworkAssignment } from "@/services/homeworkService";
import { useAuth } from "@/contexts/AuthContext";
import { CreateHomeworkDialog } from "./CreateHomeworkDialog";
import { SubmissionReviewDialog } from "./SubmissionReviewDialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export const HomeworkManagementTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<HomeworkAssignment | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    loadAssignments();
  }, [user]);

  const loadAssignments = async () => {
    if (!user) return;
    
    setLoading(true);
    const data = await homeworkService.getTeacherAssignments(user.id);
    setAssignments(data);
    setLoading(false);
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const openReviewDialog = (assignment: HomeworkAssignment) => {
    setSelectedAssignment(assignment);
    setIsReviewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Homework Management</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Loading assignments...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Homework Management</h1>
        <Button 
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <div className="grid gap-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Homework Assignments</h3>
              <p className="text-gray-500 mb-4">You haven't created any homework assignments yet.</p>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Assignment
              </Button>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                        {assignment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                    {assignment.instructions && (
                      <p className="text-xs text-gray-500 italic">{assignment.instructions}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-primary mb-1">{assignment.points} points</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Assigned to students</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created {format(new Date(assignment.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openReviewDialog(assignment)}
                    >
                      Review Submissions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateHomeworkDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={loadAssignments}
        studentIds={selectedStudents}
      />

      {selectedAssignment && (
        <SubmissionReviewDialog
          assignmentId={selectedAssignment.id}
          assignmentTitle={selectedAssignment.title}
          maxPoints={selectedAssignment.points}
          open={isReviewDialogOpen}
          onClose={() => {
            setIsReviewDialogOpen(false);
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
};
