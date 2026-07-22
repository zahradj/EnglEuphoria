import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Target, Award } from 'lucide-react';

interface AchievementPopupProps {
  show: boolean;
  message: string;
  type?: 'success' | 'perfect' | 'streak' | 'complete';
  onClose?: () => void;
}

const icons = {
  success: Star,
  perfect: Trophy,
  streak: Target,
  complete: Award
};

const colors = {
  success: 'from-green-400 to-emerald-500',
  perfect: 'from-yellow-400 to-orange-500',
  streak: 'from-blue-400 to-cyan-500',
  complete: 'from-purple-400 to-pink-500'
};

export function AchievementPopup({ show, message, type = 'success', onClose }: AchievementPopupProps) {
  const Icon = icons[type];
  const gradient = colors[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
          onAnimationComplete={() => {
            setTimeout(() => onClose?.(), 2500);
          }}
        >
          <div className={`bg-gradient-to-r ${gradient} rounded-2xl shadow-2xl p-6 min-w-[300px]`}>
            <div className="flex items-center gap-4 text-white">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.6 }}
              >
                <Icon className="w-8 h-8" />
              </motion.div>
              <div>
                <p className="font-bold text-lg">{message}</p>
                <p className="text-sm opacity-90">Keep up the great work!</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
