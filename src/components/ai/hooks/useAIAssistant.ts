
import { useState } from "react";
import { useAIIntegration } from "@/hooks/useAIIntegration";
import { useToast } from "@/hooks/use-toast";

export const useAIAssistant = () => {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("30");
  const [activeTab, setActiveTab] = useState("generate");
  
  const { 
    isGenerating, 
    generatedContent, 
    generateWorksheet, 
    generateActivity, 
    generateLessonPlan,
    clearContent 
  } = useAIIntegration();
  
  const { toast } = useToast();

  const levels = [
    { value: "beginner", label: "Beginner (A1-A2)" },
    { value: "intermediate", label: "Intermediate (B1-B2)" },
    { value: "advanced", label: "Advanced (C1-C2)" }
  ];

  const handleGenerate = async (type: 'worksheet' | 'activity' | 'lesson_plan') => {
    if (!topic || !level) {
      toast({
        title: "Missing Information",
        description: "Please provide a topic and select a level.",
        variant: "destructive"
      });
      return;
    }

    switch (type) {
      case 'worksheet':
        await generateWorksheet(topic, level);
        break;
      case 'activity':
        await generateActivity(topic, level, parseInt(duration));
        break;
      case 'lesson_plan':
        await generateLessonPlan(topic, level, parseInt(duration));
        break;
    }

    setActiveTab("library");
  };

  return {
    topic,
    setTopic,
    level,
    setLevel,
    duration,
    setDuration,
    activeTab,
    setActiveTab,
    levels,
    isGenerating,
    generatedContent,
    handleGenerate,
    clearContent
  };
};
