
import React, { useState, useEffect } from 'react';
import { SpeakingProgress, SpeakingScenario } from '@/types/speaking';
import { speakingPracticeService } from '@/services/speakingPracticeService';
const isSupabaseConfigured = () => true; // Always configured in Engleuphoria deployments
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Image, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { PracticeSession } from './PracticeSession';
import { SpeakingStats } from './SpeakingStats';
import { SpeakingHeader } from './components/SpeakingHeader';
import { PracticeModeCard } from './components/PracticeModeCard';
import { DailyChallenge } from './components/DailyChallenge';
import { LiveAIConversation } from './LiveAIConversation';
import { SpeakingGoals } from './SpeakingGoals';
import { SpeakingLevelIndicator } from './SpeakingLevelIndicator';

export const SpeakingPracticeTab = () => {
  const [progress, setProgress] = useState<SpeakingProgress | null>(null);
  const [scenarios, setScenarios] = useState<SpeakingScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<SpeakingScenario | null>(null);
  const [activeMode, setActiveMode] = useState<'menu' | 'practice' | 'live_ai'>('menu');
  const [todaysSpeakingTime, setTodaysSpeakingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSpeakingPracticeData();
  }, []);

  const loadSpeakingPracticeData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we're in demo mode
      const demoMode = !isSupabaseConfigured();
      setIsDemoMode(demoMode);
      
      if (demoMode) {
      }
      
      // Load data in parallel
      await Promise.all([
        loadUserProgress(),
        loadScenarios(),
        loadTodaysSpeakingTime()
      ]);
      
    } catch (err) {
      console.error('Error loading speaking practice data:', err);
      setError('Failed to load speaking practice data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const userProgress = await speakingPracticeService.getUserProgress();
      if (!userProgress) {
        const newProgress = await speakingPracticeService.initializeProgress();
        setProgress(newProgress);
      } else {
        setProgress(userProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      // Don't throw here, just log the error
    }
  };

  const loadScenarios = async () => {
    try {
      // Use level-based scenario retrieval if user has progress
      const levelBasedScenarios = progress 
        ? await speakingPracticeService.getStudentAppropriateScenarios()
        : await speakingPracticeService.getScenarios();
      
      setScenarios(levelBasedScenarios);
      
      if (levelBasedScenarios.length === 0) {
        console.warn('No appropriate speaking scenarios found for current level');
      }
    } catch (error) {
      console.error('Error loading scenarios:', error);
      // Fallback to all scenarios if level-based fails
      try {
        const fallbackScenarios = await speakingPracticeService.getScenarios();
        setScenarios(fallbackScenarios);
      } catch (fallbackError) {
        // If both fail, set empty array to prevent further errors
        setScenarios([]);
      }
    }
  };

  const loadTodaysSpeakingTime = async () => {
    try {
      const time = await speakingPracticeService.getTodaysSpeakingTime();
      setTodaysSpeakingTime(time);
    } catch (error) {
      console.error('Error loading today\'s speaking time:', error);
      // Don't throw here, just log the error
    }
  };

  const handleStartPractice = (scenario: SpeakingScenario, isLiveChat = false) => {
    setSelectedScenario(scenario);
    setActiveMode(isLiveChat ? 'live_ai' : 'practice');
  };

  const handleSessionComplete = async (sessionData: any) => {
    await loadUserProgress();
    await loadTodaysSpeakingTime();
    setActiveMode('menu');
    setSelectedScenario(null);
    
    toast({
      title: "Great job! 🎉",
      description: `You earned ${sessionData.xp_earned} XP for completing "${sessionData.scenario_name}"!`
    });
  };

  const getPracticeTypeScenarios = (type: string) => {
    return scenarios.filter(s => s.type === type);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading speaking practice...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <SpeakingHeader />
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (activeMode === 'practice' && selectedScenario) {
    return (
      <PracticeSession
        scenario={selectedScenario}
        onComplete={handleSessionComplete}
        onBack={() => setActiveMode('menu')}
      />
    );
  }

  if (activeMode === 'live_ai') {
    return (
      <LiveAIConversation
        scenario={selectedScenario}
        onComplete={handleSessionComplete}
        onBack={() => setActiveMode('menu')}
      />
    );
  }

  const practiceModesConfig = [
    {
      title: '🎙️ Live AI Chat',
      icon: MessageCircle,
      description: 'Have real-time conversations with AI tutors adapted to your level',
      scenarios: scenarios, // All scenarios for live chat
      borderColor: 'hover:border-red-300',
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-700',
      isLiveChat: true
    },
    {
      title: '🎭 Role Play',
      icon: MessageCircle,
      description: 'Practice real-life conversations like ordering food or meeting new people',
      scenarios: getPracticeTypeScenarios('role_play'),
      borderColor: 'hover:border-blue-300',
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-700'
    },
    {
      title: '🧠 Picture Talk',
      icon: Image,
      description: 'Describe pictures and practice your vocabulary and speaking skills',
      scenarios: getPracticeTypeScenarios('picture_talk'),
      borderColor: 'hover:border-green-300',
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      titleColor: 'text-green-700'
    },
    {
      title: '❓ Random Questions',
      icon: HelpCircle,
      description: 'Answer fun questions about yourself, your day, and your interests',
      scenarios: getPracticeTypeScenarios('random_questions'),
      borderColor: 'hover:border-purple-300',
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      titleColor: 'text-purple-700'
    }
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <SpeakingHeader />

        {isDemoMode && (
          <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 animate-fade-in">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You're currently using demo mode. Your progress is saved locally and AI features may be limited.
            </AlertDescription>
          </Alert>
        )}

        <div className="animate-fade-in animation-delay-200">
          <SpeakingStats 
            progress={progress}
            todaysSpeakingTime={todaysSpeakingTime}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="animate-fade-in animation-delay-400">
            <DailyChallenge todaysSpeakingTime={todaysSpeakingTime} />
          </div>
          
          {progress && (
            <div className="animate-fade-in animation-delay-500">
              <SpeakingLevelIndicator 
                currentLevel={progress.current_cefr_level}
                speakingXP={progress.speaking_xp}
              />
            </div>
          )}
        </div>

        <div className="animate-fade-in animation-delay-600">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Choose Your Practice Mode
            </h2>
            <p className="text-center text-muted-foreground">
              Select the type of speaking practice that matches your learning goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {practiceModesConfig.map((mode, index) => (
              <div 
                key={index} 
                className="animate-fade-in" 
                style={{ animationDelay: `${(index * 150) + 800}ms` }}
              >
                <PracticeModeCard
                  title={mode.title}
                  icon={mode.icon}
                  description={mode.description}
                  scenarios={mode.scenarios}
                  borderColor={mode.borderColor}
                  iconBgColor={mode.iconBgColor}
                  iconColor={mode.iconColor}
                  titleColor={mode.titleColor}
                  isLiveChat={mode.isLiveChat}
                  onStartPractice={handleStartPractice}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="animate-fade-in animation-delay-1000">
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">💡</span>
                </div>
                Quick Tips for Better Practice
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    🎯
                  </div>
                  <div>
                    <div className="font-medium text-blue-700">Set Goals</div>
                    <div className="text-muted-foreground">Practice for at least 5 minutes daily</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    🎤
                  </div>
                  <div>
                    <div className="font-medium text-green-700">Speak Clearly</div>
                    <div className="text-muted-foreground">Use a quiet environment with good audio</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    📈
                  </div>
                  <div>
                    <div className="font-medium text-purple-700">Track Progress</div>
                    <div className="text-muted-foreground">Review your speaking analytics regularly</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
