
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Image, 
  BookOpen, 
  Gamepad2,
  Wand2,
  Download,
  Plus
} from "lucide-react";

export function OneOnOneAIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const { toast } = useToast();

  const contentTypes = [
    { value: "worksheet", label: "Worksheet", icon: FileText },
    { value: "image", label: "Educational Image", icon: Image },
    { value: "activity", label: "Interactive Activity", icon: Gamepad2 },
    { value: "lesson", label: "Lesson Plan", icon: BookOpen }
  ];

  const levels = [
    { value: "beginner", label: "Beginner (A1)" },
    { value: "elementary", label: "Elementary (A2)" },
    { value: "intermediate", label: "Intermediate (B1)" },
    { value: "upper-intermediate", label: "Upper-Intermediate (B2)" },
    { value: "advanced", label: "Advanced (C1)" }
  ];

  const handleGenerate = async () => {
    if (!prompt || !selectedType || !selectedLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate content.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const newContent = {
        id: Date.now(),
        type: selectedType,
        level: selectedLevel,
        prompt: prompt,
        title: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} - ${prompt.slice(0, 30)}...`,
        content: generateMockContent(selectedType, prompt, selectedLevel),
        createdAt: new Date().toISOString()
      };
      
      setGeneratedContent(prev => [newContent, ...prev]);
      setIsGenerating(false);
      setPrompt("");
      
      toast({
        title: "Content Generated!",
        description: `Your ${selectedType} has been created successfully.`,
      });
    }, 2000);
  };

  const generateMockContent = (type: string, prompt: string, level: string) => {
    switch (type) {
      case "worksheet":
        return {
          exercises: [
            "Fill in the blanks with the correct verb form",
            "Match the vocabulary words with their definitions",
            "Complete the sentences using the past tense"
          ]
        };
      case "image":
        return {
          description: `Educational illustration for: ${prompt}`,
          style: "Colorful, child-friendly illustration"
        };
      case "activity":
        return {
          type: "Interactive Quiz",
          questions: 5,
          duration: "10 minutes"
        };
      case "lesson":
        return {
          objectives: ["Students will be able to...", "Practice speaking skills", "Learn new vocabulary"],
          activities: ["Warm-up", "Main activity", "Wrap-up"]
        };
      default:
        return {};
    }
  };

  const insertToWhiteboard = (content: any) => {
    toast({
      title: "Added to Whiteboard",
      description: "Content has been inserted into the whiteboard.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Content Generation Form */}
      <Card className="p-4 mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Wand2 size={18} className="text-purple-600" />
          AI Content Generator
        </h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon size={16} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Textarea
            placeholder="Describe what you want to create... (e.g., 'Create a worksheet about animals for beginners')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={16} className="mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated Content List */}
      <div className="flex-1 overflow-y-auto">
        <h4 className="font-medium mb-3 text-gray-700">Generated Content</h4>
        
        {generatedContent.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wand2 size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No content generated yet.</p>
            <p className="text-sm">Use the form above to create materials.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedContent.map((content) => (
              <Card key={content.id} className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-sm">{content.title}</h5>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {content.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {content.level}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => insertToWhiteboard(content)}
                  >
                    <Plus size={14} className="mr-1" />
                    Add to Board
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download size={14} className="mr-1" />
                    Export
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
