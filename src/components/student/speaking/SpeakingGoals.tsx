import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Calendar, 
  Clock, 
  Award,
  Plus,
  Edit2,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { speakingPracticeService } from '@/services/speakingPracticeService';
import { StudentSpeakingGoals, SpeakingProgress } from '@/types/speaking';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SpeakingGoalsProps {
  progress?: SpeakingProgress | null;
}

export const SpeakingGoals: React.FC<SpeakingGoalsProps> = ({ progress }) => {
  const [goals, setGoals] = useState<StudentSpeakingGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    target_cefr_level: '',
    daily_practice_minutes: 15,
    weekly_sessions_goal: 5,
    focus_areas: [] as string[],
    deadline: ''
  });
  const { toast } = useToast();

  const cefrLevels = [
    { value: 'A1', label: 'A1 - Beginner', description: 'Basic phrases and simple conversations' },
    { value: 'A2', label: 'A2 - Elementary', description: 'Everyday topics and routine tasks' },
    { value: 'B1', label: 'B1 - Intermediate', description: 'Work, school, and leisure topics' },
    { value: 'B2', label: 'B2 - Upper Intermediate', description: 'Complex topics and abstract ideas' },
    { value: 'C1', label: 'C1 - Advanced', description: 'Fluent and spontaneous expression' },
    { value: 'C2', label: 'C2 - Mastery', description: 'Near-native proficiency' }
  ];

  const focusAreaOptions = [
    'pronunciation', 'fluency', 'grammar', 'vocabulary', 
    'listening comprehension', 'confidence', 'business english', 
    'academic english', 'conversational skills'
  ];

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const activeGoals = await speakingPracticeService.getActiveSpeakingGoals();
      setGoals(activeGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      // Handle database table not existing gracefully
      setGoals(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoals = async () => {
    try {
      if (!formData.target_cefr_level) {
        toast({
          title: "Validation Error",
          description: "Please select a target CEFR level.",
          variant: "destructive"
        });
        return;
      }

      const newGoals = await speakingPracticeService.createSpeakingGoals(formData);
      setGoals(newGoals);
      setIsDialogOpen(false);
      
      toast({
        title: "Goals Created! 🎯",
        description: "Your speaking goals have been set successfully."
      });
    } catch (error) {
      console.error('Error creating goals:', error);
      toast({
        title: "Error",
        description: "Failed to create goals. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateWeeklyProgress = () => {
    if (!goals || !progress) return 0;
    
    // Mock calculation - in real app, calculate based on recent sessions
    const sessionsThisWeek = Math.min(progress.total_sessions % 10, goals.weekly_sessions_goal);
    return (sessionsThisWeek / goals.weekly_sessions_goal) * 100;
  };

  const calculateDailyProgress = () => {
    if (!goals) return 0;
    
    // Mock calculation - in real app, calculate based on today's practice
    const minutesToday = Math.random() * goals.daily_practice_minutes; // Replace with actual data
    return Math.min((minutesToday / goals.daily_practice_minutes) * 100, 100);
  };

  const getCurrentLevelIndex = () => {
    const currentLevel = progress?.current_cefr_level || 'A1';
    return cefrLevels.findIndex(level => level.value === currentLevel);
  };

  const getTargetLevelIndex = () => {
    if (!goals) return 0;
    return cefrLevels.findIndex(level => level.value === goals.target_cefr_level);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Speaking Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!goals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Speaking Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Set personalized speaking goals to track your progress and stay motivated.
            </p>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Speaking Goals
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Set Your Speaking Goals</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-level">Target CEFR Level</Label>
                    <Select 
                      value={formData.target_cefr_level} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, target_cefr_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your target level" />
                      </SelectTrigger>
                      <SelectContent>
                        {cefrLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <div className="font-medium">{level.label}</div>
                              <div className="text-xs text-muted-foreground">{level.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="daily-minutes">Daily Practice (minutes)</Label>
                    <Input
                      id="daily-minutes"
                      type="number"
                      min="5"
                      max="120"
                      value={formData.daily_practice_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, daily_practice_minutes: parseInt(e.target.value) || 15 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weekly-sessions">Weekly Sessions Goal</Label>
                    <Input
                      id="weekly-sessions"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.weekly_sessions_goal}
                      onChange={(e) => setFormData(prev => ({ ...prev, weekly_sessions_goal: parseInt(e.target.value) || 5 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deadline">Target Deadline (Optional)</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                  
                  <Button onClick={handleCreateGoals} className="w-full">
                    Create Goals
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weeklyProgress = calculateWeeklyProgress();
  const dailyProgress = calculateDailyProgress();
  const currentLevelIndex = getCurrentLevelIndex();
  const targetLevelIndex = getTargetLevelIndex();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Speaking Goals</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level Progress</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{progress?.current_cefr_level || 'A1'}</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="secondary">{goals.target_cefr_level}</Badge>
              </div>
            </div>
            <Progress 
              value={(currentLevelIndex / Math.max(targetLevelIndex, 1)) * 100} 
              className="h-2"
            />
          </div>

          {/* Daily Practice */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Daily Practice</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Goal: {goals.daily_practice_minutes} min/day
              </span>
            </div>
            <Progress value={dailyProgress} className="h-2" />
          </div>

          {/* Weekly Sessions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Weekly Sessions</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Goal: {goals.weekly_sessions_goal} sessions/week
              </span>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
          </div>

          {/* Streaks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{goals.current_streak}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-secondary">{goals.longest_streak}</div>
              <div className="text-sm text-muted-foreground">Longest Streak</div>
            </div>
          </div>

          {/* Focus Areas */}
          {goals.focus_areas.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Focus Areas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {goals.focus_areas.map((area, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Deadline */}
          {goals.deadline && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Target Deadline</span>
              </div>
              <span className="text-sm font-medium">
                {new Date(goals.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};