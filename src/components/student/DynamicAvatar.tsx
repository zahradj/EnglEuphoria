import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentInventory } from '@/hooks/useStudentInventory';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface DynamicAvatarProps {
  studentId: string;
  hub: 'playground' | 'academy' | 'professional';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSparkle?: boolean;
}

const HUB_BASE = {
  playground: { emoji: '🐧', label: 'Pip', bg: 'from-amber-400/20 to-orange-400/20', ring: 'ring-amber-400/50' },
  academy: { emoji: '🤖', label: 'Neon', bg: 'from-violet-400/20 to-cyan-400/20', ring: 'ring-cyan-400/50' },
  professional: { emoji: '👤', label: 'Pro', bg: 'from-slate-400/20 to-emerald-400/20', ring: 'ring-emerald-400/50' },
};

const SIZE_MAP = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
};

export const DynamicAvatar: React.FC<DynamicAvatarProps> = ({
  studentId,
  hub,
  size = 'lg',
  className,
  showSparkle = false,
}) => {
  const { equippedItems } = useStudentInventory(studentId);
  const base = HUB_BASE[hub];
  const sizeClass = SIZE_MAP[size];

  return (
    <motion.div
      className={cn('relative', sizeClass, className)}
      animate={showSparkle ? { scale: [1, 1.05, 1] } : undefined}
      transition={showSparkle ? { duration: 0.6, ease: 'easeInOut' } : undefined}
    >
      {/* Base character layer */}
      <div
        className={cn(
          'w-full h-full rounded-3xl bg-gradient-to-br flex items-center justify-center',
          'ring-2 backdrop-blur-sm overflow-hidden',
          base.bg,
          base.ring,
        )}
      >
        <span className={cn(
          'select-none',
          size === 'sm' ? 'text-3xl' : size === 'md' ? 'text-5xl' : 'text-7xl',
        )}>
          {base.emoji}
        </span>
      </div>

      {/* Equipped accessory overlays */}
      <AnimatePresence>
        {equippedItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 120 }}
            className="absolute z-20 pointer-events-none"
            style={{
              top: item.offsetY,
              left: item.offsetX,
              width: '50%',
              height: '50%',
            }}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sparkle burst effect */}
      {showSparkle && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`sp-${i}`}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [1, 0.7, 0],
                x: Math.cos((i / 6) * Math.PI * 2) * 40,
                y: Math.sin((i / 6) * Math.PI * 2) * 40,
              }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className="absolute w-2 h-2 bg-primary rounded-full z-30"
              style={{ top: '50%', left: '50%' }}
            />
          ))}
        </>
      )}

      {/* Equipped count badge */}
      {equippedItems.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -right-1 z-30 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md"
        >
          <span className="text-[10px] font-bold text-primary-foreground">
            {equippedItems.length}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};
