import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { RewardPayload } from '@/hooks/useLiveClassroom';

interface Props {
  registerRewardHandler: (h: (p: RewardPayload) => void) => () => void;
}

interface PopItem { id: number; xp: number }

/**
 * Localized XP pop-up. Fires when teacher sends a reward; pairs with
 * RewardFx (confetti). Auto-dismisses after 1.4s.
 */
export function XpPopup({ registerRewardHandler }: Props) {
  const [items, setItems] = useState<PopItem[]>([]);

  useEffect(() => {
    const unsub = registerRewardHandler(p => {
      const id = Date.now() + Math.random();
      setItems(arr => [...arr, { id, xp: p.xp }]);
      window.setTimeout(() => setItems(arr => arr.filter(i => i.id !== id)), 1400);
    });
    return unsub;
  }, [registerRewardHandler]);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      <AnimatePresence>
        {items.map(i => (
          <motion.div
            key={i.id}
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: -40, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white shadow-2xl font-bold text-lg"
          >
            <Sparkles className="h-5 w-5" />
            +{i.xp} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
