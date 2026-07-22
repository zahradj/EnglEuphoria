import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useStudentLevel, getStudentDashboardRoute, StudentLevel } from '@/hooks/useStudentLevel';
import { LanguageStep, LanguageCode } from './steps/LanguageStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { InterestsStep } from './steps/InterestsStep';
import { LearningStyleStep } from './steps/LearningStyleStep';
import { QuickAssessmentStep } from './steps/QuickAssessmentStep';
import { LearningPathStep } from './steps/LearningPathStep';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CompanionSelector } from '@/components/companions/CompanionSelector';
import type { Companion } from '@/constants/companions';

export interface OnboardingData {
  language: LanguageCode;
  interests: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | null;
  assessmentScore: number;
  learningPath: any | null;
}

const StudentOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { studentLevel, refetch } = useStudentLevel();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [savingLang, setSavingLang] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    language: 'en',
    interests: [],
    learningStyle: null,
    assessmentScore: 0,
    learningPath: null,
  });

  const steps = ['Language', 'Welcome', 'Interests', 'Learning Style', 'Quick Check', 'Companion', 'Your Path'];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const handleLanguageSelected = async (lang: LanguageCode) => {
    setOnboardingData((prev) => ({ ...prev, language: lang }));
    if (!user?.id) {
      handleNext();
      return;
    }
    setSavingLang(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ preferred_language: lang })
        .eq('id', user.id);
      if (error) throw error;
      toast.success(t('sd.lang.saved', 'Language saved'));
      handleNext();
    } catch (e) {
      console.error('Error saving language:', e);
      // Still let them continue; preference is persisted in localStorage by i18n
      handleNext();
    } finally {
      setSavingLang(false);
    }
  };

  const handleInterestsSelected = (interests: string[]) => {
    setOnboardingData((p) => ({ ...p, interests }));
    handleNext();
  };
  const handleLearningStyleComplete = (learningStyle: 'visual' | 'auditory' | 'kinesthetic') => {
    setOnboardingData((p) => ({ ...p, learningStyle }));
    handleNext();
  };
  const handleAssessmentComplete = (score: number) => {
    setOnboardingData((p) => ({ ...p, assessmentScore: score }));
    handleNext();
  };
  const handleLearningPathGenerated = (path: any) => {
    setOnboardingData((p) => ({ ...p, learningPath: path }));
  };

  const handleComplete = async () => {
    if (!user?.id || !studentLevel) return;
    setIsLoading(true);
    try {
      if (onboardingData.learningPath) {
        await supabase.from('personalized_learning_paths').insert({
          student_id: user.id,
          path_name: onboardingData.learningPath.path_name || `${studentLevel} Learning Journey`,
          total_steps: onboardingData.learningPath.total_lessons || 20,
          path_data: onboardingData.learningPath,
          learning_style: 'mixed',
          difficulty_preference: 'adaptive',
          estimated_completion_days: 28,
          ai_generated: true,
        });
      }
      await supabase.from('student_profiles')
        .update({
          onboarding_completed: true,
          interests: onboardingData.interests,
          learning_style: onboardingData.learningStyle,
          placement_test_score: onboardingData.assessmentScore,
        })
        .eq('user_id', user.id);
      await refetch();
      const dashboardRoute = getStudentDashboardRoute(studentLevel);
      navigate(dashboardRoute, { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!studentLevel) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background to-muted">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-primary">{steps[currentStep]}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {currentStep === 0 && (
          <LanguageStep
            initial={onboardingData.language}
            onComplete={handleLanguageSelected}
            isSaving={savingLang}
          />
        )}
        {currentStep === 1 && <WelcomeStep studentLevel={studentLevel} onNext={handleNext} />}
        {currentStep === 2 && (
          <InterestsStep
            studentLevel={studentLevel}
            selectedInterests={onboardingData.interests}
            onComplete={handleInterestsSelected}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <LearningStyleStep
            studentLevel={studentLevel}
            onComplete={handleLearningStyleComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 4 && (
          <QuickAssessmentStep
            studentLevel={studentLevel}
            onComplete={handleAssessmentComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 5 && (
          <CompanionSelector
            hub={studentLevel === 'playground' ? 'playground' : 'academy'}
            onComplete={(_c: Companion) => handleNext()}
            onBack={handleBack}
          />
        )}
        {currentStep === 6 && (
          <LearningPathStep
            studentLevel={studentLevel}
            interests={onboardingData.interests}
            onPathGenerated={handleLearningPathGenerated}
            onComplete={handleComplete}
            onBack={handleBack}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default StudentOnboardingFlow;
