
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  FileText, 
  Image, 
  Gamepad2, 
  RefreshCw,
  Copy,
  Download,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClassroomAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClassroomAIAssistant({ isOpen, onClose }: ClassroomAIAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [activeTab, setActiveTab] = useState("quick-content");
  const { toast } = useToast();

  // Quick content generation
  const [quickPrompt, setQuickPrompt] = useState("");
  const [contentType, setContentType] = useState("");

  // Worksheet generator
  const [worksheetTopic, setWorksheetTopic] = useState("");
  const [worksheetLevel, setWorksheetLevel] = useState("");

  // Activity generator
  const [activityType, setActivityType] = useState("");
  const [activityTopic, setActivityTopic] = useState("");

  const generateQuickContent = async () => {
    if (!quickPrompt || !contentType) {
      toast({
        title: "Missing Information",
        description: "Please provide a prompt and select content type.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      let content = "";
      
      if (contentType === "explanation") {
        content = `## Quick Explanation: ${quickPrompt}

This is a simple explanation of ${quickPrompt.toLowerCase()}.

### Key Points:
- Main concept: Understanding the basics
- Why it's important: Helps with language learning
- How to practice: Use in daily conversations
- Example: "This is how you use it in a sentence."

### Tips for Students:
- Practice regularly
- Ask questions if unclear
- Use in real situations
- Don't worry about mistakes`;
      } else if (contentType === "exercise") {
        content = `## Quick Exercise: ${quickPrompt}

### Instructions:
Complete the following exercise to practice ${quickPrompt.toLowerCase()}.

### Exercise 1: Fill in the blanks
1. The _______ is very important.
2. I like to _______ every day.
3. Can you _______ this for me?

### Exercise 2: Match the following
A. Word 1          1. Definition A
B. Word 2          2. Definition B
C. Word 3          3. Definition C

### Answer Key:
Exercise 1: 1-concept, 2-practice, 3-explain
Exercise 2: A-2, B-3, C-1`;
      } else if (contentType === "game") {
        content = `## Fun Game: ${quickPrompt}

### Game Setup:
This interactive game helps students practice ${quickPrompt.toLowerCase()}.

### How to Play:
1. Divide students into teams
2. Each team gets 30 seconds per turn
3. Students must answer correctly to earn points
4. First team to 10 points wins!

### Sample Questions:
- Question 1: What is...?
- Question 2: How do you...?
- Question 3: Can you name...?

### Materials Needed:
- Timer
- Whiteboard
- Markers
- Small prizes for winners`;
      }
      
      setGeneratedContent(content);
      setIsGenerating(false);
      toast({
        title: "Content Generated!",
        description: "Your AI-generated content is ready to use.",
      });
    }, 2000);
  };

  const generateWorksheet = async () => {
    if (!worksheetTopic || !worksheetLevel) {
      toast({
        title: "Missing Information",
        description: "Please provide topic and level.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const worksheet = `# ${worksheetTopic} Practice - ${worksheetLevel} Level

## Student Name: _________________ Date: _________________

### Exercise 1: Vocabulary
Write the correct word for each definition:

1. _________________ (definition related to ${worksheetTopic.toLowerCase()})
2. _________________ (another definition)
3. _________________ (third definition)

### Exercise 2: Fill in the Blanks
Complete the sentences with words related to ${worksheetTopic.toLowerCase()}:

1. I like to __________ because it's fun.
2. The __________ is very important in daily life.
3. When I __________, I feel happy.

### Exercise 3: Short Answer
Answer the following questions in 1-2 sentences:

1. Why is ${worksheetTopic.toLowerCase()} important?
2. How often do you practice ${worksheetTopic.toLowerCase()}?
3. What is your favorite thing about ${worksheetTopic.toLowerCase()}?

### Exercise 4: Creative Writing
Write a short paragraph (3-4 sentences) about ${worksheetTopic.toLowerCase()}.
Use at least 3 new vocabulary words from today's lesson.

_________________________________
_________________________________
_________________________________
_________________________________

### Teacher Notes:
- Focus on pronunciation during oral review
- Encourage students to use new vocabulary
- Provide examples if students struggle`;
      
      setGeneratedContent(worksheet);
      setIsGenerating(false);
      toast({
        title: "Worksheet Generated!",
        description: "Your practice worksheet is ready for students.",
      });
    }, 2000);
  };

  const generateActivity = async () => {
    if (!activityType || !activityTopic) {
      toast({
        title: "Missing Information",
        description: "Please select activity type and provide a topic.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const activity = `# ${activityType}: ${activityTopic}

## Activity Overview
This ${activityType.toLowerCase()} is designed to help students practice ${activityTopic.toLowerCase()} in an engaging way.

## Duration: 10-15 minutes

## Materials Needed:
- Whiteboard/markers
- Timer
- Small rewards (stickers/points)

## Instructions:

### Setup (2 minutes):
1. Explain the rules clearly
2. Divide students into pairs or small groups
3. Set up any materials needed

### Main Activity (10 minutes):
1. **Round 1**: Students brainstorm words related to ${activityTopic.toLowerCase()}
2. **Round 2**: Practice using the words in sentences
3. **Round 3**: Quick game to test understanding

### Wrap-up (3 minutes):
- Review key vocabulary
- Award points or praise
- Ask for feedback

## Learning Objectives:
- Improve vocabulary related to ${activityTopic.toLowerCase()}
- Practice speaking and listening skills
- Build confidence in using new words
- Encourage collaboration

## Assessment:
- Observe student participation
- Check pronunciation and usage
- Note areas for improvement
- Celebrate successes

## Variations:
- For beginners: Use visual aids and simpler vocabulary
- For advanced: Add more complex sentences and grammar points
- Online version: Use breakout rooms and digital tools`;
      
      setGeneratedContent(activity);
      setIsGenerating(false);
      toast({
        title: "Activity Generated!",
        description: "Your classroom activity is ready to use.",
      });
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const downloadContent = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "classroom-ai-content.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded!",
      description: "Content saved to your device.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Teaching Assistant
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick-content">Quick Content</TabsTrigger>
            <TabsTrigger value="worksheet">Worksheet</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="quick-content" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generate Quick Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="quick-prompt">What do you need help with?</Label>
                    <Textarea
                      id="quick-prompt"
                      value={quickPrompt}
                      onChange={(e) => setQuickPrompt(e.target.value)}
                      placeholder="e.g., Explain past tense, Create vocabulary exercise"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content-type">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="explanation">Quick Explanation</SelectItem>
                        <SelectItem value="exercise">Practice Exercise</SelectItem>
                        <SelectItem value="game">Fun Game</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={generateQuickContent} 
                    disabled={isGenerating}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedContent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Generated Content
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={copyToClipboard}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadContent}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      {generatedContent}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="worksheet" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generate Worksheet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="worksheet-topic">Topic</Label>
                    <Input
                      id="worksheet-topic"
                      value={worksheetTopic}
                      onChange={(e) => setWorksheetTopic(e.target.value)}
                      placeholder="e.g., Animals, Food, Daily Routines"
                    />
                  </div>

                  <div>
                    <Label htmlFor="worksheet-level">Level</Label>
                    <Select value={worksheetLevel} onValueChange={setWorksheetLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={generateWorksheet} 
                    disabled={isGenerating}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Worksheet
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedContent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Generated Worksheet
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={copyToClipboard}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadContent}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      {generatedContent}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Generate Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="activity-type">Activity Type</Label>
                    <Select value={activityType} onValueChange={setActivityType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Group Game">Group Game</SelectItem>
                        <SelectItem value="Role-Play">Role-Play</SelectItem>
                        <SelectItem value="Interactive Quiz">Interactive Quiz</SelectItem>
                        <SelectItem value="Speaking Activity">Speaking Activity</SelectItem>
                        <SelectItem value="Writing Exercise">Writing Exercise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="activity-topic">Topic/Theme</Label>
                    <Input
                      id="activity-topic"
                      value={activityTopic}
                      onChange={(e) => setActivityTopic(e.target.value)}
                      placeholder="e.g., Shopping, Family, Hobbies"
                    />
                  </div>

                  <Button 
                    onClick={generateActivity} 
                    disabled={isGenerating}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        Generate Activity
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedContent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Generated Activity
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={copyToClipboard}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadContent}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      {generatedContent}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
