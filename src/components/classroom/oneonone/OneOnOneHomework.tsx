
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TaskCard } from "./homework/TaskCard";
import { TaskDetailView } from "./homework/TaskDetailView";
import { MaterialCard } from "./homework/MaterialCard";

export function OneOnOneHomework() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [textResponse, setTextResponse] = useState("");
  const { toast } = useToast();

  const tasks = [
    {
      id: "vocab-practice",
      title: "Vocabulary Practice",
      description: "Write sentences using 5 new words from today's lesson",
      type: "writing",
      status: "pending",
      dueDate: "Tomorrow",
      points: 20
    },
    {
      id: "pronunciation",
      title: "Pronunciation Exercise", 
      description: "Record yourself saying the alphabet",
      type: "audio",
      status: "completed",
      dueDate: "Today",
      points: 15
    },
    {
      id: "reading-comprehension",
      title: "Reading Comprehension",
      description: "Read the short story and answer questions",
      type: "reading",
      status: "pending",
      dueDate: "In 2 days",
      points: 30
    }
  ];

  const materials = [
    {
      id: "story-pdf",
      title: "The Little Red Hen - Story",
      type: "PDF",
      url: "#"
    },
    {
      id: "vocab-list",
      title: "Vocabulary List - Animals",
      type: "PDF", 
      url: "#"
    },
    {
      id: "pronunciation-guide",
      title: "Pronunciation Guide",
      type: "Audio",
      url: "#"
    }
  ];

  const handleFileUpload = () => {
    const newFile = {
      id: Date.now(),
      name: "homework_submission.pdf",
      type: "PDF",
      uploadedAt: new Date().toISOString()
    };
    
    setUploadedFiles([...uploadedFiles, newFile]);
    toast({
      title: "File Uploaded",
      description: "Your homework has been submitted successfully!",
    });
  };

  const handleSubmitResponse = () => {
    if (!textResponse.trim()) return;
    
    toast({
      title: "Response Submitted",
      description: "Your written response has been submitted for review.",
    });
    setTextResponse("");
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(taskId);
  };

  const handleBackToTasks = () => {
    setSelectedTask(null);
  };

  if (selectedTask) {
    const task = tasks.find(t => t.id === selectedTask);
    if (!task) return null;

    return (
      <TaskDetailView
        task={task}
        uploadedFiles={uploadedFiles}
        textResponse={textResponse}
        onBack={handleBackToTasks}
        onFileUpload={handleFileUpload}
        onTextChange={setTextResponse}
        onSubmitResponse={handleSubmitResponse}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Active Tasks */}
      <div className="mb-4">
        <h4 className="font-medium mb-3 text-gray-700">Current Tasks</h4>
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={handleTaskSelect}
            />
          ))}
        </div>
      </div>

      {/* Learning Materials */}
      <div className="flex-1">
        <h4 className="font-medium mb-3 text-gray-700">Learning Materials</h4>
        <div className="space-y-2">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      </div>
    </div>
  );
}
