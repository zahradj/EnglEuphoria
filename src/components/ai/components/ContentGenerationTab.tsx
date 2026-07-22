
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Gamepad2, BookOpen, HelpCircle, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentGenerationTabProps {
  topic: string;
  setTopic: (topic: string) => void;
  level: string;
  setLevel: (level: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  levels: Array<{ value: string; label: string }>;
  isGenerating: boolean;
  onGenerate: (type: 'worksheet' | 'activity' | 'lesson_plan') => void;
}

export function ContentGenerationTab({
  topic,
  setTopic,
  level,
  setLevel,
  duration,
  setDuration,
  levels,
  isGenerating,
  onGenerate
}: ContentGenerationTabProps) {
  const { toast } = useToast();

  const contentTypes = [
    { 
      type: 'worksheet' as const, 
      label: 'Worksheet', 
      icon: FileText, 
      description: 'Practice exercises and activities',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    { 
      type: 'activity' as const, 
      label: 'Activity', 
      icon: Gamepad2, 
      description: 'Interactive classroom activities',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    { 
      type: 'lesson_plan' as const, 
      label: 'Lesson Plan', 
      icon: BookOpen, 
      description: 'Complete lesson structure',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    { 
      type: 'quiz' as const, 
      label: 'Quiz', 
      icon: HelpCircle, 
      description: 'Assessment questions',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    },
    { 
      type: 'flashcards' as const, 
      label: 'Flashcards', 
      icon: CreditCard, 
      description: 'Vocabulary study cards',
      color: 'bg-pink-50 border-pink-200 hover:bg-pink-100'
    }
  ];

  const handleGenerate = (type: 'worksheet' | 'activity' | 'lesson_plan' | 'quiz' | 'flashcards') => {
    // Validate required fields
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your content.",
        variant: "destructive"
      });
      return;
    }

    if (!level) {
      toast({
        title: "Level Required", 
        description: "Please select a difficulty level.",
        variant: "destructive"
      });
      return;
    }

    
    // Call the generation function
    onGenerate(type as any);
  };

  const popularTopics = [
    'Animals', 'Food & Cooking', 'Travel', 'Family', 'Hobbies',
    'Weather', 'Transportation', 'Health', 'Shopping', 'Work'
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Topic Input */}
      <div className="space-y-2">
        <Label htmlFor="topic" className="text-sm font-medium">
          Topic *
        </Label>
        <Input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Animals, Food, Travel, Grammar..."
          className="w-full"
        />
        
        {/* Popular Topics */}
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Popular topics:</p>
          <div className="flex flex-wrap gap-1">
            {popularTopics.map((popularTopic) => (
              <Badge
                key={popularTopic}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 text-xs"
                onClick={() => setTopic(popularTopic)}
              >
                {popularTopic}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Level Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Level *</Label>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty level" />
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

      {/* Duration Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Duration (minutes)</Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="20">20 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Type Cards */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Choose Content Type</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contentTypes.map((contentType) => {
            const Icon = contentType.icon;
            return (
              <Card 
                key={contentType.type}
                className={`cursor-pointer transition-all duration-200 ${contentType.color} hover:shadow-md`}
                onClick={() => handleGenerate(contentType.type)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon size={16} />
                    {contentType.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-3">{contentType.description}</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={isGenerating || !topic.trim() || !level}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      `Generate ${contentType.label}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Be specific with your topic for better results. 
          For example, instead of "Grammar", try "Past Tense Verbs" or "Present Perfect".
        </p>
      </div>
    </div>
  );
}
