
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  FileText, 
  Image, 
  MessageSquare, 
  BookOpen, 
  Target,
  Wand2,
  Send,
  Copy,
  Download
} from "lucide-react";

interface StudentProfile {
  level: string;
  weaknesses: string[];
  recentTopics: string[];
  interests: string[];
}

interface EnhancedAIAssistantProps {
  studentProfile?: StudentProfile;
  onContentGenerated?: (content: string, type: string) => void;
  onInsertToWhiteboard?: (content: string) => void;
}

export function EnhancedAIAssistant({ 
  studentProfile, 
  onContentGenerated, 
  onInsertToWhiteboard 
}: EnhancedAIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'chat'>('generate');
  const [generationType, setGenerationType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const generationTypes = [
    {
      id: 'worksheet',
      name: 'Worksheet',
      icon: FileText,
      description: 'Create practice exercises',
      templates: [
        'Fill-in-the-blanks with [topic]',
        'Multiple choice questions about [topic]',
        'Matching exercise for [vocabulary words]',
        'Grammar practice with [grammar rule]'
      ]
    },
    {
      id: 'flashcards',
      name: 'Vocabulary Cards',
      icon: Image,
      description: 'Generate word cards with definitions',
      templates: [
        'Create flashcards for [topic] vocabulary',
        'Visual word cards for animals/colors/food',
        'Sight words for [level] students',
        'Phrasal verbs with examples'
      ]
    },
    {
      id: 'speaking',
      name: 'Speaking Prompts',
      icon: MessageSquare,
      description: 'Conversation starters and questions',
      templates: [
        'Discussion questions about [topic]',
        'Role-play scenarios for [situation]',
        'Pronunciation practice with [sounds]',
        'Storytelling prompts for [theme]'
      ]
    },
    {
      id: 'grammar',
      name: 'Grammar Explanation',
      icon: BookOpen,
      description: 'Clear grammar rules with examples',
      templates: [
        'Explain [grammar rule] with examples',
        'Common mistakes with [topic]',
        'Step-by-step guide to [grammar point]',
        'Visual grammar chart for [concept]'
      ]
    },
    {
      id: 'activities',
      name: 'Fun Activities',
      icon: Target,
      description: 'Interactive learning games',
      templates: [
        'Word game for [vocabulary set]',
        'Listening activity with [theme]',
        'Writing prompt about [topic]',
        'Interactive story with [characters]'
      ]
    }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || !generationType) return;

    setIsGenerating(true);
    
    // Simulate AI generation with student profile context
    const contextPrompt = studentProfile ? 
      `Student Level: ${studentProfile.level}
       Recent Topics: ${studentProfile.recentTopics.join(', ')}
       Areas to improve: ${studentProfile.weaknesses.join(', ')}
       Student interests: ${studentProfile.interests.join(', ')}
       
       Request: ${prompt}` : prompt;

    try {
      // Mock AI response - in real implementation, this would call OpenAI/Claude API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = generateMockContent(generationType, prompt, studentProfile);
      setGeneratedContent(mockContent);
      onContentGenerated?.(mockContent, generationType);
      
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContent = (type: string, userPrompt: string, profile?: StudentProfile) => {
    const level = profile?.level || 'Intermediate';
    
    switch (type) {
      case 'worksheet':
        return `# ${userPrompt} Worksheet (${level} Level)

## Fill in the blanks:
1. The cat is _______ the table. (under/on/in)
2. She _______ to school every day. (go/goes/going)
3. I have _______ apples. (much/many/a lot)

## Multiple Choice:
Choose the correct answer:
1. What time _______ you wake up?
   a) do   b) does   c) did

## Writing Exercise:
Write 3 sentences using the new vocabulary words.

---
*Generated for ${level} level student*`;

      case 'flashcards':
        return `# Vocabulary Flashcards: ${userPrompt}

**Card 1: Apple**
- Definition: A red or green fruit that grows on trees
- Example: "I eat an apple for breakfast."
- Pronunciation: /ˈæpəl/

**Card 2: Happy**
- Definition: Feeling pleased or content
- Example: "She is happy because it's her birthday."
- Pronunciation: /ˈhæpi/

**Card 3: House**
- Definition: A building where people live
- Example: "My house has a big garden."
- Pronunciation: /haʊs/

---
*Flashcards optimized for ${level} level*`;

      case 'speaking':
        return `# Speaking Practice: ${userPrompt}

## Warm-up Questions:
1. What's your favorite [topic]?
2. Can you describe...?
3. How do you feel about...?

## Role-play Scenario:
**Student:** You are ordering food at a restaurant
**Teacher:** You are the waiter

## Discussion Topics:
- Talk about your daily routine
- Describe your family
- Share your weekend plans

## Pronunciation Focus:
Practice these sounds: /th/, /r/, /l/
Words: think, three, red, light

---
*Adapted for ${level} speaking level*`;

      case 'grammar':
        return `# Grammar Lesson: ${userPrompt}

## Rule Explanation:
Present Simple is used for:
- Daily routines: "I wake up at 7 AM"
- Facts: "The sun rises in the east"
- Habits: "She drinks coffee every morning"

## Structure:
- Positive: Subject + verb (+s for he/she/it)
- Negative: Subject + don't/doesn't + verb
- Question: Do/Does + subject + verb?

## Examples:
✓ I work in an office.
✓ He works in a hospital.
✗ I works in an office. (incorrect)

## Practice:
Complete these sentences with the correct form...

---
*Simplified for ${level} level understanding*`;

      default:
        return `# ${userPrompt}

Custom content generated based on your request.
This would be tailored to ${level} level students.

Key points:
- Interactive elements
- Age-appropriate content
- Clear instructions
- Visual aids suggested

---
*Generated with AI assistance*`;
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleInsertToWhiteboard = () => {
    if (onInsertToWhiteboard) {
      onInsertToWhiteboard(generatedContent);
    }
  };

  const selectedType = generationTypes.find(t => t.id === generationType);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="text-purple-600" size={20} />
          AI Teaching Assistant
        </CardTitle>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'generate' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('generate')}
            className="text-xs"
          >
            <Wand2 size={12} className="mr-1" />
            Generate
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chat')}
            className="text-xs"
          >
            <MessageSquare size={12} className="mr-1" />
            Chat
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {activeTab === 'generate' && (
          <>
            {/* Student Context */}
            {studentProfile && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-blue-800 mb-2">Student Context</div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {studentProfile.level}
                  </Badge>
                  {studentProfile.recentTopics.slice(0, 2).map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Generation Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <div className="grid grid-cols-2 gap-2">
                {generationTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={generationType === type.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGenerationType(type.id)}
                      className="h-auto p-2 flex flex-col items-center text-xs"
                    >
                      <IconComponent size={14} className="mb-1" />
                      {type.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Templates */}
            {selectedType && (
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Templates</label>
                <div className="space-y-1">
                  {selectedType.templates.slice(0, 3).map((template, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrompt(template)}
                      className="w-full justify-start text-xs h-auto p-2 text-left"
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Prompt */}
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Request</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you'd like to generate..."
                className="min-h-[80px] text-sm"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !generationType}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={14} className="mr-2" />
                  Generate Content
                </>
              )}
            </Button>

            {/* Generated Content */}
            {generatedContent && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Generated Content</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyContent}
                      className="h-6 w-6 p-0"
                    >
                      <Copy size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleInsertToWhiteboard}
                      className="h-6 w-6 p-0"
                    >
                      <Send size={12} />
                    </Button>
                  </div>
                </div>
                <div className="bg-white p-2 rounded text-xs max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono">{generatedContent}</pre>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-gray-50 rounded-lg p-3 mb-3 overflow-y-auto min-h-[200px]">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">
                  <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                  <p>Ask me anything about teaching!</p>
                  <p className="text-xs">I can help with lesson ideas, explanations, and more.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-xs ${
                        message.role === 'user'
                          ? 'bg-blue-100 ml-4'
                          : 'bg-white mr-4'
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask me anything..."
                className="min-h-[60px] text-sm flex-1"
              />
              <Button size="sm" className="self-end">
                <Send size={14} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
