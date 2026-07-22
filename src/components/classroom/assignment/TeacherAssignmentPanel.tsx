
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateGameAssignmentDialog } from "./CreateGameAssignmentDialog";
import { AssignmentTracker } from "./AssignmentTracker";
import { Plus, Users, Trophy, Clock, CheckCircle } from "lucide-react";

export function TeacherAssignmentPanel() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // TODO: Replace with real data from API/database
  const [assignments, setAssignments] = useState<any[]>([]);

  const handleCreateAssignment = (assignment: any) => {
    const newAssignment = {
      id: Date.now().toString(),
      ...assignment,
      createdAt: new Date().toISOString(),
      status: "active",
      completions: 0,
      totalAssigned: assignment.assignedTo.length
    };
    setAssignments([...assignments, newAssignment]);
  };

  const activeAssignments = assignments.filter(a => a.status === "active");
  const completedAssignments = assignments.filter(a => a.status === "completed");

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Assignment Manager</h2>
          <p className="text-sm text-gray-600">Create and track game assignments for your students</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus size={16} className="mr-2" />
          Create Assignment
        </Button>
      </div>

      <Tabs defaultValue="active" className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock size={16} />
            Active ({activeAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle size={16} />
            Completed ({completedAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Trophy size={16} />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 space-y-4">
          {activeAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {assignment.gameType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {assignment.assignedTo.length} students
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={14} />
                      {assignment.completions}/{assignment.totalAssigned} completed
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Send Reminder</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="flex-1 space-y-4">
          {completedAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {assignment.assignedTo.length} students
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy size={14} />
                      100% completion rate
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Results</Button>
                    <Button size="sm" variant="outline">Reassign</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="flex-1">
          <AssignmentTracker assignments={assignments} />
        </TabsContent>
      </Tabs>

      <CreateGameAssignmentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateAssignment={handleCreateAssignment}
      />
    </div>
  );
}
