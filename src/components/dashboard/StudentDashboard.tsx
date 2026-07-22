import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  Zap,
  Clock,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Star,
  Calendar,
  Play,
  Target,
  Award,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface SkillRingProps {
  skill: string;
  progress: number;
  level: string;
  icon: React.ReactNode;
}

function SkillRing({ skill, progress, level, icon }: SkillRingProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="p-6 border-2 border-brand-200 hover:border-brand-300 transition-all duration-200 text-center">
      <div className="relative inline-block mb-4">
        <svg width="100" height="100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="hsl(var(--brand-100))"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="hsl(var(--brand-500))"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-brand-600">
            {icon}
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-foreground">{skill}</h3>
      <p className="text-sm text-muted-foreground">{level} • {progress}%</p>
    </Card>
  );
}

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
}

function AchievementBadge({ title, description, icon, earned, progress }: AchievementBadgeProps) {
  return (
    <Card className={`p-4 border-2 transition-all duration-200 hover:scale-105 ${
      earned 
        ? 'border-brand-300 bg-gradient-to-br from-brand-50 to-brand-100' 
        : 'border-brand-200 bg-brand-50/50 opacity-60'
    }`}>
      <div className="text-center">
        <div className={`p-3 rounded-2xl mx-auto mb-3 w-fit ${
          earned ? 'bg-brand-500 text-white' : 'bg-brand-200 text-brand-400'
        }`}>
          {icon}
        </div>
        <h4 className="font-semibold text-sm text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {!earned && progress && (
          <div className="mt-2">
            <Progress value={progress} className="h-1 bg-brand-200" />
            <p className="text-xs text-brand-600 mt-1">{progress}%</p>
          </div>
        )}
      </div>
    </Card>
  );
}

export function StudentDashboard() {
  const [currentXP] = useState(2750);
  const [levelXP] = useState(3000);
  const [currentLevel] = useState('B1');
  const [streakDays] = useState(7);

  const skillsData = [
    { skill: 'Reading', progress: 78, level: 'B2', icon: <BookOpen className="w-6 h-6" /> },
    { skill: 'Listening', progress: 65, level: 'B1', icon: <Headphones className="w-6 h-6" /> },
    { skill: 'Speaking', progress: 58, level: 'B1', icon: <Mic className="w-6 h-6" /> },
    { skill: 'Writing', progress: 71, level: 'B1', icon: <PenTool className="w-6 h-6" /> }
  ];

  const achievements = [
    {
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: <Star className="w-5 h-5" />,
      earned: true
    },
    {
      title: 'Week Warrior',
      description: '7-day learning streak',
      icon: <Zap className="w-5 h-5" />,
      earned: true
    },
    {
      title: 'Grammar Master',
      description: 'Perfect score on grammar quiz',
      icon: <Trophy className="w-5 h-5" />,
      earned: false,
      progress: 85
    },
    {
      title: 'Conversation King',
      description: 'Complete 10 speaking exercises',
      icon: <Mic className="w-5 h-5" />,
      earned: false,
      progress: 60
    }
  ];

  const progressPercentage = (currentXP / levelXP) * 100;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-surface to-brand-100">
      {/* Hero Progress Section */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white p-8 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Welcome back, Alex!</h1>
              <p className="text-brand-100 mt-2">Continue your English learning journey</p>
              
              {/* XP Progress Bar */}
              <div className="mt-6 bg-white/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current Level: {currentLevel}</span>
                  <span className="text-sm">{currentXP} / {levelXP} XP</span>
                </div>
                <div className="bg-white/30 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-brand-100 mt-2">250 XP to reach B2 level!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 ml-8">
              <div className="text-center">
                <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold text-xl">{streakDays}</span>
                </div>
                <p className="text-xs text-brand-100">Day Streak</p>
              </div>
              
              <Button 
                size="lg" 
                className="bg-white text-brand-600 hover:bg-brand-50 hover:text-brand-700 font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Continue Learning
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Cards */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Today's Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-2 border-brand-200 hover:border-brand-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Live Class</h3>
                      <p className="text-muted-foreground">Conversation Practice</p>
                    </div>
                    <Badge className="bg-brand-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      2:00 PM
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Practice everyday conversations with your classmates
                  </p>
                  <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Join Class
                  </Button>
                </Card>

                <Card className="p-6 border-2 border-brand-200 hover:border-brand-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Assignment Due</h3>
                      <p className="text-muted-foreground">Grammar Exercise</p>
                    </div>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                      Due Today
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete the past tense exercises
                  </p>
                  <Button variant="outline" className="w-full border-brand-300 text-brand-600 hover:bg-brand-50">
                    <Target className="w-4 h-4 mr-2" />
                    Start Assignment
                  </Button>
                </Card>
              </div>
            </div>

            {/* Skills Progress */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {skillsData.map((skill, index) => (
                  <SkillRing key={index} {...skill} />
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <Card className="p-6 border-2 border-brand-200">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Recent Feedback</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-brand-50 rounded-xl">
                  <div className="p-2 bg-brand-500 rounded-full text-white">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Great improvement in pronunciation!</p>
                    <p className="text-sm text-muted-foreground">Speaking Exercise • Yesterday</p>
                    <p className="text-sm text-brand-600 mt-1">Keep practicing the 'th' sound</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-brand-50 rounded-xl">
                  <div className="p-2 bg-brand-500 rounded-full text-white">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Excellent essay structure</p>
                    <p className="text-sm text-muted-foreground">Writing Assignment • 2 days ago</p>
                    <p className="text-sm text-brand-600 mt-1">Focus on expanding vocabulary</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="p-6 border-2 border-brand-200">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <AchievementBadge key={index} {...achievement} />
                ))}
              </div>
            </Card>

            {/* Quick Practice */}
            <Card className="p-6 border-2 border-brand-200">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Quick Practice</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start bg-brand-500 hover:bg-brand-600 text-white" 
                  size="lg"
                >
                  <Zap className="w-5 h-5 mr-3" />
                  60-Second Vocab Quiz
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-brand-300 text-brand-600 hover:bg-brand-50" 
                  size="lg"
                >
                  <Mic className="w-5 h-5 mr-3" />
                  Pronunciation Practice
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-brand-300 text-brand-600 hover:bg-brand-50" 
                  size="lg"
                >
                  <Headphones className="w-5 h-5 mr-3" />
                  Listening Exercise
                </Button>
              </div>
            </Card>

            {/* Study Streak */}
            <Card className="p-6 border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100">
              <div className="text-center">
                <div className="p-4 bg-brand-500 rounded-full w-fit mx-auto mb-4 text-white">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-foreground">Keep it up!</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  You're on a {streakDays}-day learning streak
                </p>
                <div className="mt-4 p-3 bg-white/60 rounded-xl">
                  <p className="text-xs text-muted-foreground">Next milestone</p>
                  <p className="font-semibold text-brand-600">10-day streak badge</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}