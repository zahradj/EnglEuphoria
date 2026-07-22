
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wand2, 
  Image, 
  FileText, 
  Gamepad2, 
  BookOpen, 
  Sparkles, 
  Download,
  Copy,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AIAssistantTab = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  // Lesson Plan Generator
  const [lessonTopic, setLessonTopic] = useState("");
  const [lessonLevel, setLessonLevel] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");

  // Image Generator
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // Worksheet Generator
  const [worksheetType, setWorksheetType] = useState("");
  const [worksheetTopic, setWorksheetTopic] = useState("");
  const [worksheetLevel, setWorksheetLevel] = useState("");

  // Activity Generator
  const [activityType, setActivityType] = useState("");
  const [activityTopic, setActivityTopic] = useState("");
  const [activityAge, setActivityAge] = useState("");

  const generateLessonPlan = async () => {
    if (!lessonTopic || !lessonLevel) {
      toast({
        title: "Missing Information",
        description: "Please provide topic and level for the lesson plan.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation - in real app, this would call an AI API
    setTimeout(() => {
      const lessonPlan = `
# ${lessonTopic} - ${lessonLevel} Level

## Lesson Objectives:
- Students will be able to understand and use basic ${lessonTopic.toLowerCase()} vocabulary
- Students will practice pronunciation and speaking skills
- Students will complete written exercises to reinforce learning

## Materials Needed:
- Whiteboard/markers
- Audio recordings
- Worksheets
- Visual aids

## Lesson Structure (${lessonDuration || "45"} minutes):

### Warm-up (5 minutes)
- Greet students and review previous lesson
- Quick vocabulary review game

### Introduction (10 minutes)
- Introduce new ${lessonTopic.toLowerCase()} vocabulary
- Show visual aids and practice pronunciation

### Practice Activities (20 minutes)
- Guided practice with new vocabulary
- Role-play exercises
- Interactive games

### Assessment (5 minutes)
- Quick quiz or verbal check
- Address any questions

### Wrap-up (5 minutes)
- Summarize key points
- Assign homework
- Preview next lesson

## Homework Assignment:
Complete worksheet on ${lessonTopic.toLowerCase()} vocabulary and practice pronunciation using audio files.

## Assessment Criteria:
- Participation in class activities
- Correct pronunciation
- Understanding of new vocabulary
- Completion of exercises
      `;
      
      setGeneratedContent(lessonPlan);
      setIsGenerating(false);
      toast({
        title: "Lesson Plan Generated!",
        description: "Your AI-generated lesson plan is ready.",
      });
    }, 2000);
  };

  const generateImage = async () => {
    if (!imagePrompt) {
      toast({
        title: "Missing Prompt",
        description: "Please provide a description for the image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate image generation - in real app, this would call an AI image API
    setTimeout(() => {
      const mockImages = [
        "https://images.unsplash.com/photo-1588072432836-e10032774350?w=400",
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
        "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400"
      ];
      
      setGeneratedImages([mockImages[Math.floor(Math.random() * mockImages.length)]]);
      setIsGenerating(false);
      toast({
        title: "Image Generated!",
        description: "Your AI-generated image is ready for download.",
      });
    }, 3000);
  };

  const generateWorksheet = async () => {
    if (!worksheetType || !worksheetTopic) {
      toast({
        title: "Missing Information",
        description: "Please select worksheet type and provide a topic.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const worksheet = `
# ${worksheetType} - ${worksheetTopic}
## Level: ${worksheetLevel || "Beginner"}

### Instructions:
Complete the following exercises to practice your ${worksheetTopic.toLowerCase()} skills.

### Exercise 1: Vocabulary Matching
Match the words with their correct definitions:

1. Apple          a) A yellow fruit
2. Banana         b) A red fruit
3. Orange         c) An orange fruit

### Exercise 2: Fill in the Blanks
Complete the sentences with the correct words:

1. I like to eat ________ for breakfast.
2. The ________ is very sweet.
3. Can you pass me the ________?

### Exercise 3: Translation
Translate the following sentences:

1. I want an apple.
2. The banana is yellow.
3. Do you like oranges?

### Exercise 4: Speaking Practice
Practice saying these sentences aloud:
- "I would like to buy some fruits."
- "How much does this cost?"
- "Thank you very much."

### Answer Key:
Exercise 1: 1-b, 2-a, 3-c
Exercise 2: 1-fruit/apple, 2-banana, 3-orange
      `;
      
      setGeneratedContent(worksheet);
      setIsGenerating(false);
      toast({
        title: "Worksheet Generated!",
        description: "Your AI-generated worksheet is ready.",
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
      const activity = `
# ${activityType}: ${activityTopic}
## Age Group: ${activityAge || "All ages"}

### Activity Overview:
This engaging ${activityType.toLowerCase()} focuses on ${activityTopic.toLowerCase()} and is designed to be interactive and fun for students.

### Materials Needed:
- Whiteboard or flip chart
- Colored markers
- Timer
- Small prizes or stickers

### Instructions:

#### Setup (2 minutes):
1. Arrange students in small groups of 3-4
2. Explain the rules clearly
3. Set up materials for each group

#### Main Activity (15 minutes):
1. **Round 1**: Each group gets 30 seconds to brainstorm words related to ${activityTopic.toLowerCase()}
2. **Round 2**: Groups take turns acting out or drawing their words
3. **Round 3**: Quick-fire questions about ${activityTopic.toLowerCase()}

#### Wrap-up (3 minutes):
- Count points for each team
- Celebrate winners with small prizes
- Review key vocabulary learned

### Learning Outcomes:
- Enhanced vocabulary related to ${activityTopic.toLowerCase()}
- Improved speaking confidence
- Better teamwork skills
- Increased engagement with the topic

### Variations:
- For advanced students: Add more complex vocabulary
- For beginners: Use visual aids and simpler words
- Online version: Use breakout rooms and digital tools
      `;
      
      setGeneratedContent(activity);
      setIsGenerating(false);
      toast({
        title: "Activity Generated!",
        description: "Your AI-generated activity is ready.",
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
    element.download = "ai-generated-content.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded!",
      description: "Content saved to your device.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          AI Teaching Assistant
        </h1>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Powered by AI
        </Badge>
      </div>

      <Tabs defaultValue="lesson-plans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lesson-plans" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lesson Plans
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="worksheets" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Worksheets
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Activities
          </TabsTrigger>
        </TabsList>

        {/* Lesson Plans Tab */}
        <TabsContent value="lesson-plans">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Generate Lesson Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lesson-topic">Lesson Topic</Label>
                  <Input
                    id="lesson-topic"
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value)}
                    placeholder="e.g., Animals, Food, Family"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lesson-level">Student Level</Label>
                  <Select value={lessonLevel} onValueChange={setLessonLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                  <Select value={lessonDuration} onValueChange={setLessonDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateLessonPlan} 
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
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Lesson Plan
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
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {generatedContent}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Generate Educational Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-prompt">Image Description</Label>
                  <Textarea
                    id="image-prompt"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="e.g., A colorful illustration of farm animals for children, cartoon style"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="image-style">Art Style</Label>
                  <Select value={imageStyle} onValueChange={setImageStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="watercolor">Watercolor</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateImage} 
                  disabled={isGenerating}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Image className="h-4 w-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image} 
                          alt={`Generated ${index + 1}`}
                          className="w-full rounded-lg"
                        />
                        <Button 
                          size="sm" 
                          className="absolute top-2 right-2"
                          asChild
                        >
                          <a href={image} download={`ai-image-${index + 1}.jpg`}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Worksheets Tab */}
        <TabsContent value="worksheets">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate Worksheet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="worksheet-type">Worksheet Type</Label>
                  <Select value={worksheetType} onValueChange={setWorksheetType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vocabulary Practice">Vocabulary Practice</SelectItem>
                      <SelectItem value="Grammar Exercise">Grammar Exercise</SelectItem>
                      <SelectItem value="Reading Comprehension">Reading Comprehension</SelectItem>
                      <SelectItem value="Writing Practice">Writing Practice</SelectItem>
                      <SelectItem value="Listening Exercise">Listening Exercise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="worksheet-topic">Topic</Label>
                  <Input
                    id="worksheet-topic"
                    value={worksheetTopic}
                    onChange={(e) => setWorksheetTopic(e.target.value)}
                    placeholder="e.g., Fruits and Vegetables"
                  />
                </div>

                <div>
                  <Label htmlFor="worksheet-level">Difficulty Level</Label>
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
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {generatedContent}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <SelectItem value="Creative Project">Creative Project</SelectItem>
                      <SelectItem value="Discussion Activity">Discussion Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="activity-topic">Topic/Theme</Label>
                  <Input
                    id="activity-topic"
                    value={activityTopic}
                    onChange={(e) => setActivityTopic(e.target.value)}
                    placeholder="e.g., Daily Routines, Travel"
                  />
                </div>

                <div>
                  <Label htmlFor="activity-age">Age Group</Label>
                  <Select value={activityAge} onValueChange={setActivityAge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Children (5-10)">Children (5-10)</SelectItem>
                      <SelectItem value="Teenagers (11-17)">Teenagers (11-17)</SelectItem>
                      <SelectItem value="Adults (18+)">Adults (18+)</SelectItem>
                      <SelectItem value="All ages">All ages</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {generatedContent}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
