
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic } from "lucide-react";
import { FileUploadSection } from "./FileUploadSection";
import { ResponseSection } from "./ResponseSection";

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: string;
  points: number;
}

interface UploadedFile {
  id: number;
  name: string;
  type: string;
  uploadedAt: string;
}

interface TaskDetailViewProps {
  task: Task;
  uploadedFiles: UploadedFile[];
  textResponse: string;
  onBack: () => void;
  onFileUpload: () => void;
  onTextChange: (value: string) => void;
  onSubmitResponse: () => void;
}

export function TaskDetailView({
  task,
  uploadedFiles,
  textResponse,
  onBack,
  onFileUpload,
  onTextChange,
  onSubmitResponse
}: TaskDetailViewProps) {
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>
          ← Back to Tasks
        </Button>
        <Badge className={getStatusColor(task.status)}>
          {task.status}
        </Badge>
      </div>

      <Card className="flex-1 p-4">
        <h3 className="font-semibold mb-2">{task.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{task.description}</p>
        
        <div className="space-y-4">
          <ResponseSection
            textResponse={textResponse}
            onTextChange={onTextChange}
            onSubmitResponse={onSubmitResponse}
          />

          <FileUploadSection
            uploadedFiles={uploadedFiles}
            onFileUpload={onFileUpload}
          />

          {task.type === "audio" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Voice Recording:</label>
              <Button variant="outline" className="w-full">
                <Mic size={16} className="mr-2" />
                Start Recording
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
