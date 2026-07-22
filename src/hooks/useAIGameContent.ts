
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface GameContentRequest {
  gameType: 'drag-drop' | 'spinner' | 'dice' | 'story';
  difficulty: number;
  topic?: string;
  studentLevel?: string;
  ageGroup?: 'young' | 'teen' | 'adult';
}

interface GeneratedContent {
  id: string;
  content: any;
  metadata: {
    gameType: string;
    difficulty: number;
    topic: string;
    generatedAt: Date;
  };
}

export function useAIGameContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const { toast } = useToast();

  const generateContent = useCallback(async (request: GameContentRequest): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    
    try {
      // Simulate AI content generation - in a real app, this would call an AI service
      const content = await simulateAIGeneration(request);
      
      const generatedItem: GeneratedContent = {
        id: `generated-${Date.now()}`,
        content,
        metadata: {
          gameType: request.gameType,
          difficulty: request.difficulty,
          topic: request.topic || 'General',
          generatedAt: new Date()
        }
      };

      setGeneratedContent(prev => [generatedItem, ...prev.slice(0, 9)]); // Keep last 10
      
      toast({
        title: "Content Generated! 🎯",
        description: `New ${request.gameType} content created`,
      });

      return generatedItem;
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate content. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const getAdaptiveContent = useCallback((studentPerformance: number, lastGameType: string) => {
    // AI-driven content adaptation based on student performance
    let difficulty = 1;
    let suggestedGameType: GameContentRequest['gameType'] = 'drag-drop';

    if (studentPerformance > 80) {
      difficulty = Math.min(5, 3);
      suggestedGameType = 'story';
    } else if (studentPerformance > 60) {
      difficulty = 2;
      suggestedGameType = lastGameType === 'drag-drop' ? 'spinner' : 'drag-drop';
    } else {
      difficulty = 1;
      suggestedGameType = 'drag-drop';
    }

    return {
      gameType: suggestedGameType,
      difficulty,
      topic: 'adaptive',
      studentLevel: 'A1'
    };
  }, []);

  const clearHistory = useCallback(() => {
    setGeneratedContent([]);
  }, []);

  return {
    isGenerating,
    generatedContent,
    generateContent,
    getAdaptiveContent,
    clearHistory
  };
}

// Simulate AI content generation
async function simulateAIGeneration(request: GameContentRequest): Promise<any> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const contentTemplates = {
    'drag-drop': {
      1: { // Beginner
        pairs: [
          { word: 'Cat', definition: 'A small pet animal' },
          { word: 'Sun', definition: 'Bright light in the sky' },
          { word: 'Book', definition: 'Something you read' },
          { word: 'Car', definition: 'A vehicle with four wheels' }
        ]
      },
      2: { // Intermediate
        pairs: [
          { word: 'Magnificent', definition: 'Very beautiful or impressive' },
          { word: 'Determine', definition: 'To decide or find out' },
          { word: 'Elaborate', definition: 'Complex and detailed' },
          { word: 'Substantial', definition: 'Large in amount or important' }
        ]
      }
    },
    'spinner': {
      1: [
        "What is your favorite color?", "Count to 5", "Name an animal",
        "Point to your nose", "Say 'Hello'", "Clap your hands"
      ],
      2: [
        "Describe your bedroom", "What did you eat yesterday?", "Tell me about school",
        "What makes you happy?", "Describe the weather", "Name three countries"
      ]
    },
    'dice': {
      1: {
        vocabulary: ['Happy', 'Sad', 'Big', 'Small', 'Red', 'Blue'],
        actions: ['Run', 'Jump', 'Sing', 'Dance', 'Sleep', 'Eat']
      },
      2: {
        adjectives: ['Beautiful', 'Mysterious', 'Ancient', 'Modern', 'Peaceful', 'Exciting'],
        locations: ['Mountain', 'Ocean', 'City', 'Forest', 'Desert', 'Island']
      }
    },
    'story': {
      1: {
        characters: ['Friendly dog', 'Kind teacher', 'Helpful robot'],
        settings: ['School playground', 'Sunny park', 'Cozy home'],
        problems: ['Lost toy', 'Rainy day', 'New friend']
      },
      2: {
        characters: ['Brave explorer', 'Wise wizard', 'Clever detective'],
        settings: ['Ancient castle', 'Mysterious island', 'Bustling city'],
        problems: ['Hidden treasure', 'Magic spell', 'Important mystery']
      }
    }
  };

  const difficultyLevel = Math.min(request.difficulty, 2);
  const template = contentTemplates[request.gameType]?.[difficultyLevel] || contentTemplates[request.gameType]?.[1];

  return {
    ...template,
    topic: request.topic,
    difficulty: request.difficulty,
    adaptiveHints: generateAdaptiveHints(request.difficulty),
    scoringRubric: generateScoringRubric(request.difficulty)
  };
}

function generateAdaptiveHints(difficulty: number): string[] {
  const hints = {
    1: ["Take your time", "Look for matching words", "Try reading aloud"],
    2: ["Think about word meanings", "Consider context clues", "Use examples"],
    3: ["Apply grammar rules", "Consider multiple meanings", "Think critically"]
  };
  
  return hints[Math.min(difficulty, 3) as keyof typeof hints] || hints[1];
}

function generateScoringRubric(difficulty: number): Record<string, number> {
  return {
    correct: difficulty * 10,
    partial: difficulty * 5,
    attempt: difficulty * 2,
    bonus: difficulty * 15
  };
}
