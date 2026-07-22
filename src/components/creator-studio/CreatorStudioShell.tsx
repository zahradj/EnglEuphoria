import React from 'react';
import { useLocation } from 'react-router-dom';
import i18n from '@/lib/i18n';
import { CreatorProvider, useCreator } from './CreatorContext';
import { StudioSidebar } from './StudioSidebar';
import { StudioHeader } from './StudioHeader';
import { StudioMobileNav } from './StudioMobileNav';
import { MobileDesktopHint } from './MobileDesktopHint';

/**
 * Force the Content Creator dashboard to always render in English,
 * regardless of the user's chosen platform language. The previous
 * language is restored when the user leaves the studio.
 */
const useForceEnglishLocale = () => {
  React.useEffect(() => {
    const previousLang = i18n.language;
    if (previousLang && !previousLang.toLowerCase().startsWith('en')) {
      void i18n.changeLanguage('en');
    }
    return () => {
      if (previousLang && previousLang !== i18n.language) {
        void i18n.changeLanguage(previousLang);
      }
    };
  }, []);
};
import { BlueprintEngine } from './steps/BlueprintEngine';
import { LibraryManager } from './steps/LibraryManager';
import { TrialCreator } from './steps/TrialCreator';
import { StoryCreator } from './steps/StoryCreator';
import { CharacterCreator } from './characters/CharacterCreator';
import { GameStudioDashboard } from './steps/GameStudioDashboard';
import PlaygroundCreator from '@/pages/PlaygroundCreator';
import AcademyCreator from '@/pages/AcademyCreator';
import SuccessCreator from '@/pages/SuccessCreator';
// Unified Lesson Generator was removed — each hub now owns its own faster
// generation pipeline via GenerateLessonModal inside its hub creator.
import LessonTestingPage from '@/pages/content-creator/LessonTestingPage';
import PlacementAudioWarmPage from '@/pages/admin/PlacementAudioWarmPage';
import VocabGamesAnalytics from '@/pages/content-creator/VocabGamesAnalytics';
import CertificateDesigner from '@/pages/content-creator/CertificateDesigner';

const StudioBody: React.FC = () => {
  useForceEnglishLocale();
  const { currentStep, setCurrentStep } = useCreator();
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname;
    let next: typeof currentStep | null = null;
    if (path.endsWith('/library')) next = 'library';
    else if (path.endsWith('/blueprint')) next = 'blueprint';
    else if (path.endsWith('/trial')) next = 'trial';
    else if (path.endsWith('/story')) next = 'story';
    else if (path.endsWith('/characters')) next = 'characters';
    else if (path.endsWith('/playground-creator')) next = 'playground-creator';
    else if (path.endsWith('/academy-creator')) next = 'academy-creator';
    else if (path.endsWith('/success-creator')) next = 'success-creator';
    else if (path.endsWith('/game-maker') || path.endsWith('/game-studio')) next = 'game-maker';
    // /unified-generator removed — redirect to hub creator picker
    else if (path.endsWith('/unified-generator')) next = 'blueprint';
    else if (path.endsWith('/lesson-tests')) next = 'lesson-tests';
    else if (path.endsWith('/placement-assets') || path.endsWith('/placement-test')) next = 'placement-assets';
    else if (path.endsWith('/vocab-games-analytics')) next = 'vocab-games-analytics';
    else if (path.endsWith('/certificates')) next = 'certificates';
    // Legacy /slide-builder or /slides paths now route to the Academy Creator,
    // which owns the advanced sequencing engine inherited from the Slide Studio.
    else if (path.endsWith('/slide-builder') || path.endsWith('/slides')) next = 'academy-creator';
    if (next && next !== currentStep) setCurrentStep(next);
  }, [currentStep, location.pathname, setCurrentStep]);

  const Step =
    currentStep === 'blueprint' ? BlueprintEngine
    : currentStep === 'playground-creator' ? PlaygroundCreator
    : currentStep === 'academy-creator' ? AcademyCreator
    : currentStep === 'success-creator' ? SuccessCreator
    : currentStep === 'trial' ? TrialCreator
    : currentStep === 'story' ? StoryCreator
    : currentStep === 'characters' ? CharacterCreator
    : currentStep === 'game-maker' ? GameStudioDashboard
    : currentStep === 'unified-generator' ? BlueprintEngine
    : currentStep === 'lesson-tests' ? LessonTestingPage
    : currentStep === 'placement-assets' ? PlacementAudioWarmPage
    : currentStep === 'vocab-games-analytics' ? VocabGamesAnalytics
    : currentStep === 'certificates' ? CertificateDesigner
    : LibraryManager;

  return (
    <div className="flex h-dvh max-h-dvh w-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <StudioSidebar />
      </div>
      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        <StudioHeader />
        <MobileDesktopHint />
        <main
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-100 dark:bg-slate-950 p-3 sm:p-6 pb-32 md:pb-10"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <Step />
          {/* Spacer so the last row is never hidden under the mobile nav */}
          <div aria-hidden className="h-16 md:h-2" />
        </main>
        {/* Mobile bottom nav — visible only on mobile */}
        <StudioMobileNav />
      </div>
    </div>
  );
};

const CreatorStudioShell: React.FC = () => (
  <CreatorProvider>
    <StudioBody />
  </CreatorProvider>
);

export default CreatorStudioShell;
