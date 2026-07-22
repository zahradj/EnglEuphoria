
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GamePlayer } from "./GamePlayer";
import { Play, Clock, CheckCircle, Star, Trophy } from "lucide-react";

interface StudentAssignmentPanelProps {
  studentName: string;
}

export function StudentAssignmentPanel({ studentName }: StudentAssignmentPanelProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [assignments] = useState([
    {
      id: "1",
      title: "Vocabulary Matching - Animals",
      gameType: "word-match",
      assignedBy: "Ms. Johnson",
      dueDate: "Today",
      status: "pending",
      difficulty: "Easy",
      estimatedTime: "5 minutes",
      points: 50
    },
    {
      id: "2",
      title: "Past Tense Practice",
      gameType: "sentence-builder", 
      assignedBy: "Ms. Johnson",
      dueDate: "Tomorrow",
      status: "pending",
      difficulty: "Medium",
      estimatedTime: "10 minutes",
      points: 75
    },
    {
      id: "3",
      title: "Number Quiz",
      gameType: "quiz-spinner",
      assignedBy: "Ms. Johnson", 
      dueDate: "Yesterday",
      status: "completed",
      difficulty: "Easy",
      estimatedTime: "3 minutes",
      points: 100,
      score: 90
    }
  ]);

  const pendingAssignments = assignments.filter(a => a.status === "pending");
  const completedAssignments = assignments.filter(a => a.status === "completed");

  const handlePlayGame = (assignmentId: string) => {
    setSelectedAssignment(assignmentId);
  };

  const handleBackToAssignments = () => {
    setSelectedAssignment(null);
  };

  if (selectedAssignment) {
    const assignment = assignments.find(a => a.id === selectedAssignment);
    if (!assignment) return null;

    return (
      <GamePlayer 
        assignment={assignment}
        onBack={handleBackToAssignments}
        onComplete={(score) => {
          // Handle completion
          handleBackToAssignments();
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Assignments</h2>
        <p className="text-sm text-gray-600">Complete your assigned activities to earn points</p>
      </div>

      <Tabs defaultValue="pending" className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock size={16} />
            To Do ({pendingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle size={16} />
            Completed ({completedAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Trophy size={16} />
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="flex-1 space-y-4">
          {pendingAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    Due {assignment.dueDate}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Difficulty: {assignment.difficulty}</span>
                      <span>⏱️ {assignment.estimatedTime}</span>
                      <span>🏆 {assignment.points} points</span>
                    </div>
                    <p className="text-sm text-gray-500">Assigned by {assignment.assignedBy}</p>
                  </div>
                  <Button 
                    onClick={() => handlePlayGame(assignment.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play size={16} className="mr-2" />
                    Start
                  </Button>
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
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    <span className="font-bold text-green-600">{assignment.score}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Completed</span>
                      <span>🏆 {assignment.points} points earned</span>
                    </div>
                    <Progress value={assignment.score} className="w-32" />
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="progress" className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-500" />
                  Total Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">225</div>
                <p className="text-sm text-gray-600">Keep going to earn more!</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">75%</div>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
