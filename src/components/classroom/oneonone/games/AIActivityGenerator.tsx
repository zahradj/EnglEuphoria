
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIGeneratedActivity {
  title: string;
  description: string;
  type: string;
  content: {
    questions?: string[];
    words?: string[];
    sentences?: string[];
    vocabulary?: { word: string; definition: string }[];
  };
}

interface AIActivityGeneratorProps {
  onActivityGenerated: (activity: AIGeneratedActivity) => void;
}

export function AIActivityGenerator({ onActivityGenerated }: AIActivityGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [activityType, setActivityType] = useState("");
  const [learningObjective, setLearningObjective] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const levels = [
    { value: "beginner", label: "Beginner (A1-A2)" },
    { value: "intermediate", label: "Intermediate (B1-B2)" },
    { value: "advanced", label: "Advanced (C1-C2)" }
  ];

  const activityTypes = [
    { value: "vocabulary", label: "Vocabulary Building" },
    { value: "grammar", label: "Grammar Practice" },
    { value: "reading", label: "Reading Comprehension" },
    { value: "speaking", label: "Speaking Practice" },
    { value: "listening", label: "Listening Skills" },
    { value: "writing", label: "Writing Exercise" }
  ];

  const generateActivity = async () => {
    if (!topic || !level || !activityType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI generation (in real implementation, this would call an AI API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const generatedActivity: AIGeneratedActivity = {
        title: `AI-Generated ${activityType} Activity: ${topic}`,
        description: `Interactive ${activityType} exercise focused on ${topic} for ${level} level students`,
        type: activityType,
        content: generateContentByType(activityType, topic, level)
      };

      onActivityGenerated(generatedActivity);

      toast({
        title: "🤖 Activity Generated!",
        description: "Your AI-powered activity is ready to use!",
      });

      // Reset form
      setTopic("");
      setLevel("");
      setActivityType("");
      setLearningObjective("");

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate activity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContentByType = (type: string, topic: string, level: string) => {
    switch (type) {
      case "vocabulary":
        return {
          words: [
            `${topic}-related word 1`,
            `${topic}-related word 2`,
            `${topic}-related word 3`,
            `${topic}-related word 4`,
            `${topic}-related word 5`
          ],
          vocabulary: [
            { word: "Example", definition: `A ${level}-level definition related to ${topic}` },
            { word: "Sample", definition: `Another ${level}-level definition for ${topic}` }
          ]
        };
      case "grammar":
        return {
          questions: [
            `Complete the sentence about ${topic}: "The _____ is very important."`,
            `Choose the correct form: "Students (study/studies) ${topic} every day."`,
            `Rewrite this sentence using past tense: "We learn about ${topic}."`
          ]
        };
      case "reading":
        return {
          questions: [
            `Read the passage about ${topic} and answer: What is the main idea?`,
            `According to the text, why is ${topic} important?`,
            `Find three key facts about ${topic} from the passage.`
          ]
        };
      default:
        return {
          questions: [
            `${type} question 1 about ${topic}`,
            `${type} question 2 about ${topic}`,
            `${type} question 3 about ${topic}`
          ]
        };
    }
  };

  return (
    <Card className="p-6 border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-purple-100 rounded-full">
            <Sparkles size={32} className="text-purple-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-purple-800 mb-2">AI Activity Generator</h3>
        <p className="text-purple-600">Let AI create personalized activities for your students</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Animals, Food, Travel"
            />
          </div>

          <div>
            <Label htmlFor="level">Student Level *</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((levelOption) => (
                  <SelectItem key={levelOption.value} value={levelOption.value}>
                    {levelOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="activity-type">Activity Type *</Label>
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger>
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="objective">Learning Objective (Optional)</Label>
          <Textarea
            id="objective"
            value={learningObjective}
            onChange={(e) => setLearningObjective(e.target.value)}
            placeholder="What should students learn from this activity?"
            rows={2}
          />
        </div>

        <Button 
          onClick={generateActivity} 
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Generating Activity...
            </>
          ) : (
            <>
              <Zap size={16} className="mr-2" />
              Generate AI Activity
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Sparkles size={16} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">AI Features:</p>
            <ul className="text-xs space-y-1">
              <li>• Automatically generates level-appropriate content</li>
              <li>• Creates engaging questions and activities</li>
              <li>• Adapts to different learning styles</li>
              <li>• Provides instant, personalized activities</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
