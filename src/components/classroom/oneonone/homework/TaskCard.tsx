
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Mic, BookOpen } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: string;
  points: number;
}

interface TaskCardProps {
  task: Task;
  onClick: (taskId: string) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "writing":
        return FileText;
      case "audio":
        return Mic;
      case "reading":
        return BookOpen;
      default:
        return FileText;
    }
  };

  const IconComponent = getTypeIcon(task.type);

  return (
    <Card 
      className="p-3 cursor-pointer hover:shadow-sm transition-shadow"
      onClick={() => onClick(task.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded">
            <IconComponent size={16} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h5 className="font-medium text-sm">{task.title}</h5>
            <p className="text-xs text-gray-600 mt-1">{task.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Clock size={10} className="mr-1" />
                {task.dueDate}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {task.points} XP
              </Badge>
            </div>
          </div>
        </div>
        <Badge className={`${getStatusColor(task.status)} text-xs`}>
          {task.status}
        </Badge>
      </div>
    </Card>
  );
}
