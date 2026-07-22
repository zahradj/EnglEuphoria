import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Target,
  Clock,
  Sparkles,
  CheckCircle,
  Users,
  MessageSquare
} from 'lucide-react';

interface Slide {
  slide_number: number;
  title: string;
  content: string;
  duration: number;
  activity_type: string;
  interactive_elements?: string[];
  teacher_notes?: string;
  gamification?: {
    points_possible: number;
    badges?: string[];
    challenges?: string[];
  };
}

interface SlidesData {
  slides: Slide[];
  total_slides: number;
  total_duration: number;
  gamification?: {
    total_points: number;
    achievement_badges: string[];
    progress_tracking: string;
  };
}

interface LessonSlidesViewerProps {
  slidesData: SlidesData;
  className?: string;
  isFullscreen?: boolean;
  onSlideChange?: (slideNumber: number) => void;
}

export function LessonSlidesViewer({ 
  slidesData, 
  className = "", 
  isFullscreen = false,
  onSlideChange 
}: LessonSlidesViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [badgesUnlocked, setBadgesUnlocked] = useState<string[]>([]);

  const slides = slidesData.slides || [];
  const slide = slides[currentSlide];

  useEffect(() => {
    if (slide) {
      setTimeRemaining(slide.duration * 60); // Convert minutes to seconds
    }
  }, [currentSlide, slide]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      const newSlide = currentSlide + 1;
      setCurrentSlide(newSlide);
      onSlideChange?.(newSlide);
      
      // Award points for completing slide
      if (slide?.gamification?.points_possible) {
        setPointsEarned(prev => prev + slide.gamification.points_possible);
      }
      
      // Check for badge unlocks
      if (slide?.gamification?.badges) {
        setBadgesUnlocked(prev => [...new Set([...prev, ...slide.gamification.badges])]);
      }
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      const newSlide = currentSlide - 1;
      setCurrentSlide(newSlide);
      onSlideChange?.(newSlide);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    onSlideChange?.(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetTimer = () => {
    if (slide) {
      setTimeRemaining(slide.duration * 60);
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'warm_up': return '🔥';
      case 'vocabulary': return '📚';
      case 'grammar': return '⚡';
      case 'activity': return '🎮';
      case 'speaking': return '🗣️';
      case 'review': return '🔄';
      default: return '📝';
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'warm_up': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'vocabulary': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'grammar': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'activity': return 'bg-green-100 text-green-800 border-green-300';
      case 'speaking': return 'bg-red-100 text-red-800 border-red-300';
      case 'review': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (!slides.length) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No slides available for this lesson</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Navigation */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getActivityColor(slide?.activity_type || 'default')}>
                {getActivityIcon(slide?.activity_type || 'default')} {slide?.activity_type?.replace('_', ' ').toUpperCase()}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Slide {currentSlide + 1} of {slides.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Trophy className="h-3 w-3 mr-1" />
                {pointsEarned} pts
              </Badge>
              {badgesUnlocked.length > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {badgesUnlocked.length} badges
                </Badge>
              )}
            </div>
          </div>
          
          <Progress 
            value={(currentSlide / (slides.length - 1)) * 100} 
            className="h-2"
          />
        </CardHeader>
      </Card>

      {/* Main Slide Content */}
      <Card className={`${isFullscreen ? 'min-h-dvh' : 'min-h-[400px]'} bg-gradient-to-br from-white to-primary/5`}>
        <CardHeader className="border-b border-primary/10">
          <CardTitle className="text-2xl text-center text-primary">
            {slide?.title}
          </CardTitle>
          
          {/* Timer */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button size="sm" variant="outline" onClick={resetTimer}>
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Slide Content */}
          <div className="prose prose-lg max-w-none text-center">
            <div className="whitespace-pre-wrap text-lg leading-relaxed">
              {slide?.content}
            </div>
          </div>

          {/* Interactive Elements */}
          {slide?.interactive_elements && slide.interactive_elements.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Interactive Elements
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slide.interactive_elements.map((element, index) => (
                  <Card key={index} className="p-3 bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{element}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Gamification Elements */}
          {slide?.gamification && (
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span><strong>{slide.gamification.points_possible}</strong> points available</span>
                  </div>
                  {slide.gamification.badges && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span><strong>{slide.gamification.badges.length}</strong> badges to unlock</span>
                    </div>
                  )}
                  {slide.gamification.challenges && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span><strong>{slide.gamification.challenges.length}</strong> challenges</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teacher Notes */}
          {slide?.teacher_notes && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Teacher Notes
                </h4>
                <p className="text-sm text-blue-800">{slide.teacher_notes}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={prevSlide} 
              disabled={currentSlide === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {/* Slide Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-md">
              {slides.map((_, index) => (
                <Button
                  key={index}
                  onClick={() => goToSlide(index)}
                  variant={currentSlide === index ? "default" : "outline"}
                  size="sm"
                  className="min-w-[40px]"
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            <Button 
              onClick={nextSlide} 
              disabled={currentSlide === slides.length - 1}
              variant="outline"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Progress Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{currentSlide + 1}</div>
              <div className="text-xs text-muted-foreground">Current Slide</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{pointsEarned}</div>
              <div className="text-xs text-muted-foreground">Points Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{badgesUnlocked.length}</div>
              <div className="text-xs text-muted-foreground">Badges Unlocked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(((currentSlide + 1) / slides.length) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}