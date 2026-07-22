
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, CheckCircle, Clock, Trophy } from "lucide-react";

interface AssignmentTrackerProps {
  assignments: Array<{
    id: string;
    title: string;
    gameType: string;
    assignedTo: string[];
    status: string;
    completions: number;
    totalAssigned: number;
  }>;
}

export function AssignmentTracker({ assignments }: AssignmentTrackerProps) {
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => a.status === "active").length;
  const completedAssignments = assignments.filter(a => a.status === "completed").length;
  const totalStudentsAssigned = assignments.reduce((sum, a) => sum + a.totalAssigned, 0);
  const totalCompletions = assignments.reduce((sum, a) => sum + a.completions, 0);
  const completionRate = totalStudentsAssigned > 0 ? (totalCompletions / totalStudentsAssigned) * 100 : 0;

  const gameTypeData = assignments.reduce((acc, assignment) => {
    acc[assignment.gameType] = (acc[assignment.gameType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(gameTypeData).map(([type, count]) => ({
    gameType: type,
    count
  }));

  const pieData = [
    { name: "Completed", value: completedAssignments, color: "#10B981" },
    { name: "Active", value: activeAssignments, color: "#F59E0B" }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignments by Game Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gameType" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{assignment.title}</h4>
                  <p className="text-sm text-gray-600">
                    {assignment.assignedTo.length} students assigned
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={assignment.status === "completed" ? "default" : "secondary"}>
                    {assignment.status}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {assignment.completions}/{assignment.totalAssigned}
                    </div>
                    <div className="text-xs text-gray-600">completed</div>
                  </div>
                  <Progress 
                    value={(assignment.completions / assignment.totalAssigned) * 100} 
                    className="w-24"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
