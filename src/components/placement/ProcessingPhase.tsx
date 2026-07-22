import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TypewriterText from './TypewriterText';
import logoWhite from '@/assets/logo-white.png';
import logoDark from '@/assets/logo-dark.png';
import { accentFor } from './hubAccent';
import type { Hub } from './questionBanks';

interface ProcessingPhaseProps {
  onComplete: () => void;
  isPlayground?: boolean;
  hub?: Hub;
}

const HUB_RING_COLOR: Record<Hub, string> = {
  playground: 'border-orange-400',
  academy: 'border-violet-400',
  professional: 'border-emerald-400',
};

const HUB_GLOW: Record<Hub, string> = {
  playground: 'shadow-[0_0_40px_rgba(254,106,47,0.35)] border-orange-200 bg-white',
  academy: 'shadow-[0_0_40px_rgba(139,92,246,0.4)] border-white/20 bg-white/10',
  professional: 'shadow-[0_0_40px_rgba(5,150,105,0.4)] border-white/20 bg-white/10',
};

const ProcessingPhase = ({ onComplete, isPlayground = false, hub }: ProcessingPhaseProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 4000;
    const interval = 50;
    const step = 100 / (duration / interval);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= 100) {
        setProgress(100);
        clearInterval(timer);
        setTimeout(onComplete, 500);
      } else {
        setProgress(current);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  const resolvedHub: Hub = hub ?? (isPlayground ? 'playground' : 'academy');
  const isPg = resolvedHub === 'playground';
  const accent = accentFor(resolvedHub);
  const ringColor = HUB_GLOW[resolvedHub];
  const pulseBorder = HUB_RING_COLOR[resolvedHub];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div className={`w-24 h-24 rounded-full backdrop-blur-xl border flex items-center justify-center ${ringColor}`}>
          <img
            src={isPg ? logoDark : logoWhite}
            alt="EnglEuphoria"
            className="h-10 w-auto"
          />
        </div>
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`absolute inset-0 rounded-full border-2 ${pulseBorder} pointer-events-none`}
        />
      </motion.div>

      <div className={`text-center text-lg ${isPg ? 'text-slate-700' : 'text-white'}`}>
        <TypewriterText text="Generating your personalized learning path..." speed={40} />
      </div>

      <div className="w-full max-w-sm">
        <div className={`backdrop-blur-xl border rounded-full h-3 overflow-hidden ${isPg ? 'bg-orange-100 border-orange-200' : 'bg-white/10 border-white/20'}`}>
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${accent.progress}`}
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
        <p className={`text-xs text-center mt-2 ${isPg ? 'text-slate-500' : 'text-white/50'}`}>{Math.round(progress)}%</p>
      </div>
    </div>
  );
};

export default ProcessingPhase;
