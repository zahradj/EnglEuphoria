import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';
import PipMascot from './PipMascot';
import { ConfettiEffect } from '@/components/gamification/ConfettiEffect';
import { Trophy, Clock, Target, ArrowRight, Zap, Star, Award, Loader2, Check, BookOpenCheck, Mic, Headphones, BookText, PenLine, Sparkles } from 'lucide-react';
import type { HomeworkTask } from '@/coherence/types';

const MODALITY_ICON: Record<HomeworkTask['modality'], React.ReactNode> = {
  speaking: <Mic size={14} />,
  listening: <Headphones size={14} />,
  reading: <BookText size={14} />,
  writing: <PenLine size={14} />,
  mixed: <Sparkles size={14} />,
};

interface LessonRewardPageProps {
  hub: HubType;
  xpEarned: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  homeworkPack?: import('@/coherence/types').HomeworkPack | null;
  onOpenHomework?: () => void;
  onClaim?: () => Promise<void> | void;
  onExit: () => void;
}

function useCountUp(target: number, duration = 1500, delay = 400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      tick();
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}

function AccuracyRing({ percentage, color, size = 100 }: { percentage: number; color: string; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={6} className="text-muted/20" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export default function LessonRewardPage({
  hub, xpEarned, correctCount, totalQuestions, timeSpentSeconds, homeworkPack, onOpenHomework, onClaim, onExit,
}: LessonRewardPageProps) {
  const config = HUB_CONFIGS[hub];
  const animatedXp = useCountUp(xpEarned, 1500, 500);
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
  const animatedAccuracy = useCountUp(accuracy, 1200, 800);
  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;

  const [claimState, setClaimState] = useState<'idle' | 'saving' | 'claimed'>('idle');
  const [showConfetti, setShowConfetti] = useState(true);

  const handleClaim = async () => {
    if (claimState === 'saving') return;
    if (claimState === 'claimed') {
      onExit();
      return;
    }
    setClaimState('saving');
    try {
      await onClaim?.();
      setClaimState('claimed');
      setShowConfetti(false);
      // Re-trigger a quick burst on successful claim
      requestAnimationFrame(() => setShowConfetti(true));
      toast.success('Rewards claimed! Progress saved 🎉');
    } catch (err: any) {
      setClaimState('idle');
      toast.error(err?.message || 'Could not save progress. Please try again.');
    }
  };

  const hubStyles = {
    playground: {
      bg: 'bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50',
      card: 'bg-white/90 border-2 border-amber-200/60',
      xpGlow: '0 0 30px rgba(255, 159, 28, 0.4)',
      accent: '#FF9F1C',
      buttonBg: 'bg-gradient-to-r from-emerald-400 to-green-500',
      buttonShadow: '0 4px 0 #16a34a',
      title: '🌟 Awesome Job!',
      subtitle: 'Pip is SO proud of you!',
    },
    academy: {
      bg: 'bg-gradient-to-b from-indigo-950 via-slate-950 to-indigo-950',
      card: 'bg-indigo-900/60 border border-indigo-500/30',
      xpGlow: '0 0 30px rgba(168, 85, 247, 0.5)',
      accent: '#A855F7',
      buttonBg: 'bg-gradient-to-r from-indigo-500 to-violet-500',
      buttonShadow: '0 4px 0 #4338ca',
      title: '⚡ Mission Complete!',
      subtitle: 'You crushed it. Level up!',
    },
    professional: {
      bg: 'bg-gradient-to-b from-slate-50 to-gray-100',
      card: 'bg-white border border-slate-200',
      xpGlow: 'none',
      accent: '#10B981',
      buttonBg: 'bg-slate-900',
      buttonShadow: '0 4px 0 #1e293b',
      title: 'Session Complete',
      subtitle: 'Progress recorded successfully.',
    },
  };

  const style = hubStyles[hub];

  return (
    <div className={`flex flex-col items-center justify-center min-h-[100dvh] px-4 ${style.bg}`}>
      <ConfettiEffect trigger={showConfetti} />
      <div className="w-full max-w-[500px] flex flex-col items-center gap-6">

        {/* Hero */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          {hub === 'playground' && <PipMascot size={100} animation="celebrate" />}
          {hub === 'academy' && (
            <div className="text-7xl" style={{ filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.6))' }}>⚡</div>
          )}
          {hub === 'professional' && (
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <Award className="w-8 h-8 text-emerald-600" />
            </div>
          )}
        </motion.div>

        {/* Title */}
        <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-3xl font-bold" style={{ color: style.accent }}>{style.title}</h1>
          <p className="text-sm mt-1" style={{ color: config.colorPalette.text, opacity: 0.7 }}>{style.subtitle}</p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div className="w-full grid grid-cols-2 gap-3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className={`col-span-2 rounded-2xl p-6 flex flex-col items-center gap-2 ${style.card}`} style={{ boxShadow: style.xpGlow }}>
            <div className="flex items-center gap-2 text-sm font-medium opacity-60" style={{ color: config.colorPalette.text }}>
              {hub === 'playground' ? <Star size={16} /> : hub === 'academy' ? <Zap size={16} /> : <Trophy size={16} />}
              XP Earned
            </div>
            <motion.span className="text-5xl font-black tabular-nums" style={{ color: style.accent }}>+{animatedXp}</motion.span>
          </div>

          <div className={`rounded-2xl p-4 flex flex-col items-center gap-2 ${style.card}`}>
            <span className="text-xs font-medium opacity-50 flex items-center gap-1" style={{ color: config.colorPalette.text }}>
              <Target size={12} /> Accuracy
            </span>
            <div className="relative">
              <AccuracyRing percentage={accuracy} color={style.accent} size={80} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: style.accent }}>{animatedAccuracy}%</span>
              </div>
            </div>
            <span className="text-xs opacity-40" style={{ color: config.colorPalette.text }}>{correctCount}/{totalQuestions} correct</span>
          </div>

          <div className={`rounded-2xl p-4 flex flex-col items-center gap-2 ${style.card}`}>
            <span className="text-xs font-medium opacity-50 flex items-center gap-1" style={{ color: config.colorPalette.text }}>
              <Clock size={12} /> Time
            </span>
            <span className="text-2xl font-bold tabular-nums" style={{ color: config.colorPalette.text }}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-xs opacity-40" style={{ color: config.colorPalette.text }}>minutes</span>
          </div>
        </motion.div>

        {/* Homework Section — inline under the auto-summary so teachers see tasks immediately */}
        {homeworkPack && homeworkPack.tasks.length > 0 && (
          <motion.section
            className={`w-full rounded-3xl p-5 ${style.card}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            aria-label="Homework section"
          >
            <header className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ background: style.accent }}
                >
                  <BookOpenCheck size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold" style={{ color: style.accent }}>
                    {hub === 'playground' ? '🎒 Homework Together' : hub === 'academy' ? '🎯 Mission Homework' : 'Homework Brief'}
                  </h2>
                  <p className="text-[11px] opacity-60 flex items-center gap-1.5" style={{ color: config.colorPalette.text }}>
                    <Clock size={11} /> ~{homeworkPack.total_minutes} min · {homeworkPack.tasks.length} task{homeworkPack.tasks.length === 1 ? '' : 's'} · bound to today's lesson
                  </p>
                </div>
              </div>
            </header>

            <ol className="space-y-2">
              {homeworkPack.tasks.map((task, idx) => (
                <li
                  key={task.id}
                  className="rounded-2xl p-3 bg-white/70 dark:bg-white/5 border border-current/10 flex gap-3 items-start"
                >
                  <div
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                    style={{ background: style.accent }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${style.accent}22`, color: style.accent }}
                      >
                        {MODALITY_ICON[task.modality]} {task.modality}
                      </span>
                      <span className="text-[10px] opacity-50">~{task.estimated_minutes}m</span>
                      <span className="text-[10px] opacity-40 uppercase tracking-wide">{task.type.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm leading-snug" style={{ color: config.colorPalette.text }}>{task.prompt}</p>
                  </div>
                </li>
              ))}
            </ol>

            {onOpenHomework && (
              <button
                onClick={onOpenHomework}
                className="w-full mt-3 py-2.5 rounded-xl font-bold text-sm border-2"
                style={{ color: style.accent, borderColor: style.accent }}
              >
                🎒 Do Homework Together
              </button>
            )}
          </motion.section>
        )}

        {/* CTA — Claim Rewards (saves to Supabase) → Back to Dashboard */}
        <motion.button
          onClick={handleClaim}
          disabled={claimState === 'saving'}
          className={`w-full py-4 rounded-2xl font-bold text-lg text-white tracking-wide uppercase ${style.buttonBg} disabled:opacity-80`}
          style={{ boxShadow: style.buttonShadow }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: claimState === 'saving' ? 1 : 0.97 }}
        >
          <span className="flex items-center justify-center gap-2">
            {claimState === 'saving' && (<><Loader2 size={20} className="animate-spin" /> Saving…</>)}
            {claimState === 'idle' && (<>Claim Rewards <Trophy size={20} /></>)}
            {claimState === 'claimed' && (<><Check size={20} /> Back to Dashboard <ArrowRight size={20} /></>)}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
