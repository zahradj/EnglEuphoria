
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AIGenerationRequest {
  type: 'worksheet' | 'activity' | 'lesson_plan' | 'quiz';
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  customPrompt?: string;
}

interface AIGeneratedContent {
  id: string;
  type: string;
  title: string;
  content: any;
  metadata: {
    topic: string;
    level: string;
    generatedAt: Date;
    estimatedDuration?: number;
  };
}

export const useAIIntegration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent[]>([]);
  const { toast } = useToast();

  const generateContent = async (request: AIGenerationRequest): Promise<AIGeneratedContent | null> => {
    setIsGenerating(true);
    
    try {
      // This will be replaced with actual API call when backend is connected
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedContent: AIGeneratedContent = {
        id: Date.now().toString(),
        type: request.type,
        title: `AI-Generated ${request.type.replace('_', ' ')} - ${request.topic}`,
        content: generateMockContent(request),
        metadata: {
          topic: request.topic,
          level: request.level,
          generatedAt: new Date(),
          estimatedDuration: request.duration
        }
      };

      setGeneratedContent(prev => [generatedContent, ...prev]);
      
      toast({
        title: "🤖 Content Generated!",
        description: `Your ${request.type.replace('_', ' ')} is ready to use.`,
      });

      return generatedContent;
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWorksheet = (topic: string, level: string) => {
    return generateContent({
      type: 'worksheet',
      topic,
      level: level as any,
      duration: 30
    });
  };

  const generateActivity = (topic: string, level: string, duration: number = 20) => {
    return generateContent({
      type: 'activity',
      topic,
      level: level as any,
      duration
    });
  };

  const generateLessonPlan = (topic: string, level: string, duration: number = 60) => {
    return generateContent({
      type: 'lesson_plan',
      topic,
      level: level as any,
      duration
    });
  };

  const clearContent = () => {
    setGeneratedContent([]);
  };

  return {
    isGenerating,
    generatedContent,
    generateContent,
    generateWorksheet,
    generateActivity,
    generateLessonPlan,
    clearContent
  };
};

// Mock content generator - will be replaced with real AI API
const generateMockContent = (request: AIGenerationRequest) => {
  const { type, topic, level } = request;
  
  switch (type) {
    case 'worksheet':
      return {
        exercises: [
          {
            type: 'fill_blank',
            instruction: `Complete the sentences about ${topic}`,
            questions: [
              `The ${topic} is very ______.`,
              `Students learn about ${topic} in ______.`,
              `${topic} helps us understand ______.`
            ]
          },
          {
            type: 'multiple_choice',
            instruction: `Choose the correct answer about ${topic}`,
            questions: [
              {
                question: `What is the most important aspect of ${topic}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correct: 0
              }
            ]
          }
        ]
      };
    
    case 'activity':
      return {
        type: 'interactive',
        instructions: `Interactive ${level} level activity about ${topic}`,
        steps: [
          `Introduce the topic: ${topic}`,
          `Students discuss their experience with ${topic}`,
          `Practice exercise related to ${topic}`,
          'Review and summarize key points'
        ],
        materials: ['Whiteboard', 'Handouts', 'Audio/Video resources']
      };
    
    case 'lesson_plan':
      return {
        objectives: [
          `Students will understand the basics of ${topic}`,
          `Students will be able to discuss ${topic} confidently`
        ],
        activities: [
          { time: '10min', activity: 'Warm-up and introduction' },
          { time: '20min', activity: `Main lesson on ${topic}` },
          { time: '15min', activity: 'Practice exercises' },
          { time: '10min', activity: 'Review and homework assignment' },
          { time: '5min', activity: 'Wrap-up and questions' }
        ],
        homework: `Complete exercises 1-5 on ${topic}`,
        resources: [`${topic} textbook`, 'Online resources', 'Practice worksheets']
      };
    
    default:
      return { content: `Generated content for ${topic} at ${level} level` };
  }
};
