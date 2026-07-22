import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, Lock, CheckCircle, Clock } from 'lucide-react';
import { AdventureLesson } from './types';


interface AdventuresLibraryProps {
  onSelectAdventure?: (adventure: AdventureLesson) => void;
  onAddToWhiteboard?: (adventure: AdventureLesson) => void;
}

const helloAdventuresData: AdventureLesson[] = [
  // Pre-Starter Level
  {
    id: "adventure-a",
    title: "Hello, My Name Is... (Letter A)",
    level: "Pre-Starter",
    cefr_level: "Absolute Beginner",
    phonics_focus: "A",
    estimated_duration: "20-25 mins",
    completion_status: "completed",
    unit_number: 1,
    lesson_number: 1,
    description: "Basic greetings and self-introduction",
    learning_objectives: ["Learn letter A", "Practice greetings", "Self-introduction"],
    vocabulary_focus: ["Hello", "My name is", "A words"],
    letter_focus: "A"
  },
  {
    id: "adventure-b",
    title: "My Colors (Red, Blue, Yellow) (Letter B)",
    level: "Pre-Starter",
    cefr_level: "Absolute Beginner",
    phonics_focus: "B",
    estimated_duration: "20-25 mins",
    completion_status: "completed",
    unit_number: 2,
    lesson_number: 1,
    description: "Learning primary colors",
    learning_objectives: ["Learn letter B", "Identify colors", "Color vocabulary"],
    vocabulary_focus: ["Red", "Blue", "Yellow", "B words"],
    letter_focus: "B"
  },
  {
    id: "adventure-c",
    title: "Green, Black, White (Letter C)",
    level: "Pre-Starter",
    cefr_level: "Absolute Beginner",
    phonics_focus: "C",
    estimated_duration: "20-25 mins",
    completion_status: "completed",
    unit_number: 2,
    lesson_number: 2,
    description: "Expanding color vocabulary",
    learning_objectives: ["Learn letter C", "More colors", "Color recognition"],
    vocabulary_focus: ["Green", "Black", "White", "C words"],
    letter_focus: "C"
  },
  {
    id: "adventure-d",
    title: "All Colors Practice (Letter D)",
    level: "Pre-Starter",
    cefr_level: "Absolute Beginner",
    phonics_focus: "D",
    estimated_duration: "25-30 mins",
    completion_status: "completed",
    unit_number: 2,
    lesson_number: 3,
    description: "Rainbow review and color practice",
    learning_objectives: ["Learn letter D", "Review all colors", "Color games"],
    vocabulary_focus: ["All colors", "D words", "Color combinations"],
    letter_focus: "D"
  },
  {
    id: "adventure-e",
    title: "Color Review & Games (Letter E)",
    level: "Pre-Starter",
    cefr_level: "Absolute Beginner",
    phonics_focus: "E",
    estimated_duration: "25-30 mins",
    completion_status: "completed",
    unit_number: 2,
    lesson_number: 4,
    description: "Interactive color games and activities",
    learning_objectives: ["Learn letter E", "Color games", "Interactive practice"],
    vocabulary_focus: ["Color review", "E words", "Game vocabulary"],
    letter_focus: "E"
  },
  {
    id: "adventure-f",
    title: "Numbers 1-3 & Toys (Letter F)",
    level: "Pre-Starter",
    cefr_level: "Absolute Beginner",
    phonics_focus: "F",
    estimated_duration: "25-30 mins",
    completion_status: "completed",
    unit_number: 3,
    lesson_number: 1,
    description: "Basic numbers and toy vocabulary",
    learning_objectives: ["Learn letter F", "Numbers 1-3", "Toy names"],
    vocabulary_focus: ["One", "Two", "Three", "Toys", "F words"],
    letter_focus: "F"
  },
  {
    id: "adventure-h",
    title: "Mom, Dad, Sister, Brother",
    level: "Beginner",
    cefr_level: "Beginner",
    phonics_focus: "H-J",
    estimated_duration: "25-30 mins",
    completion_status: "locked",
    unit_number: 1,
    lesson_number: 1,
    description: "Family members vocabulary",
    learning_objectives: ["Family vocabulary", "Relationships", "Letters H-J"],
    vocabulary_focus: ["Mom", "Dad", "Sister", "Brother"],
    letter_focus: "H-J"
  },
  {
    id: "adventure-k",
    title: "Head, Eyes, Nose, Mouth",
    level: "Beginner",
    cefr_level: "Beginner",
    phonics_focus: "K-M",
    estimated_duration: "25-30 mins",
    completion_status: "locked",
    unit_number: 2,
    lesson_number: 1,
    description: "Body parts vocabulary",
    learning_objectives: ["Body parts", "Face features", "Letters K-M"],
    vocabulary_focus: ["Head", "Eyes", "Nose", "Mouth"],
    letter_focus: "K-M"
  }
];

export const AdventuresLibrary: React.FC<AdventuresLibraryProps> = ({
  onSelectAdventure,
  onAddToWhiteboard
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  
  const levels = ['all', 'Pre-Starter', 'Beginner', 'A1 Elementary', 'A2 Pre-Intermediate'];
  
  const filteredAdventures = selectedLevel === 'all' 
    ? helloAdventuresData 
    : helloAdventuresData.filter(adventure => adventure.level === selectedLevel);

  const getCompletionStats = () => {
    const completed = helloAdventuresData.filter(a => a.completion_status === 'completed').length;
    const total = helloAdventuresData.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const stats = getCompletionStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Play className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'locked':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-6">


      {/* Header with progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            A-Name's Adventures
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{stats.completed} of {stats.total} completed</span>
              <span>{stats.percentage}%</span>
            </div>
            <Progress value={stats.percentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Level filter */}
      <div className="flex gap-2 flex-wrap">
        {levels.map((level) => (
          <Button
            key={level}
            variant={selectedLevel === level ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLevel(level)}
          >
            {level === 'all' ? 'All Levels' : level}
          </Button>
        ))}
      </div>

      {/* Adventures grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAdventures.map((adventure) => (
          <Card 
            key={adventure.id} 
            className={`transition-all hover:shadow-md ${
              adventure.completion_status === 'locked' ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(adventure.completion_status)}
                  <Badge variant="outline" className="text-xs">
                    {adventure.level}
                  </Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(adventure.completion_status)}`}
                >
                  {adventure.completion_status}
                </Badge>
              </div>
              <CardTitle className="text-base line-clamp-2">
                {adventure.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Phonics:</span>
                  <Badge variant="secondary" className="text-xs">
                    {adventure.phonics_focus}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{adventure.estimated_duration}</span>
                </div>
                {adventure.description && (
                  <p className="text-xs line-clamp-2">{adventure.description}</p>
                )}
              </div>

              {adventure.vocabulary_focus && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Vocabulary:</p>
                  <div className="flex flex-wrap gap-1">
                    {adventure.vocabulary_focus.slice(0, 3).map((word, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {word}
                      </Badge>
                    ))}
                    {adventure.vocabulary_focus.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{adventure.vocabulary_focus.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onSelectAdventure?.(adventure)}
                  disabled={adventure.completion_status === 'locked'}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onAddToWhiteboard?.(adventure)}
                  disabled={adventure.completion_status === 'locked'}
                >
                  Add to Board
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAdventures.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No adventures found for the selected level.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};