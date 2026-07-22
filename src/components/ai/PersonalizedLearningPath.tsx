import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Play, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface LearningPath {
  id: string;
  path_name: string;
  current_step: number;
  total_steps: number;
  completion_percentage: number;
  learning_style: string;
  difficulty_preference: string;
  estimated_completion_days: number;
  path_data: any;
}

interface PersonalizedLearningPathProps {
  studentId: string;
  cefrLevel: string;
  activePath: LearningPath | null;
  onGeneratePath: () => void;
  isLoading: boolean;
}

export const PersonalizedLearningPath: React.FC<PersonalizedLearningPathProps> = ({
  studentId,
  cefrLevel,
  activePath,
  onGeneratePath,
  isLoading
}) => {
  if (!activePath) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Personalized Learning Path
          </CardTitle>
          <CardDescription>
            AI-generated learning sequence tailored to your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="p-8 border-2 border-dashed border-muted rounded-lg">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No learning path generated yet. Let our AI create a personalized journey for you!
              </p>
              <Button 
                onClick={onGeneratePath}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate AI Learning Path'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const contentSequence = activePath.path_data?.content_sequence || [];
  const currentContent = contentSequence[activePath.current_step - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {activePath.path_name}
        </CardTitle>
        <CardDescription>
          AI-generated learning path • {activePath.total_steps} steps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(activePath.completion_percentage)}%
            </span>
          </div>
          <Progress value={activePath.completion_percentage} className="w-full" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {activePath.current_step} of {activePath.total_steps}</span>
            <span>~{activePath.estimated_completion_days} days estimated</span>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{activePath.learning_style}</Badge>
          <Badge variant="outline">{activePath.difficulty_preference}</Badge>
        </div>

        {/* Current Step */}
        {currentContent && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary rounded-lg">
                <Play className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-medium">Current Step</h4>
                <p className="text-sm text-muted-foreground">{currentContent.title}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>Level {currentContent.difficulty_level}/10</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{currentContent.estimated_duration}min</span>
              </div>
            </div>

            <Button className="w-full mt-4" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          </div>
        )}

        {/* Next Steps Preview */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Upcoming Steps</h4>
          <div className="space-y-2">
            {contentSequence.slice(activePath.current_step, activePath.current_step + 3).map((content: any, index: number) => (
              <div key={content.content_id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="p-1 border rounded">
                  <span className="text-xs font-medium text-muted-foreground">
                    {activePath.current_step + index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{content.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Level {content.difficulty_level} • {content.estimated_duration}min
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Full Path
          </Button>
          <Button 
            onClick={onGeneratePath}
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};