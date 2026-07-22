import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Play, 
  Volume2, 
  Star, 
  Target,
  BookOpen,
  Award
} from 'lucide-react';
import { AdventureLesson } from './types';

interface AdventureViewerProps {
  adventure: AdventureLesson;
  onBack: () => void;
  onStartLesson?: () => void;
}

export const AdventureViewer: React.FC<AdventureViewerProps> = ({
  adventure,
  onBack,
  onStartLesson
}) => {
  const isLocked = adventure.completion_status === 'locked';
  const isCompleted = adventure.completion_status === 'completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Adventures
        </Button>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Adventure details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{adventure.level}</Badge>
                    <Badge variant="secondary">{adventure.cefr_level}</Badge>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{adventure.title}</CardTitle>
                  <p className="text-muted-foreground">{adventure.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Unit {adventure.unit_number}, Lesson {adventure.lesson_number}
                </div>
                <div className="flex items-center gap-1">
                  <Volume2 className="h-4 w-4" />
                  Phonics: {adventure.phonics_focus}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Learning objectives */}
              {adventure.learning_objectives && (
                <div>
                  <h3 className="flex items-center gap-2 font-medium mb-3">
                    <Target className="h-4 w-4" />
                    Learning Objectives
                  </h3>
                  <ul className="space-y-2">
                    {adventure.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Star className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vocabulary focus */}
              {adventure.vocabulary_focus && (
                <div>
                  <h3 className="font-medium mb-3">Key Vocabulary</h3>
                  <div className="flex flex-wrap gap-2">
                    {adventure.vocabulary_focus.map((word, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Letter focus */}
              <div>
                <h3 className="font-medium mb-3">Letter Focus</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {adventure.letter_focus}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Letter {adventure.letter_focus}</p>
                    <p className="text-sm text-muted-foreground">
                      Practice letter recognition, sounds, and words
                    </p>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="pt-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={onStartLesson}
                  disabled={isLocked}
                >
                  {isLocked ? (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Complete Previous Lessons to Unlock
                    </>
                  ) : isCompleted ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Review Lesson
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Lesson
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Lesson info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lesson Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span className="font-medium">{adventure.estimated_duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Level:</span>
                  <span className="font-medium">{adventure.cefr_level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Focus:</span>
                  <span className="font-medium">Phonics {adventure.phonics_focus}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pre-Starter Level</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  6 of 8 lessons completed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next lesson preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coming Next</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-sm">Numbers 4-5 & More Toys</p>
                <p className="text-xs text-muted-foreground">Letter G • 25-30 mins</p>
                <Badge variant="outline" className="text-xs">Phonics: G</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};