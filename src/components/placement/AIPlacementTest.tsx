import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import DemographicsPhase from './DemographicsPhase';
import TestPhase from './TestPhase';
import type { TestResult } from './TestPhase';
import ComprehensivePhase from './comprehensive/ComprehensivePhase';
import ProcessingPhase from './ProcessingPhase';
import WelcomePhase from './WelcomePhase';
import PlacementChoice from '@/pages/placement/PlacementChoice';
import { usePlacementTest } from '@/hooks/usePlacementTest';
import { Logo } from '@/components/Logo';
import { CursorTrail } from '@/components/landing/CursorTrail';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import type { Hub } from './questionBanks';

type HubIndex = 0 | 1 | 2;

// Maps the resolved hub to the same palette index used by the homepage
// CursorTrail: 0 = Playground, 1 = Academy, 2 = Professional.
const hubIndex = (hub: Hub): HubIndex => (hub === 'playground' ? 0 : hub === 'academy' ? 1 : 2);

// Strict age brackets per Three-Funnel architecture:
// 4-9 → Playground, 10-17 → Academy, 18+ → Success.
const hubFromAge = (age: number): Hub => {
  if (age > 0 && age < 10) return 'playground';
  if (age >= 10 && age < 18) return 'academy';
  return 'professional';
};

type Phase = 'choice' | 'welcome' | 'demographics' | 'test' | 'processing' | 'complete';
type TestStage = 'mcq' | 'comprehensive';

interface AIPlacementTestProps {
  // When set, this instance is locked to a specific hub funnel
  // (used by /placement/playground, /placement/academy, /placement/success).
  // When unset, demographics → traffic-cop redirect to one of the three.
  forcedHub?: Hub;
}

const hubRoute = (hub: Hub): string =>
  hub === 'playground' ? '/placement/playground'
    : hub === 'academy' ? '/placement/academy'
    : '/placement/success';

const AIPlacementTest = ({ forcedHub }: AIPlacementTestProps = {}) => {
  const navigate = useNavigate();
  const { completeTest } = usePlacementTest();
  const { studentLevel } = useStudentLevel();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('choice');
  const [submittingBeginner, setSubmittingBeginner] = useState(false);
  const [testStage, setTestStage] = useState<TestStage>('mcq');
  const [age, setAge] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [mcqResults, setMcqResults] = useState<TestResult[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Locked-funnel mode: forcedHub wins. Otherwise prefer profile, age fallback.
  const resolvedHub: Hub = forcedHub ?? (studentLevel as Hub | null) ?? hubFromAge(age);
  const isComprehensiveHub = resolvedHub === 'academy' || resolvedHub === 'professional';

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ||
    (user?.user_metadata?.name as string | undefined)?.split(' ')[0] ||
    user?.email?.split('@')[0];

  const selfPlaceBeginner = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in first.');
      return;
    }
    setSubmittingBeginner(true);
    try {
      const { error: userErr } = await supabase
        .from('users')
        .update({ placement_method: 'self_beginner', cefr_level: 'pre-a1' })
        .eq('id', user.id);
      if (userErr) throw userErr;

      try {
        await supabase.from('placement_results').insert({
          student_id: user.id,
          method: 'self_beginner',
          cefr_level: 'pre-a1',
          hub: resolvedHub,
          ability_theta: -3.0,
          standard_error: 1.0,
          items_answered: 0,
          trail: [] as any,
          duration_seconds: 0,
        });
      } catch (trailEx) {
        console.warn('[placement] self-beginner trail insert failed (non-fatal)', trailEx);
      }

      toast.success("Great — we'll start from the basics!");
      navigate('/dashboard/my-path', { replace: true });
    } catch (e) {
      console.error('[placement] self-beginner finalize failed', e);
      toast.error('Could not save. Try again.');
      setSubmittingBeginner(false);
    }
  }, [user, resolvedHub, navigate]);

  const handleDemographicsComplete = (result: { age: number; goal: string; interests: string[] }) => {
    setAge(result.age);
    setInterests(result.interests);

    // Traffic cop: if this isn't already a hub-locked funnel, route the student
    // to the correct isolated test based on age brackets.
    if (!forcedHub) {
      const hub = hubFromAge(result.age);
      navigate(hubRoute(hub), {
        replace: true,
        state: { age: result.age, interests: result.interests, goal: result.goal },
      });
      return;
    }

    setTestStage('mcq');
    setPhase('test');
  };

  // Playground hub → MCQ-only. Academy & Professional → MCQ then 4-skill.
  const handleMcqComplete = (results: TestResult[]) => {
    if (isComprehensiveHub) {
      setMcqResults(results);
      setTestStage('comprehensive');
    } else {
      setTestResults(results);
      setPhase('processing');
    }
  };

  const handleComprehensiveComplete = (results: TestResult[]) => {
    setTestResults([...mcqResults, ...results]);
    setPhase('processing');
  };

  const handleProcessingComplete = async () => {
    try {
      const route = await completeTest(age, testResults, interests);
      setPhase('complete');
      navigate(route, { replace: true });
    } catch (err) {
      console.error('Placement test error:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const themeIndex = hubIndex(resolvedHub);

  // Pre-test choice — Pip the Fox welcome with two paths.
  if (phase === 'choice') {
    return (
      <PlacementChoice
        hub={resolvedHub}
        firstName={firstName}
        onPickBeginner={selfPlaceBeginner}
        onPickTest={() => setPhase('welcome')}
        busy={submittingBeginner}
      />
    );
  }



  return (
    <div className={`relative min-h-dvh bg-gradient-to-br ${
      resolvedHub === 'professional'
        ? 'from-slate-900 via-emerald-900 to-slate-900'
        : resolvedHub === 'academy'
        ? 'from-slate-900 via-purple-900 to-slate-900'
        : 'from-slate-900 via-amber-900 to-slate-900'
    } flex items-center justify-center p-4 overflow-hidden`}>
      {/* Same homepage interactive cursor effect, themed to the active hub */}
      <CursorTrail themeIndex={themeIndex} />

      <div className="relative z-10 w-full max-w-2xl h-[80vh] backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col">
        {/* Header — Engleuphoria brand + language switcher */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="w-10" aria-hidden />
          <Logo size="medium" variant="white" className="pointer-events-none [&_img]:h-7 sm:[&_img]:h-9" />
          <LanguageSwitcher
            variant="ghost"
            size="sm"
            compact
            className="text-white hover:bg-white/10 hover:text-white border border-white/10"
          />
        </div>

        {/* Phase content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="h-full"
              >
                <WelcomePhase hub={resolvedHub} onStart={() => setPhase('demographics')} />
              </motion.div>
            )}

            {phase === 'demographics' && (
              <motion.div
                key="demographics"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="h-full"
              >
                <DemographicsPhase hub={resolvedHub} onComplete={handleDemographicsComplete} />
              </motion.div>
            )}

            {phase === 'test' && (
              <motion.div
                key={`test-${testStage}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="h-full"
              >
                {isComprehensiveHub && testStage === 'comprehensive' ? (
                  <ComprehensivePhase
                    hub={resolvedHub}
                    indexOffset={mcqResults.length}
                    onComplete={(results) => handleComprehensiveComplete(results)}
                  />
                ) : (
                  <TestPhase age={age} hub={resolvedHub} onComplete={handleMcqComplete} />
                )}
              </motion.div>
            )}

            {phase === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <ProcessingPhase hub={resolvedHub} onComplete={handleProcessingComplete} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIPlacementTest;
